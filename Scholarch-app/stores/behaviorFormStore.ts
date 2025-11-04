// stores/behaviorFormStore.ts
import { create } from "zustand";

interface BehaviorFormState {
  form: {
    studyHours: number;
    attendance: number;
    assignmentCompletion: number;
    motivation: string;
    resources: boolean;
    extracurricular: boolean;
    onlineCourses: boolean;
    discussions: number;
    eduTech: boolean;
    age: string;
    gender: string;
    learningStyle: string;
    internet: boolean;
    stressLevel: string;
  };
  updateField: (key: keyof BehaviorFormState["form"], value: any) => void;
  resetForm: () => void;
}

export const useBehaviorFormStore = create<BehaviorFormState>((set) => ({
  form: {
    studyHours: 0,
    attendance: 0,
    assignmentCompletion: 0,
    motivation: "Medium",
    resources: false,
    extracurricular: false,
    onlineCourses: false,
    discussions: 0,
    eduTech: false,
    age: "",
    gender: "",
    learningStyle: "",
    internet: false,
    stressLevel: "Medium",
  },
  updateField: (key, value) =>
    set((state) => ({ form: { ...state.form, [key]: value } })),
  resetForm: () =>
    set({
      form: {
        studyHours: 0,
        attendance: 0,
        assignmentCompletion: 0,
        motivation: "Medium",
        resources: false,
        extracurricular: false,
        onlineCourses: false,
        discussions: 0,
        eduTech: false,
        age: "",
        gender: "",
        learningStyle: "",
        internet: false,
        stressLevel: "Medium",
      },
    }),
}));
