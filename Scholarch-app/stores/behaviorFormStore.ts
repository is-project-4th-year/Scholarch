// stores/behaviorFormStore.ts
import { create } from "zustand";

// Define the structure of all behavior data fields
export interface BehaviorFormState {
  // Quantitative fields
  studyHours: number;
  attendance: number;
  assignmentCompletion: number;

  // Categorical (numeric codes)
  motivation: number; // 0=Low,1=Medium,2=High
  learningStyle: number; // 0=Visual,1=Auditory,2=Kinesthetic,3=Reading/Writing
  stressLevel: number; // 0=Low,1=Medium,2=High
  resources: number; // 0–2 optional

  // Binary (numeric 0/1)
  internet: number;
  discussions: number;
  onlineCourses: number;
  extracurricular: number;
  eduTech: number;
}

interface BehaviorFormActions {
  updateField: <K extends keyof BehaviorFormState>(
    key: K,
    value: BehaviorFormState[K]
  ) => void;
  resetForm: () => void;
}

// ✅ Zustand store for behavior data
export const useBehaviorFormStore = create<BehaviorFormState & BehaviorFormActions>(
  (set) => ({
    studyHours: 0,
    attendance: 0,
    assignmentCompletion: 0,
    motivation: 0,
    learningStyle: 0,
    stressLevel: 0,
    resources: 0,
    internet: 0,
    discussions: 0,
    onlineCourses: 0,
    extracurricular: 0,
    eduTech: 0,

    updateField: (key, value) =>
      set((state) => ({
        ...state,
        [key]: value,
      })),

    resetForm: () =>
      set({
        studyHours: 0,
        attendance: 0,
        assignmentCompletion: 0,
        motivation: 0,
        learningStyle: 0,
        stressLevel: 0,
        resources: 0,
        internet: 0,
        discussions: 0,
        onlineCourses: 0,
        extracurricular: 0,
        eduTech: 0,
      }),
  })
);
