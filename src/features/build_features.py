from __future__ import annotations

from typing import Optional

import pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, RobustScaler

from src.data.imputation import CategoricalKNNImputerTransformer

try:
	from sklearn.preprocessing import TargetEncoder
except ImportError:  # pragma: no cover
	TargetEncoder = None


default_dropping_cols = [
	"y",
	"duration",
	"pdays",
	"age",
	"day_of_week",
	"month",
	"cons.conf.idx",
	"emp.var.rate",
	"campaign",
	"previous",
	"low_euribor",
	"low_employment",
	"nr.employed",
]

default_te_cols = ["job", "education"]

default_ohe_cols = [
	"marital",
	"housing",
	"loan",
	"poutcome",
	"pdays_group",
	"default",
	"contact",
	"was_prev_success",
	"recession_signal",
	"over_contacted",
	"is_new_client",
	"high_stability",
	"peak_months",
	"age_group",
]

default_scale_columns = ["euribor3m", "econ_cycle", "total_interactions", "macro_stress"]


class DerivePdaysGroupTransformer(BaseEstimator, TransformerMixin):
	"""Derive pdays_group from pdays before categorical encoding."""

	def __init__(self, pdays_column: str = "pdays", output_column: str = "pdays_group") -> None:
		self.pdays_column = pdays_column
		self.output_column = output_column

	def fit(self, X: pd.DataFrame, y=None):
		return self

	def transform(self, X: pd.DataFrame) -> pd.DataFrame:
		df = self._to_dataframe(X)
		if self.pdays_column not in df.columns:
			return df

		pdays_numeric = pd.to_numeric(df[self.pdays_column], errors="coerce")
		pdays_group = pd.Series(pd.NA, index=df.index, dtype="object")

		not_contacted_mask = pdays_numeric == 999
		pdays_group.loc[not_contacted_mask] = "not contacted"

		binned_mask = pdays_numeric.notna() & ~not_contacted_mask
		pdays_group.loc[binned_mask] = pd.cut(
			pdays_numeric.loc[binned_mask],
			bins=[-1, 3, 7, 14, 30],
			labels=["last 3 days", "last week", "last 2 weeks", "last month"],
		).astype("object")

		df[self.output_column] = pdays_group
		return df

	@staticmethod
	def _to_dataframe(X) -> pd.DataFrame:
		if isinstance(X, pd.DataFrame):
			return X.copy()
		return pd.DataFrame(X)


class DropSelectedFeatures(BaseEstimator, TransformerMixin):
	"""Drop selected columns while ignoring any missing columns."""

	def __init__(self, columns_to_drop: Optional[list[str]] = None) -> None:
		self.columns_to_drop = columns_to_drop or []

	def fit(self, X: pd.DataFrame, y=None):
		return self

	def transform(self, X: pd.DataFrame) -> pd.DataFrame:
		df = self._to_dataframe(X)
		return df.drop(columns=self.columns_to_drop, errors="ignore")

	@staticmethod
	def _to_dataframe(X) -> pd.DataFrame:
		if isinstance(X, pd.DataFrame):
			return X.copy()
		return pd.DataFrame(X)


class EncodeScaleTransformer(BaseEstimator, TransformerMixin):
	"""Fit ColumnTransformer with only columns present in the input schema."""

	def __init__(
		self,
		target_encode_columns: Optional[list[str]] = None,
		one_hot_columns: Optional[list[str]] = None,
		scale_columns: Optional[list[str]] = None,
	) -> None:
		self.target_encode_columns = target_encode_columns or []
		self.one_hot_columns = one_hot_columns or []
		self.scale_columns = scale_columns or []

	def fit(self, X: pd.DataFrame, y=None):
		df = self._to_dataframe(X)
		self.feature_names_in_ = df.columns.tolist()

		target_cols = [c for c in self.target_encode_columns if c in df.columns]
		one_hot_cols = [c for c in self.one_hot_columns if c in df.columns]
		scale_cols = [c for c in self.scale_columns if c in df.columns]

		transformers = []

		if TargetEncoder is not None and target_cols and y is not None:
			transformers.append(("target", TargetEncoder(smooth="auto", cv=5), target_cols))
			one_hot_cols = [c for c in one_hot_cols if c not in target_cols]
		else:
			# Fallback to OHE if TargetEncoder is unavailable or y is not provided.
			one_hot_cols = list(dict.fromkeys(one_hot_cols + target_cols))

		if one_hot_cols:
			transformers.append(
				(
					"categorical",
					OneHotEncoder(handle_unknown="ignore", sparse_output=False),
					one_hot_cols,
				)
			)

		if scale_cols:
			transformers.append(("numeric", RobustScaler(), scale_cols))

		self._column_transformer = ColumnTransformer(
			transformers=transformers,
			remainder="passthrough",
			verbose_feature_names_out=False,
		)
		self._column_transformer.fit(df, y)
		return self

	def transform(self, X: pd.DataFrame):
		df = self._to_dataframe(X)
		if hasattr(self, "feature_names_in_"):
			df = df.reindex(columns=self.feature_names_in_)
		return self._column_transformer.transform(df)

	def get_feature_names_out(self) -> list[str]:
		return self._column_transformer.get_feature_names_out().tolist()

	@staticmethod
	def _to_dataframe(X) -> pd.DataFrame:
		if isinstance(X, pd.DataFrame):
			return X.copy()
		return pd.DataFrame(X)


def build_preprocessing_pipeline(
	drop_columns: Optional[list[str]] = None,
	target_encode_columns: Optional[list[str]] = None,
	one_hot_columns: Optional[list[str]] = None,
	scale_columns: Optional[list[str]] = None,
	imputer_neighbors: int = 5,
	imputer_weights: str = "uniform",
) -> Pipeline:
	"""Create the preprocessing pipeline in order: drop -> impute -> encode/scale."""
	drop_columns = drop_columns or default_dropping_cols
	target_encode_columns = target_encode_columns or default_te_cols
	one_hot_columns = one_hot_columns or default_ohe_cols
	scale_columns = scale_columns or default_scale_columns

	return Pipeline(
		steps=[
			("derive_pdays_group", DerivePdaysGroupTransformer()),
			("drop_features", DropSelectedFeatures(columns_to_drop=drop_columns)),
			(
				"impute",
				CategoricalKNNImputerTransformer(
					n_neighbors=imputer_neighbors,
					weights=imputer_weights,
				),
			),
			(
				"encode_scale",
				EncodeScaleTransformer(
					target_encode_columns=target_encode_columns,
					one_hot_columns=one_hot_columns,
					scale_columns=scale_columns,
				),
			),
		]
	)


def get_output_feature_names(preprocessing_pipeline: Pipeline) -> list[str]:
	"""Return transformed output feature names after the pipeline is fitted."""
	encode_scale = preprocessing_pipeline.named_steps["encode_scale"]
	return encode_scale.get_feature_names_out()

