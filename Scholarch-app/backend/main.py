# main.py
import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional
import joblib
import pandas as pd
import numpy as np
import shap

# Firestore helpers (your module)
from firestore_client import save_behavior_to_firestore, get_user_behavior_history, save_prediction

# Load env (if using .env)
from dotenv import load_dotenv
load_dotenv()

app = FastAPI(title="Scholarch ML API")

# --- Load model pipeline once at startup ---
PIPELINE_PATH = os.path.join(os.path.dirname(__file__), "model_pipeline.pkl")
if not os.path.exists(PIPELINE_PATH):
    raise RuntimeError(f"Model file not found at {PIPELINE_PATH}. Place model_pipeline.pkl in backend/")

pipeline = joblib.load(PIPELINE_PATH)
model = pipeline.get("model")
preprocessor = pipeline.get("preprocessor")
FEATURES = pipeline.get("features", None)

if FEATURES is None:
    raise RuntimeError("Serialized pipeline must include 'features' list.")

# ✅ Initialize SHAP explainer once
try:
    explainer = shap.TreeExplainer(model)
except Exception as e:
    print(f"⚠️ Could not initialize SHAP explainer: {e}")
    explainer = None

# --- Request schema ---
class BehaviorPayload(BaseModel):
    user_id: str
    timestamp: Optional[str] = None
    behavior: Dict[str, Any]


# --- Simple recommendation engine ---
def generate_recommendations(behavior: dict, importances: dict):
    """Generate actionable recommendations based on student behavior and model insights."""
    recs = []

    # Extract safe values (use .get to avoid KeyError)
    study_hours = behavior.get("StudyHours", 0)
    attendance = behavior.get("Attendance", 0)
    motivation = behavior.get("Motivation", 1)
    stress = behavior.get("StressLevel", 1)
    assignment_completion = behavior.get("AssignmentCompletion", 0)
    online_courses = behavior.get("OnlineCourses", 0)
    discussions = behavior.get("Discussions", 0)

    # Apply simple behavioral rules
    if study_hours < 15:
        recs.append("Increase weekly study hours to at least 15 hours for better comprehension.")
    if attendance < 75:
        recs.append("Attend classes regularly to maintain consistent learning.")
    if motivation < 1:
        recs.append("Set clear study goals or use motivation trackers to stay engaged.")
    if stress > 2:
        recs.append("High stress levels detected — schedule breaks and rest effectively.")
    if assignment_completion < 70:
        recs.append("Ensure timely completion of assignments to reinforce learning.")
    if online_courses == 0:
        recs.append("Consider taking short online courses to strengthen weak areas.")
    if discussions < 2:
        recs.append("Participate more in study discussions or group work to improve understanding.")

    # Prioritize recommendations for top important features
    important_feats = sorted(importances.items(), key=lambda x: x[1], reverse=True)[:5]
    important_names = [f[0] for f in important_feats]

    prioritized_recs = [r for r in recs if any(name.lower() in r.lower() for name in important_names)]
    # Fallback: if no overlaps, return all recs
    if not prioritized_recs:
        prioritized_recs = recs

    return prioritized_recs

def compute_trend_insights(history):
    """
    Analyze recent user behavior to detect performance-related trends.
    Expects `history` to be a list of dictionaries (behavior logs).
    """
    if not history or len(history) < 2:
        return ["Not enough data to compute trends yet."]

    # Sort by timestamp ascending
    sorted_history = sorted(
        history, key=lambda x: x.get("timestamp", 0)
    )

    trends = []
    recent = sorted_history[-1]
    previous = sorted_history[-2]

    # Compare a few key metrics
    try:
        if recent.get("studyHours", 0) > previous.get("studyHours", 0):
            trends.append("Study hours have increased compared to the last record.")
        elif recent.get("studyHours", 0) < previous.get("studyHours", 0):
            trends.append("Study hours have decreased recently.")

        if recent.get("stressLevel", 0) > previous.get("stressLevel", 0):
            trends.append("Stress levels have increased. Consider relaxation routines.")
        elif recent.get("stressLevel", 0) < previous.get("stressLevel", 0):
            trends.append("Stress levels have decreased. Great progress!")

        if recent.get("attendance", 0) > previous.get("attendance", 0):
            trends.append("Attendance has improved.")
        elif recent.get("attendance", 0) < previous.get("attendance", 0):
            trends.append("Attendance has dropped slightly.")
    except Exception as e:
        print(f"⚠️ Trend computation error: {e}")

    if not trends:
        trends.append("Behavior metrics are stable since the last record.")
    return trends


def analyze_trends(current_behavior: dict, history: list):
    """
    Compare current behavior with the most recent previous record(s) to detect
    simple trends. `history` is expected to be a list of dicts (most-recent-first).
    Returns a list of human-readable trend insight strings.
    """
    if not history or len(history) == 0:
        return ["No prior data available to compute trends yet."]

    # history is returned by get_user_behavior_history() in descending order,
    # where history[0] is the most recent previous record.
    previous = history[0]

    insights = []

    # Helper to safely get numeric fields (fallback to None if missing)
    def val(obj, key):
        try:
            return float(obj.get(key)) if obj.get(key) is not None else None
        except Exception:
            return None

    # Study hours trend
    cur_sh = val(current_behavior, "StudyHours")
    prev_sh = val(previous, "StudyHours")
    if prev_sh is not None and cur_sh is not None:
        if cur_sh >= prev_sh * 1.10:
            insights.append(f"Study hours increased by {cur_sh - prev_sh:.1f} hrs compared to the last record — good progress.")
        elif cur_sh <= prev_sh * 0.90:
            insights.append(f"Study hours decreased by {prev_sh - cur_sh:.1f} hrs from the last record — try to maintain consistency.")

    # Attendance trend
    cur_att = val(current_behavior, "Attendance")
    prev_att = val(previous, "Attendance")
    if prev_att is not None and cur_att is not None:
        if cur_att >= prev_att + 5:
            insights.append("Attendance improved compared to the previous period — keep attending regularly.")
        elif cur_att <= prev_att - 5:
            insights.append("Attendance dropped since the previous record; improving attendance often helps performance.")

    # Assignment completion trend
    cur_ac = val(current_behavior, "AssignmentCompletion")
    prev_ac = val(previous, "AssignmentCompletion")
    if prev_ac is not None and cur_ac is not None:
        if cur_ac >= prev_ac + 5:
            insights.append("Assignment completion rate increased — good for consistent learning.")
        elif cur_ac <= prev_ac - 5:
            insights.append("Assignment completion decreased notably — aim to submit more assignments on time.")

    # Stress level trend (assume higher = worse)
    cur_st = val(current_behavior, "StressLevel")
    prev_st = val(previous, "StressLevel")
    if prev_st is not None and cur_st is not None:
        if cur_st > prev_st:
            insights.append("Stress level increased compared to the previous record — consider rest or stress-reduction steps.")
        elif cur_st < prev_st:
            insights.append("Stress level decreased — that's positive for focus and learning.")

    # If nothing noteworthy
    if not insights:
        insights.append("No significant changes detected — behavior looks stable compared to recent history.")

    return insights


# --- Utility to prepare input for model ---
def prepare_input_df(behavior: Dict[str, Any]) -> pd.DataFrame:
    """
    Build a single-row DataFrame with columns in the same order as FEATURES.
    Missing features -> KeyError (helps catch payload mismatch).
    """
    # Ensure all feature names are present in behavior (or fill with np.nan)
    row = {f: behavior.get(f, np.nan) for f in FEATURES}
    df = pd.DataFrame([row], columns=FEATURES)
    return df

# --- Endpoint ---
@app.post("/predict_and_recommend")
def predict_and_recommend(payload: BehaviorPayload):
    # 1) Basic validation
    user_id = payload.user_id
    behavior = payload.behavior
    timestamp = payload.timestamp

    if not user_id or not isinstance(behavior, dict):
        raise HTTPException(status_code=400, detail="Missing user_id or behavior payload")

    # 2) Save behavior to Firestore (latest + history)
    save_behavior_to_firestore(user_id, behavior, timestamp)

    # 3) (Optional) Pull history for later steps (we will use it later)
    history = get_user_behavior_history(user_id, limit=8)
    
    # 4️⃣ Prepare model input and predict
    X_df = prepare_input_df(behavior)
    X_proc = preprocessor.transform(X_df)
    pred = model.predict(X_proc)[0]
    predicted_score = float(pred)

    # 5️⃣ Global feature importances (existing)
    importances = {}  # ✅ ensure variable always exists

    try:
        fi = getattr(model, "feature_importances_", None)
        if fi is not None:
            for fname, score in zip(FEATURES, fi):
                importances[fname] = float(score)
            # construct top drivers
            sorted_items = sorted(importances.items(), key=lambda x: x[1], reverse=True)[:5]
            top_drivers = [{"feature": k, "importance": v} for k, v in sorted_items]
        else:
            top_drivers = []
    except Exception as e:
        print(f"⚠️ Error computing feature importances: {e}")
        top_drivers = []

    # 6️⃣ 🔍 NEW — Compute SHAP local explanations
    shap_values = {}
    if explainer is not None:
        try:
            shap_raw = explainer.shap_values(X_proc)
            # shap_raw is a list if model is multiclass
            if isinstance(shap_raw, list):
                shap_raw = shap_raw[0]
            # Convert single-row array to dict {feature: value}
            shap_dict = {FEATURES[i]: float(shap_raw[0][i]) for i in range(len(FEATURES))}
            # Keep top 5 absolute contributors
            shap_values = dict(sorted(shap_dict.items(), key=lambda x: abs(x[1]), reverse=True)[:5])
        except Exception as e:
            print(f"⚠️ SHAP explanation error: {e}")

    # 7️⃣ Generate recommendations (existing)
    recommendations = generate_recommendations(behavior, importances)

    # 8️⃣ Trend analysis (already implemented)
    trend_insights = compute_trend_insights(history)

    # 9️⃣ Save everything (NEW field shap_explanation)
    save_prediction(
        user_id,
        predicted_score,
        behavior,
        importances,
        recommendations,
        timestamp=timestamp,
        trend_insights=trend_insights,
        shap_explanation=shap_values  # NEW ✅
    )

    return {
        "predicted_score": predicted_score,
        "recommendations": recommendations,
        "trend_insights": trend_insights,
        "top_drivers": top_drivers,
        "shap_explanation": shap_values,
        "saved": True
    }



    # 9️⃣ Return response (include trend_insights)
    return {
        "predicted_score": predicted_score,
        "top_drivers": top_drivers,
        "recommendations": recommendations,
        "trend_insights": trend_insights,
        "saved": True
    }
@app.get("/get_latest_prediction/{user_id}")
def get_latest_prediction_endpoint(user_id: str):
    """Return the most recent prediction and recommendations for a given user."""
    from firestore_client import get_latest_prediction

    result = get_latest_prediction(user_id)
    if not result:
        raise HTTPException(status_code=404, detail="No prediction found for this user")

    # Format output cleanly for frontend
    return {
        "user_id": user_id,
        "predicted_score": result.get("predicted_score"),
        "recommendations": result.get("recommendations", []),
        "trend_insights": result.get("trend_insights", []),
        "shap_explanation": result.get("shap_explanation", {}),
        "timestamp": result.get("timestamp"),
    }

# Run with: uvicorn main:app --reload
