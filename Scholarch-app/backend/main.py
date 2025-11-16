# main.py
import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional
from insight_engine import compute_feature_correlations, generate_data_driven_recommendations, summarize_behavior_trends
from firestore_client import get_user_behavior_and_predictions, save_prediction  
import joblib
import pandas as pd
import numpy as np
import math

# Firestore helpers (your module)
from firestore_client import save_behavior_to_firestore, get_user_behavior_history, save_prediction

# Load env (if using .env)
from dotenv import load_dotenv
load_dotenv()


def compute_trend_summary(history):
    """
    Aggregates multi-record trends from user history.
    Produces a concise dictionary showing feature averages and direction of change.
    """
    if not history or len(history) < 2:
        return {}

    # ✅ Convert history to DataFrame
    df = pd.DataFrame(history)
    numeric_cols = df.select_dtypes(include=[np.number]).columns

    summary = {}
    for col in numeric_cols:
        series = df[col].dropna().astype(float)
        if len(series) < 2:
            continue

        mean_val = float(series.mean())
        delta = float(series.iloc[-1] - series.iloc[0])
        trend = (
            "increasing" if delta > 0.05 * mean_val
            else "decreasing" if delta < -0.05 * mean_val
            else "stable"
        )

        summary[col] = {
            "mean": round(mean_val, 2),
            "trend": trend
        }

    print("📊 Trend summary generated:", summary)
    return summary

# --- Correlation Analysis Helper ---
def compute_correlations(user_id: str):
    """
    Compute correlations between a user's behavior features and their predicted scores.
    Returns a dictionary like {"StudyHours": 0.72, "StressLevel": -0.44, ...}
    """

    try:
        from firestore_client import get_user_behavior_history
        import pandas as pd
        import numpy as np

        # 1️⃣ Fetch user's behavior + predictions history
        history = get_user_behavior_history(user_id, limit=50)  # you can adjust limit

        if not history or len(history) < 3:
            print("⚠️ Not enough records to compute correlation.")
            return {}

        # 2️⃣ Convert to DataFrame
        df = pd.DataFrame(history)

        # Expect structure like: {"StudyHours": 12, "Attendance": 90, ..., "predicted_score": 75}
        if "predicted_score" not in df.columns:
            print("⚠️ No predicted_score found in history — skipping correlation computation.")
            return {}

        # 3️⃣ Keep only numeric columns
        numeric_df = df.select_dtypes(include=[np.number])

        # 4️⃣ Compute correlation matrix
        corr_matrix = numeric_df.corr()

        if "predicted_score" not in corr_matrix.columns:
            return {}

        correlations = corr_matrix["predicted_score"].drop("predicted_score").to_dict()

        # 5️⃣ Clean NaN / inf
        correlations = {
            k: (0 if (pd.isna(v) or np.isinf(v)) else round(float(v), 3))
            for k, v in correlations.items()
        }

        # 6️⃣ (Optional) Save back to Firestore under analytics
        from firestore_client import db
        db.collection("users").document(user_id).collection("analytics").document("correlations").set(correlations)
        print(f"📊 Correlation analytics saved for user: {user_id}")

        return correlations

    except Exception as e:
        print("❌ Error computing correlations:", e)
        return {}


def sanitize_for_json(obj):
    """Recursively replace NaN, inf, -inf with None in dicts/lists."""
    if isinstance(obj, dict):
        return {k: sanitize_for_json(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [sanitize_for_json(v) for v in obj]
    elif isinstance(obj, float):
        if math.isnan(obj) or math.isinf(obj):
            return None
        return obj
    else:
        return obj

# 🔹 --- Feature Importance Helper ---
def get_feature_importances(model, FEATURES):
    """
    Extract feature importances from a trained model and return a consistent dictionary.
    Handles models with or without the 'feature_importances_' attribute.
    """
    importances = {}

    try:
        fi = getattr(model, "feature_importances_", None)
        if fi is not None:
            for fname, score in zip(FEATURES, fi):
                importances[fname] = float(score)
        else:
            coefs = getattr(model, "coef_", None)
            if coefs is not None:
                for fname, score in zip(FEATURES, coefs.flatten()):
                    importances[fname] = float(abs(score))
    except Exception as e:
        print(f"⚠️ Error extracting feature importances: {e}")
        importances = {}

    if isinstance(importances, list):
        importances = {i["feature"]: i["importance"] for i in importances if isinstance(i, dict)}

    return importances


# 🔹 --- Recommendation Generator ---
def generate_recommendations(behavior: dict, importances: dict):
    """
    Generate actionable recommendations based on behavior data and model insights.
    Prioritizes the most influential features.
    """
    recs = []

    study_hours = behavior.get("StudyHours", behavior.get("studyHours", 0))
    attendance = behavior.get("Attendance", behavior.get("attendance", 0))
    motivation = behavior.get("Motivation", behavior.get("motivation", 1))
    stress = behavior.get("StressLevel", behavior.get("stressLevel", 1))
    assignment_completion = behavior.get("AssignmentCompletion", behavior.get("assignmentCompletion", 0))
    online_courses = behavior.get("OnlineCourses", behavior.get("onlineCourses", 0))
    discussions = behavior.get("Discussions", behavior.get("discussions", 0))

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

    if isinstance(importances, dict):
        important_feats = sorted(importances.items(), key=lambda x: x[1], reverse=True)[:5]
    elif isinstance(importances, list):
        important_feats = [(i["feature"], i["importance"]) for i in importances if isinstance(i, dict)]
    else:
        important_feats = []

    important_names = [f[0].lower() for f in important_feats]
    prioritized_recs = [r for r in recs if any(name in r.lower() for name in important_names)]
    if not prioritized_recs:
        prioritized_recs = recs

    return prioritized_recs


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

# --- Request schema ---
class BehaviorPayload(BaseModel):
    user_id: str
    timestamp: Optional[str] = None
    behavior: Dict[str, Any]


# --- Simple recommendation engine ---

def analyze_trends(history):
    """Compute insights comparing the most recent and previous behavior entries."""
    if not history or len(history) == 0:
        return ["No prior data available to compute trends yet."]

    # ✅ Ensure history is a list
    if isinstance(history, dict):
        history = list(history.values())

    # ✅ Ensure it’s sorted by timestamp if possible
    if isinstance(history[0], dict) and "timestamp" in history[0]:
        history = sorted(history, key=lambda x: x.get("timestamp", 0), reverse=True)

    if len(history) < 2:
        return ["No significant changes detected — not enough history for trend analysis."]

    # ✅ Now safe to access
    previous = history[1]
    latest = history[0]

    insights = []

    # Compare some key metrics
    if "StudyHours" in latest and "StudyHours" in previous:
        diff = latest["StudyHours"] - previous["StudyHours"]
        if diff > 0:
            insights.append(f"Study hours increased by {diff:.1f} hrs compared to the last record — good progress.")
        elif diff < 0:
            insights.append(f"Study hours decreased by {abs(diff):.1f} hrs — try to maintain consistent study time.")

    if "StressLevel" in latest and "StressLevel" in previous:
        if latest["StressLevel"] > previous["StressLevel"]:
            insights.append("Stress level increased compared to the previous record — consider rest or stress-reduction steps.")
        elif latest["StressLevel"] < previous["StressLevel"]:
            insights.append("Stress level reduced — good emotional management!")

    if not insights:
        insights.append("No significant changes detected — behavior looks stable compared to recent history.")

    return insights



# --- Utility to prepare input for model ---
def prepare_input_df(behavior: Dict[str, Any]) -> pd.DataFrame:
    """
    Map frontend keys (camelCase) to the model’s expected TitleCase FEATURES.
    Ensures column names match exactly what the model saw during training.
    """
    row = {}
    for f in FEATURES:
        # Example: StudyHours -> studyhours
        normalized_key = f.lower()
        # Find frontend key that matches ignoring case
        matched = next((k for k in behavior.keys() if k.lower() == normalized_key), None)
        row[f] = behavior.get(matched, np.nan)

    df = pd.DataFrame([row], columns=FEATURES)
    print("✅ Prepared DataFrame columns:", list(df.columns))
    print("✅ Row data for prediction:", row)
    return df

# --- Endpoint ---
@app.post("/predict_and_recommend")
def predict_and_recommend(payload: BehaviorPayload):
    # 1) Basic validation
    user_id = payload.user_id
    behavior = payload.behavior
    timestamp = payload.timestamp

    print("\n======================")
    print(f"📩 Incoming request from user: {user_id}")
    print("🔍 Raw behavior payload:", behavior)
    print("🔍 Expected FEATURES:", FEATURES)
    print("======================\n")


    if not user_id or not isinstance(behavior, dict):
        raise HTTPException(status_code=400, detail="Missing user_id or behavior payload")

    # 2) Save behavior to Firestore (latest + history)

    save_behavior_to_firestore(user_id, behavior, timestamp)

    # 3) (Optional) Pull history for later steps (we will use it later)
    history = get_user_behavior_history(user_id, limit=8)
    
    # 4) Prepare model input and predict
    try:
        X_df = prepare_input_df(behavior)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error preparing model input: {e}")

    try:
        X_proc = preprocessor.transform(X_df)
        pred = model.predict(X_proc)[0]
        predicted_score = float(pred)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model prediction error: {e}")

    # 5️⃣ Compute and use feature importances
    importances = get_feature_importances(model, FEATURES)

    # 6️⃣ Generate recommendations
    recommendations = generate_recommendations(behavior, importances)

    # 7️⃣ Extract top drivers for UI
    sorted_items = sorted(importances.items(), key=lambda x: x[1], reverse=True)[:5]
    top_drivers = [{"feature": k, "importance": v} for k, v in sorted_items]


    # ✅ Now outside the try/except — this always runs
        # 7️⃣ Generate recommendations
    recommendations = generate_recommendations(behavior, importances)

    # 🧠 Debug print (check output)
    print("🧠 Recommendations generated:", recommendations)

    # Analyze trends using history (history list from Firestore)
   

     # ✅ Your existing prediction pipeline
    predicted_score = model.predict(X_df)[0]
    print("🧠 Raw model prediction:", predicted_score)
    importances = get_feature_importances(model, FEATURES)
    recommendations = generate_recommendations(behavior, importances)
    trend_insights = analyze_trends(history)
    print("📈 Trend insights:", trend_insights)
    trend_summary = compute_trend_summary(history)
    print("📊 Trend summary:", trend_summary)

    # --- NEW SECTION: compute advanced insights ---
    history = get_user_behavior_and_predictions(user_id, limit=100)
    feature_list = FEATURES.copy()  # ensure same feature order used in training

    history = get_user_behavior_history(user_id)
    print("📜 Retrieved history size:", len(history))

    #  🔍 Compute correlation analytics
    correlations = compute_correlations(user_id)


    data_driven_recs = generate_data_driven_recommendations(correlations)
    trend_summary = summarize_behavior_trends(history, feature_list)

    print("🔍 Predicted score:", predicted_score)
    print("🔍 Importances:", importances)
    print("🔍 Recommendations:", recommendations)
    print("🔍 Data-driven recommendations:", data_driven_recs)
    print("🔍 Correlations:", correlations)
    print("🔍 Trend summary:", trend_summary)

    print("🧪 Has NaN in predicted_score?", math.isnan(predicted_score) if isinstance(predicted_score, float) else "N/A")




    # --- Modified save call to include new fields ---
    save_prediction(
        user_id=user_id,
        predicted_score=predicted_score,
        behavior=behavior,
        importances=importances,
        recommendations=recommendations,  # rule-based
        timestamp=timestamp,
        trend_insights=trend_insights, 
        data_driven_recommendations=data_driven_recs,
        correlation_stats=correlations,
        trend_summary=trend_summary
    )

    # ✅ Combine both rec systems in response if you want
    all_recs = list(set(recommendations + data_driven_recs))

    result_payload = {
    "predicted_score": predicted_score,
    "recommendations": all_recs,
    "trend_insights": trend_insights,
    "saved": True,
    "top_drivers": importances,
    "correlations": correlations,
    "trend_summary": trend_summary,
}
   

    # 🧹 Clean NaN/inf values for JSON serialization
    clean_result = sanitize_for_json(result_payload)
    print("🧹 Sanitized result payload:", clean_result)

    return clean_result



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
        "timestamp": result.get("timestamp"),
    }

# Run with: uvicorn main:app --reload
