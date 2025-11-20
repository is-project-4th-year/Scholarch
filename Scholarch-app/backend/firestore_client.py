# firestore_client.py

import os
import firebase_admin
import math
from firebase_admin import credentials, firestore
from dotenv import load_dotenv
from datetime import datetime

# ✅ Load environment variables
load_dotenv()

# ✅ Initialize Firebase only once
if not firebase_admin._apps:
    cred_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    print(f"🔍 Looking for credentials at: {cred_path}")

    if not cred_path or not os.path.exists(cred_path):
        raise FileNotFoundError(f"Firebase credentials file not found at: {cred_path}")
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)

# ✅ Create Firestore client
db = firestore.client()
print("✅ Firestore client initialized successfully.")



def clean_json(data):
    """Recursively replace NaN/Infinity with None for Firestore/JSON safety."""
    if isinstance(data, dict):
        return {k: clean_json(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [clean_json(v) for v in data]
    elif isinstance(data, float):
        if math.isnan(data) or math.isinf(data):
            return None
        return float(data)
    else:
        return data


# ─────────────────────────────────────────────
# 1️⃣ Save current behavior data
# ─────────────────────────────────────────────
def save_behavior_to_firestore(user_id: str, behavior_data: dict, timestamp: str = None):
    """Save student's latest behavior to Firestore."""
    timestamp = timestamp or datetime.utcnow().isoformat()

    # Save in behavior/history
    history_ref = db.collection("users").document(user_id).collection("behavior").document("history").collection("records").document()
    history_ref.set({
        **behavior_data,
        "recordedAt": timestamp
    })

    # Update latest
    latest_ref = db.collection("users").document(user_id).collection("behavior").document("latest")
    latest_ref.set({
        **behavior_data,
        "updatedAt": timestamp
    })

    print(f"✅ Behavior data saved for user: {user_id}")
    return True


# ─────────────────────────────────────────────
# 2️⃣ Retrieve user behavior history
# ─────────────────────────────────────────────
def get_user_behavior_history(user_id: str, limit: int = 8):
    """Fetch recent user behavior records (sorted by timestamp descending)."""
    history_ref = (
        db.collection("users")
        .document(user_id)
        .collection("behavior")
        .document("history")
        .collection("records")
        .order_by("recordedAt", direction=firestore.Query.DESCENDING)
        .limit(limit)
    )
    docs = history_ref.stream()
    records = [doc.to_dict() for doc in docs]
    print(f"📖 Retrieved {len(records)} records for user: {user_id}")
    return records


def get_user_behavior_and_predictions(user_id: str, limit: int = 100):
    """
    Returns a list of dicts with feature columns and PredictedScore.
    We will try to align names with FEATURES used in your model.
    """
    # Fetch behavior logs
    logs_ref = db.collection(f"users/{user_id}/behavior_logs").order_by("timestamp", direction=firestore.Query.ASCENDING).limit(limit)
    logs = [doc.to_dict() for doc in logs_ref.stream()]

    # Fetch predictions (mapping by timestamp if available)
    preds_ref = db.collection(f"users/{user_id}/predictions").order_by("timestamp", direction=firestore.Query.ASCENDING).limit(limit)
    preds = [doc.to_dict() for doc in preds_ref.stream()]

    # naive merge: align by order (assumes logs and predictions are saved in same cadence)
    merged = []
    # build list of prediction scores
    pred_scores = [p.get("predicted_score") for p in preds]
    n = max(len(logs), len(pred_scores))
    for i in range(n):
        row = {}
        if i < len(logs):
            row.update(logs[i])
        # attach predicted score if exists at same index, else None
        row["PredictedScore"] = pred_scores[i] if i < len(pred_scores) else None
        merged.append(row)
    return merged


# ─────────────────────────────────────────────
# 3️⃣ Save prediction and recommendations
# ─────────────────────────────────────────────
def save_prediction(
    user_id,
    predicted_score,
    behavior,
    importances,
    recommendations,
    timestamp=None,
    trend_insights=None,
    data_driven_recommendations=None,
    correlation_stats=None,
    trend_summary=None
):
    """
    Save prediction results, recommendations, and optional trend insights to Firestore.
    Each prediction is stored as a new document in the user's 'predictions' subcollection.
    """
    try:
        doc_ref = (
            db.collection("users")
            .document(user_id)
            .collection("predictions")
            .document()
        )

        data = {
            "timestamp": timestamp or firestore.SERVER_TIMESTAMP,
            "predicted_score": predicted_score,
            "behavior": behavior,
            "recommendations": recommendations,
            "importances": importances,
            "trend_insights": trend_insights or [],
            "data_driven_recommendations": data_driven_recommendations or [],
            "correlation_stats": correlation_stats or {},
            "trend_summary": trend_summary or "",
        }

        # 🧹 Clean data to remove NaN/Infinity before saving
        safe_data = clean_json(data)

        print("🧹 Cleaned Firestore data:", safe_data)


        doc_ref.set(safe_data)
        print(f"✅ Prediction and trends saved for user: {user_id}")

    except Exception as e:
        print(f"❌ Error saving prediction for user {user_id}: {e}")



def get_latest_prediction(user_id):
    """
    Fetch the most recent prediction entry for a given user.
    Returns a dictionary containing predicted_score, recommendations, and trend insights.
    """
    try:
        preds_ref = (
            db.collection("users")
            .document(user_id)
            .collection("predictions")
            .order_by("timestamp", direction=firestore.Query.DESCENDING)
            .limit(1)
        )

        results = preds_ref.stream()
        latest_doc = next(results, None)

        if latest_doc:
            data = latest_doc.to_dict()
            print(f"✅ Latest prediction retrieved for user: {user_id}")
            return data
        else:
            print(f"⚠️ No predictions found for user: {user_id}")
            return None

    except Exception as e:
        print(f"❌ Error retrieving latest prediction for user {user_id}: {e}")
        return None
