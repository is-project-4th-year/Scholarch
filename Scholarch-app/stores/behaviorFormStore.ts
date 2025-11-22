
import { create } from "zustand";

export interface BehaviorFormState {
  StudyHours: number;
  Attendance: number;
  AssignmentCompletion: number;
  Motivation: number; // 0=Low,1=Medium,2=High
  LearningStyle: number; // 0=Visual,1=Auditory,2=Kinesthetic,3=Reading/Writing
  StressLevel: number; // 0=Low,1=Medium,2=High
  Resources: number;
  Internet: number;
  Discussions: number;
  OnlineCourses: number;
  Extracurricular: number;
  EduTech: number;
}

interface BehaviorFormActions {
  updateField: <K extends keyof BehaviorFormState>(
    key: K,
    value: BehaviorFormState[K]
  ) => void;
  resetForm: () => void;
  getCleanData: () => BehaviorFormState; // ✅ new helper
}

// ✅ Zustand store for behavior data
export const useBehaviorFormStore = create<BehaviorFormState & BehaviorFormActions>(
  (set, get) => ({
    // Default values
    StudyHours: 0,
    Attendance: 0,
    AssignmentCompletion: 0,
    Motivation: 0,
    LearningStyle: 0,
    StressLevel: 0,
    Resources: 0,
    Internet: 0,
    Discussions: 0,
    OnlineCourses: 0,
    Extracurricular: 0,
    EduTech: 0,

    // Actions
    updateField: (key, value) =>
      set((state) => ({
        ...state,
        [key]: value,
      })),

    resetForm: () =>
      set({
        StudyHours: 0,
        Attendance: 0,
        AssignmentCompletion: 0,
        Motivation: 0,
        LearningStyle: 0,
        StressLevel: 0,
        Resources: 0,
        Internet: 0,
        Discussions: 0,
        OnlineCourses: 0,
        Extracurricular: 0,
        EduTech: 0,
      }),

    // ✅ Helper function to return only clean data
    getCleanData: () => {
      const { updateField, resetForm, getCleanData, ...data } = get();
      return data; // only numeric/primitive fields
    },
  })
);
