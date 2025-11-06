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
def save_prediction(user_id: str, predicted_score: float, behavior_data: dict, importances: dict, recommendations: list, timestamp: str = None):
    """Save model prediction and recommendations to Firestore."""
    timestamp = timestamp or datetime.utcnow().isoformat()
    pred_ref = (
        db.collection("users")
        .document(user_id)
        .collection("predictions")
        .document()
    )

    pred_ref.set({
        "predictedScore": predicted_score,
        "behaviorInput": behavior_data,
        "featureImportances": importances,
        "recommendations": recommendations,
        "createdAt": timestamp
    })

    print(f"✅ Prediction saved for user: {user_id}")
    return True
