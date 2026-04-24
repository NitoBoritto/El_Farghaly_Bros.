from __future__ import annotations

from typing import Optional

import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.impute import KNNImputer


class CategoricalKNNImputerTransformer(BaseEstimator, TransformerMixin):
    """Impute mixed-type tabular data with KNN while preserving categorical labels."""

    def __init__(
        self,
        n_neighbors: int = 5,
        weights: str = "uniform",
        categorical_columns: Optional[list[str]] = None,
    ) -> None:
        self.n_neighbors = n_neighbors
        self.weights = weights
        self.categorical_columns = categorical_columns

    def fit(self, X: pd.DataFrame, y=None):
        df = self._to_dataframe(X)
        self.feature_names_in_ = df.columns.tolist()

        if self.categorical_columns is None:
            self.categorical_columns_ = (
                df.select_dtypes(include=["object", "category", "bool"]).columns.tolist()
            )
        else:
            self.categorical_columns_ = [c for c in self.categorical_columns if c in df.columns]

        self._mappings_ = {}
        self._reverse_mappings_ = {}

        for col in self.categorical_columns_:
            # Keep deterministic mapping order by preserving observed order.
            categories = pd.Series(df[col].dropna().unique()).tolist()
            self._mappings_[col] = {value: idx for idx, value in enumerate(categories)}
            self._reverse_mappings_[col] = {idx: value for idx, value in enumerate(categories)}

        encoded = self._encode(df)
        self._imputer = KNNImputer(
            n_neighbors=self.n_neighbors,
            weights=self.weights,
            metric="nan_euclidean",
        )
        self._imputer.fit(encoded)
        return self

    def transform(self, X: pd.DataFrame) -> pd.DataFrame:
        df = self._to_dataframe(X)

        if hasattr(self, "feature_names_in_"):
            # Align to the trained schema and add absent columns as missing.
            df = df.reindex(columns=self.feature_names_in_)

        encoded = self._encode(df)
        transformed = self._imputer.transform(encoded)
        transformed_df = pd.DataFrame(transformed, columns=encoded.columns, index=encoded.index)

        for col in self.categorical_columns_:
            max_idx = len(self._reverse_mappings_[col]) - 1
            if max_idx < 0:
                continue

            values = np.round(transformed_df[col]).astype(float)
            values = np.clip(values, 0, max_idx)
            transformed_df[col] = values.astype(int).map(self._reverse_mappings_[col])

        return transformed_df

    def _encode(self, df: pd.DataFrame) -> pd.DataFrame:
        encoded = df.copy()
        for col in self.categorical_columns_:
            mapping = self._mappings_[col]
            encoded[col] = encoded[col].map(mapping)
        return encoded

    @staticmethod
    def _to_dataframe(X) -> pd.DataFrame:
        if isinstance(X, pd.DataFrame):
            df = X.copy()
        else:
            df = pd.DataFrame(X)

        # Convert placeholder category values to real missing values before imputation.
        df = df.replace("unknown", np.nan)
        return df
