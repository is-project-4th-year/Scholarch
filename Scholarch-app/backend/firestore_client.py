# firestore_client.py

import os
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv
from datetime import datetime

# ✅ Load environment variables
load_dotenv()

# ✅ Initialize Firebase only once
if not firebase_admin._apps:
    cred_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)

# ✅ Create Firestore client
db = firestore.client()
print("✅ Firestore client initialized successfully.")


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
    trend_insights=None
):
    """
    Save prediction results, recommendations, and optional trend insights to Firestore.
    Each prediction is stored as a new document in the user's 'predictions' subcollection.
    """
    try:
        doc_ref = db.collection("users").document(user_id).collection("predictions").document()

        data = {
            "timestamp": timestamp or firestore.SERVER_TIMESTAMP,
            "predicted_score": predicted_score,
            "behavior": behavior,
            "recommendations": recommendations,
            "importances": importances,
            "trend_insights": trend_insights or [],
        }

        doc_ref.set(data)
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
