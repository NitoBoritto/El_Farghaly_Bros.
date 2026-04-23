import optuna
from lightgbm import LGBMClassifier
from sklearn.base import clone
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.pipeline import Pipeline

from src.features.build_features import build_preprocessing_pipeline


def tune_model(
	X,
	y,
	random_state: int = 30,
	n_splits: int = 5,
	n_trials: int = 50,
	scoring: str = "recall",
):
	"""Tune LightGBM hyperparameters with Optuna using CV recall scoring."""
	feature_pipeline = build_preprocessing_pipeline()
	skf = StratifiedKFold(n_splits=n_splits, shuffle=True, random_state=random_state)

	def objective(trial: optuna.trial.Trial) -> float:
		params = {
			"n_estimators": trial.suggest_int("n_estimators", 100, 500),
			"max_depth": trial.suggest_int("max_depth", 3, 12),
			"learning_rate": trial.suggest_float("learning_rate", 0.001, 0.3, log=True),
			"num_leaves": trial.suggest_int("num_leaves", 20, 150),
			"subsample": trial.suggest_float("subsample", 0.5, 1.0),
			"colsample_bytree": trial.suggest_float("colsample_bytree", 0.5, 1.0),
			"reg_alpha": trial.suggest_float("reg_alpha", 0.0001, 10.0, log=True),
			"reg_lambda": trial.suggest_float("reg_lambda", 0.0001, 10.0, log=True),
			"scale_pos_weight": trial.suggest_float("scale_pos_weight", 1.0, 10.0),
		}

		model = LGBMClassifier(**params, random_state=random_state, n_jobs=-1, verbose=-1)

		ml_pipeline = Pipeline(
			[
				("features", clone(feature_pipeline)),
				("lgbm", model),
			]
		)

		scores = cross_val_score(
			ml_pipeline,
			X,
			y,
			cv=skf,
			scoring=scoring,
			n_jobs=1,
			error_score="raise",
		)
		return scores.mean() - (scores.std() * 0.5)

	study = optuna.create_study(
		direction="maximize",
		sampler=optuna.samplers.TPESampler(seed=random_state),
	)
	study.optimize(objective, n_trials=n_trials, show_progress_bar=True)

	print(f"✅ Optimization complete. Best params: {study.best_params}")
	return study.best_params, study.best_value

