// utils/behaviorLabels.ts
// ------------------------------------------------------
// Central mapping between numeric values and their human-readable labels.
// Each array index corresponds to the numeric code stored in Firestore and used by the ML model.
// ------------------------------------------------------

export const yesNoLabels = ["No", "Yes"]; // Used for: discussions, internet, extracurricular, onlineCourses, eduTech

export const motivationLabels = ["Low", "Medium", "High"]; // 0–2
export const learningStyleLabels = ["Visual", "Auditory", "Kinesthetic", "Reading/Writing"]; // 0–3
export const stressLevelLabels = ["Low", "Medium", "High"]; // 0–2
export const resourceAccessLabels = ["Low", "Medium", "High"]; // optional

// ✅ Optional helper: safely convert numeric value → label
export const labelFor = (labels: string[], value: number): string => {
  if (value == null || value < 0 || value >= labels.length) return "N/A";
  return labels[value];
};
