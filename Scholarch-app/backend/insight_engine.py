# insight_engine.py
from typing import Dict, List, Tuple, Any
import numpy as np
import pandas as pd
from scipy.stats import pearsonr, spearmanr
from datetime import datetime

# Config
MIN_HISTORY_RECORDS = 4  # require at least this many paired records to compute meaningful correlations
STRONG_POSITIVE = 0.5
STRONG_NEGATIVE = -0.3

def _safe_corr(x: np.ndarray, y: np.ndarray, method: str = "pearson") -> float:
    """
    Compute correlation safely. Returns np.nan on failure.
    """
    try:
        if len(x) < 2 or len(y) < 2:
            return float("nan")
        if method == "pearson":
            c, _ = pearsonr(x, y)
            return float(c)
        else:
            c, _ = spearmanr(x, y)
            return float(c)
    except Exception:
        return float("nan")

def compute_feature_correlations(history: List[Dict[str, Any]],
                                 features: List[str],
                                 score_key: str = "PredictedScore",
                                 method: str = "pearson") -> Dict[str, float]:
    """
    history: list of dicts each containing features + a PredictedScore entry (or final grade).
    features: list of feature names to compute correlation for (must match keys in history)
    Returns: dict {feature_name: correlation_value}
    """
    if not history or len(history) < MIN_HISTORY_RECORDS:
        return {}

    df = pd.DataFrame(history)

    # Ensure expected columns are present
    results = {}
    if score_key not in df.columns:
        return {}

    # Drop rows where score is NaN
    df = df.dropna(subset=[score_key])
    if df.shape[0] < MIN_HISTORY_RECORDS:
        return {}

    # For each feature compute correlation with score
    for feat in features:
        if feat not in df.columns:
            results[feat] = float("nan")
            continue
        # convert to numeric
        series = pd.to_numeric(df[feat], errors="coerce")
        score_series = pd.to_numeric(df[score_key], errors="coerce")
        # drop pairs with NaNs
        paired = pd.concat([series, score_series], axis=1).dropna()
        if paired.shape[0] < 2:
            results[feat] = float("nan")
            continue
        x = paired.iloc[:, 0].to_numpy(dtype=float)
        y = paired.iloc[:, 1].to_numpy(dtype=float)
        corr_val = _safe_corr(x, y, method=method)
        results[feat] = corr_val

    return results

def generate_data_driven_recommendations(correlations: Dict[str, float]) -> List[str]:
    """
    Turn the correlation dict into readable recommendations.
    """
    recs = []
    if not correlations:
        return recs

    # Sort features by absolute correlation descending
    items = sorted(correlations.items(), key=lambda kv: (0 if np.isnan(kv[1]) else abs(kv[1])), reverse=True)

    for feat, corr in items:
        if np.isnan(corr):
            continue
        corr_rounded = round(corr, 3)
        if corr >= STRONG_POSITIVE:
            recs.append(f"{feat} strongly correlates with improved performance ({corr_rounded:+}). Consider maintaining or enhancing this behavior.")
        elif corr <= STRONG_NEGATIVE:
            recs.append(f"{feat} is negatively associated with performance ({corr_rounded:+}). Consider strategies to reduce this factor.")
        elif abs(corr) >= 0.2:
            recs.append(f"{feat} shows a modest association with performance ({corr_rounded:+}). It may be worth monitoring.")
        # else: ignore weak correlations

    return recs

def summarize_behavior_trends(history: List[Dict[str, Any]], features: List[str]) -> Dict[str, Any]:
    """
    Provide simple trend summaries (delta between last and previous average).
    """
    out = {}
    if not history or len(history) < 2:
        return out

    df = pd.DataFrame(history)
    # Ensure numeric conversion for features
    for feat in features:
        if feat in df.columns:
            ser = pd.to_numeric(df[feat], errors="coerce")
            # compute recent mean vs earlier mean
            n = len(ser.dropna())
            if n < 2:
                continue
            # split approx half
            split = max(1, n // 2)
            earlier = ser.iloc[:split].mean()
            later = ser.iloc[split:].mean()
            if pd.isna(earlier) or pd.isna(later):
                continue
            delta = later - earlier
            out[feat] = {
                "earlier_mean": float(round(earlier, 3)),
                "recent_mean": float(round(later, 3)),
                "delta": float(round(delta, 3))
            }
    return out
