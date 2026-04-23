#!/usr/bin/env python3
"""
Full LightGBM ML Pipeline Orchestration Script

Orchestrates the complete ML workflow:
- Extracts data from Azure SQL Transformed.Bank
- Performs train/test split with stratification
- Tunes LightGBM hyperparameters using Optuna
- Trains final model and logs to MLflow
- Evaluates on test set with configurable threshold
- Logs model, parameters, metrics, and artifacts
"""

import argparse
import json
import sys
import time
from datetime import datetime
from pathlib import Path

# Import local modules
from src.data.extract_for_modeling import extract_for_modeling
from src.features.build_features import build_preprocessing_pipeline, get_output_feature_names
from src.models.tune import tune_model

from sklearn.metrics import (
    classification_report,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from lightgbm import LGBMClassifier
import mlflow

# Bootstrap project root path for src imports
project_root = Path(__file__).parent.parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))


def _prepare_target(y_series):
    """Convert yes/no target to 0/1 binary labels."""
    if y_series.dtype == object:
        return (y_series.str.lower() == 'yes').astype(int)
    return y_series


def main(args):
    """
    Execute full ML pipeline with tuning, training, and evaluation.
    
    Parameters
    ----------
    args : argparse.Namespace
        CLI arguments with pipeline configuration
    """
    print("\n" + "="*70)
    print("El Farghaly Bros - LightGBM ML Pipeline")
    print("="*70)
    
    # ========== MLflow Setup ==========
    project_root = Path(__file__).parent.parent
    mlflow_uri = args.mlflow_uri or str(project_root / "mlruns")
    
    print(f"\n[MLflow] Tracking URI: {mlflow_uri}")
    mlflow.set_tracking_uri(mlflow_uri)
    mlflow.set_experiment(args.experiment)
    
    with mlflow.start_run() as run:
        print(f"[MLflow] Run ID: {run.info.run_id}")
        run_id = run.info.run_id
        
        # ========== Data Extraction ==========
        print(f"\n[Data] Extracting from table: {args.table}")
        start_time = time.time()
        df = extract_for_modeling(table_name=args.table)
        extract_time = time.time() - start_time
        
        print(f"[Data] Loaded {len(df)} rows × {len(df.columns)} columns in {extract_time:.2f}s")
        print(f"[Data] Columns: {list(df.columns)}")
        
        # ========== Target Validation ==========
        if args.target not in df.columns:
            raise ValueError(
                f"Target column '{args.target}' not found. "
                f"Available columns: {list(df.columns)}"
            )
        
        print(f"[Data] Target column: {args.target}")
        print(f"[Data] Target distribution:\n{df[args.target].value_counts()}")
        
        # ========== Target Preparation ==========
        y = _prepare_target(df[args.target].copy())
        X = df.drop(columns=[args.target])
        
        print(f"[Data] X shape: {X.shape}, y shape: {y.shape}")
        print(f"[Data] y (after binary conversion): {y.value_counts().to_dict()}")
        
        # ========== Train/Test Split ==========
        print(f"\n[Split] Test size: {args.test_size}, Random state: 30")
        X_train, X_test, y_train, y_test = train_test_split(
            X, y,
            test_size=args.test_size,
            random_state=30,
            stratify=y
        )
        print(f"[Split] Train: {X_train.shape}, Test: {X_test.shape}")
        
        # ========== Hyperparameter Tuning ==========
        print(f"\n[Tune] Starting Optuna tuning with {args.n_trials} trials")
        print(f"[Tune] Scoring metric: {args.scoring}")
        tune_start = time.time()
        best_params, best_score = tune_model(
            X=X_train,
            y=y_train,
            random_state=30,
            n_splits=5,
            n_trials=args.n_trials,
            scoring=args.scoring
        )
        tune_time = time.time() - tune_start
        
        print(f"[Tune] Best {args.scoring} score: {best_score:.4f}")
        print(f"[Tune] Tuning completed in {tune_time:.2f}s")
        print(f"[Tune] Best parameters: {best_params}")
        
        # ========== Model Training ==========
        print("\n[Train] Building final pipeline with tuned parameters")
        train_start = time.time()
        
        # Build feature preprocessing pipeline
        features_pipeline = build_preprocessing_pipeline()
        
        # Create final LightGBM model with tuned parameters
        lgbm = LGBMClassifier(**best_params, random_state=30, verbose=-1)
        
        # Create full pipeline
        ml_pipeline = Pipeline([
            ('features', features_pipeline),
            ('lgbm', lgbm)
        ])
        
        # Fit pipeline
        ml_pipeline.fit(X_train, y_train)
        train_time = time.time() - train_start
        
        print(f"[Train] Model fitted in {train_time:.2f}s")
        
        # ========== Feature Metadata ==========
        print("\n[Features] Extracting feature names from fitted pipeline")
        feature_names = get_output_feature_names(ml_pipeline.named_steps['features'])
        print(f"[Features] Total features: {len(feature_names)}")
        print(f"[Features] Feature sample: {feature_names[:10]}")
        
        # ========== Evaluation ==========
        print("\n[Eval] Computing predictions on test set")
        y_pred_proba = ml_pipeline.predict_proba(X_test)[:, 1]
        y_pred = (y_pred_proba >= args.threshold).astype(int)
        
        # Compute metrics
        precision = precision_score(y_test, y_pred)
        recall = recall_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred)
        roc_auc = roc_auc_score(y_test, y_pred_proba)
        
        # Inference latency
        infer_start = time.time()
        _ = ml_pipeline.predict_proba(X_test[:100])
        infer_latency_ms = (time.time() - infer_start) * 10  # avg ms per sample
        
        print(f"[Eval] Precision: {precision:.4f}")
        print(f"[Eval] Recall: {recall:.4f}")
        print(f"[Eval] F1-Score: {f1:.4f}")
        print(f"[Eval] ROC-AUC: {roc_auc:.4f}")
        print(f"[Eval] Inference latency: {infer_latency_ms:.2f}ms per sample")
        
        print("\n[Eval] Classification Report:")
        print(classification_report(y_test, y_pred))
        
        # ========== MLflow Logging ==========
        print("\n[MLflow] Logging parameters and metrics")
        
        # Log configuration parameters
        mlflow.log_param("table", args.table)
        mlflow.log_param("target", args.target)
        mlflow.log_param("threshold", args.threshold)
        mlflow.log_param("test_size", args.test_size)
        mlflow.log_param("n_trials", args.n_trials)
        mlflow.log_param("scoring_metric", args.scoring)
        
        # Log tuned LightGBM parameters
        for param_name, param_value in best_params.items():
            mlflow.log_param(f"lgbm_{param_name}", param_value)
        
        # Log metrics
        mlflow.log_metric("train_samples", len(X_train))
        mlflow.log_metric("test_samples", len(X_test))
        mlflow.log_metric("n_features", len(feature_names))
        mlflow.log_metric("precision", precision)
        mlflow.log_metric("recall", recall)
        mlflow.log_metric("f1_score", f1)
        mlflow.log_metric("roc_auc", roc_auc)
        mlflow.log_metric("cv_best_score", best_score)
        mlflow.log_metric("train_time_seconds", train_time)
        mlflow.log_metric("tune_time_seconds", tune_time)
        mlflow.log_metric("inference_latency_ms", infer_latency_ms)
        
        # ========== Artifact Logging ==========
        print("[MLflow] Logging artifacts")
        
        # Create artifacts directory
        artifacts_dir = project_root / "artifacts"
        artifacts_dir.mkdir(exist_ok=True)
        
        # Save feature columns
        feature_columns_file = artifacts_dir / "feature_columns.json"
        with open(feature_columns_file, 'w') as f:
            json.dump({"features": feature_names, "count": len(feature_names)}, f, indent=2)
        mlflow.log_artifact(str(feature_columns_file), artifact_path="metadata")
        
        # Save pipeline metadata
        metadata = {
            "timestamp": datetime.now().isoformat(),
            "table": args.table,
            "target": args.target,
            "threshold": args.threshold,
            "test_size": args.test_size,
            "n_trials": args.n_trials,
            "scoring": args.scoring,
            "random_state": 30,
            "train_samples": len(X_train),
            "test_samples": len(X_test),
            "n_features": len(feature_names),
            "feature_names": feature_names,
            "best_params": best_params,
            "metrics": {
                "precision": float(precision),
                "recall": float(recall),
                "f1_score": float(f1),
                "roc_auc": float(roc_auc),
                "cv_best_score": float(best_score)
            },
            "timings": {
                "extract_seconds": extract_time,
                "tune_seconds": tune_time,
                "train_seconds": train_time,
                "inference_latency_ms": infer_latency_ms
            }
        }
        
        metadata_file = artifacts_dir / "pipeline_metadata.json"
        with open(metadata_file, 'w') as f:
            json.dump(metadata, f, indent=2)
        mlflow.log_artifact(str(metadata_file), artifact_path="metadata")
        
        # Save model
        print("[MLflow] Logging model to artifact path 'model'")
        mlflow.sklearn.log_model(ml_pipeline, artifact_path="model")
        
        # ========== Summary ==========
        print("\n" + "="*70)
        print("PIPELINE COMPLETED SUCCESSFULLY")
        print("="*70)
        print(f"\nRun ID: {run_id}")
        print(f"Experiment: {args.experiment}")
        print("\nData:")
        print(f"  Table: {args.table}")
        print(f"  Samples: {len(df)} total, {len(X_train)} train, {len(X_test)} test")
        print("\nModel:")
        print("  Algorithm: LightGBM Classifier")
        print(f"  Features: {len(feature_names)}")
        print(f"\nPerformance (threshold={args.threshold}):")
        print(f"  Precision: {precision:.4f}")
        print(f"  Recall: {recall:.4f}")
        print(f"  F1-Score: {f1:.4f}")
        print(f"  ROC-AUC: {roc_auc:.4f}")
        print("\nTiming:")
        print(f"  Data extraction: {extract_time:.2f}s")
        print(f"  Hyperparameter tuning: {tune_time:.2f}s")
        print(f"  Model training: {train_time:.2f}s")
        print(f"  Total: {extract_time + tune_time + train_time:.2f}s")
        print(f"\nArtifacts saved to: {artifacts_dir}")
        print(f"MLflow tracking URI: {mlflow_uri}")
        print("="*70 + "\n")


def parse_args():
    """Parse command-line arguments."""
    parser = argparse.ArgumentParser(
        description="El Farghaly Bros - Full LightGBM ML Pipeline"
    )
    
    parser.add_argument(
        "--table",
        type=str,
        default="Transformed.Bank",
        help="Database table to load data from (default: Transformed.Bank)"
    )
    
    parser.add_argument(
        "--target",
        type=str,
        default="y",
        help="Target column name (default: y)"
    )
    
    parser.add_argument(
        "--threshold",
        type=float,
        default=0.35,
        help="Prediction probability threshold for binary classification (default: 0.35)"
    )
    
    parser.add_argument(
        "--test_size",
        type=float,
        default=0.2,
        help="Test set fraction (default: 0.2)"
    )
    
    parser.add_argument(
        "--n_trials",
        type=int,
        default=50,
        help="Number of Optuna trials for hyperparameter tuning (default: 50)"
    )
    
    parser.add_argument(
        "--scoring",
        type=str,
        default="recall",
        choices=["precision", "recall", "f1", "roc_auc"],
        help="Scoring metric for cross-validation (default: recall)"
    )
    
    parser.add_argument(
        "--experiment",
        type=str,
        default="El Farghaly Bros LGBM",
        help="MLflow experiment name (default: El Farghaly Bros LGBM)"
    )
    
    parser.add_argument(
        "--mlflow_uri",
        type=str,
        default=None,
        help="MLflow tracking URI (default: project_root/mlruns)"
    )
    
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    main(args)


# ============================================================================
# Usage Examples:
# ============================================================================
# Run with defaults:
#   python scripts/run_pipeline.py
#
# Run with custom tuning trials and scoring metric:
#   python scripts/run_pipeline.py --n_trials 100 --scoring f1
#
# Run with custom table, target, and threshold:
#   python scripts/run_pipeline.py --table Transformed.Bank --target y --threshold 0.35
#
# Run with custom test size and MLflow experiment:
#   python scripts/run_pipeline.py --test_size 0.25 --experiment "Bank Campaign - LGBM v2"
#
# Run with all parameters specified:
#   python scripts/run_pipeline.py --table Transformed.Bank --target y --threshold 0.35 \
#     --test_size 0.2 --n_trials 50 --scoring recall --experiment "El Farghaly Bros LGBM"
#
# Run with custom MLflow tracking URI:
#   python scripts/run_pipeline.py --mlflow_uri "http://localhost:5000"
# ============================================================================
