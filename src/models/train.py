import mlflow
import mlflow.sklearn
import pandas as pd
from lightgbm import LGBMClassifier
from sklearn.metrics import f1_score, recall_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

from src.features.build_features import build_preprocessing_pipeline
from src.models.tune import tune_model


def _prepare_target(y: pd.Series) -> pd.Series:
	"""Convert common yes/no string targets into numeric labels."""
	if y.dtype == "object":
		normalized = y.astype(str).str.strip().str.lower()
		if set(normalized.unique()).issubset({"yes", "no"}):
			return normalized.map({"no": 0, "yes": 1}).astype(int)
	return y


def train_model(
	df: pd.DataFrame,
	target_col: str = "y",
	random_state: int = 30,
	test_size: float = 0.2,
	n_splits: int = 5,
	n_trials: int = 50,
	scoring: str = "recall",
):
	"""Train a LightGBM pipeline and log artifacts/metrics to MLflow.

	Example:
		>>> import pandas as pd
		>>> from src.models.train import train_model
		>>> df = pd.read_csv("data/raw/bank-additional-full.csv", sep=";")
		>>> model, metrics, best_params = train_model(df, target_col="y")
	"""
	print("Splitting data...")
	X = df.drop(columns=[target_col])
	y = _prepare_target(df[target_col])

	X_train, X_test, y_train, y_test = train_test_split(
		X,
		y,
		test_size=test_size,
		random_state=random_state,
		stratify=y,
	)

	print("Tuning LightGBM hyperparameters...")
	best_params, best_cv_score = tune_model(
		X_train,
		y_train,
		random_state=random_state,
		n_splits=n_splits,
		n_trials=n_trials,
		scoring=scoring,
	)

	feature_engineer = build_preprocessing_pipeline()
	final_model = LGBMClassifier(
		**best_params,
		random_state=random_state,
		n_jobs=-1,
		verbose=-1,
	)

	ml_pipeline = Pipeline(
		[
			("features", feature_engineer),
			("lgbm", final_model),
		]
	)

	with mlflow.start_run():
		ml_pipeline.fit(X_train, y_train)

		y_pred = ml_pipeline.predict(X_test)
		f1 = f1_score(y_test, y_pred)
		rec = recall_score(y_test, y_pred)

		mlflow.log_params(final_model.get_params())
		mlflow.log_param("cv_best_score", best_cv_score)
		mlflow.log_metric("F1", f1)
		mlflow.log_metric("Recall", rec)

		mlflow.sklearn.log_model(ml_pipeline, "model_pipeline")

		try:
			train_ds = mlflow.data.from_pandas(df, source="training_data")
			mlflow.log_input(train_ds, context="training")
		except Exception:
			# Keep training resilient when dataset logging is unavailable.
			pass

		print(f"Model trained. F1 Score: {f1:.3f}, Recall: {rec:.3f}")

	metrics = {
		"f1": f1,
		"recall": rec,
		"best_cv_score": best_cv_score,
	}
	return ml_pipeline, metrics, best_params

