# main.py
import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional
import joblib
import pandas as pd
import numpy as np

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

       # 5) Get global feature importances (quick top drivers)
    try:
        importances = {}
        fi = getattr(model, "feature_importances_", None)
        if fi is not None:
            for fname, score in zip(FEATURES, fi):
                importances[fname] = float(score)
            # construct top drivers
            sorted_items = sorted(importances.items(), key=lambda x: x[1], reverse=True)[:5]
            top_drivers = [{"feature": k, "importance": v} for k, v in sorted_items]
        else:
            top_drivers = []
    except Exception:
        importances = {}
        top_drivers = []

    # ✅ Now outside the try/except — this always runs
    # 7️⃣ Generate recommendations
    recommendations = generate_recommendations(behavior, importances)

    # 🧠 Debug print (check output)
    print("🧠 Recommendations generated:", recommendations)

    # 8️⃣ Save prediction + recs to Firestore
    save_prediction(user_id, predicted_score, behavior, importances, recommendations, timestamp=timestamp)

    # 9️⃣ Return response
    return {
        "predicted_score": predicted_score,
        "top_drivers": top_drivers,
        "recommendations": recommendations,
        "saved": True
    }


# Run with: uvicorn main:app --reload
