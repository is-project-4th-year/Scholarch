from firestore_client import save_behavior_to_firestore, get_user_behavior_history, save_prediction

user_id = "test_user_001"
behavior_data = {
    "StudyHours": 20,
    "Attendance": 85,
    "Motivation": 2,
    "StressLevel": 1
}

save_behavior_to_firestore(user_id, behavior_data)
records = get_user_behavior_history(user_id)
print(records)

save_prediction(user_id, predicted_score=78.5, behavior_data=behavior_data, importances={"StudyHours":0.18}, recommendations=["Increase study hours"])
