import { create } from "zustand";

export interface BehaviorForm {
  // numeric fields
  studyHours: number;
  attendance: number;
  resources: number;
  motivation: number;
  discussions: number;
  assignmentCompletion: number;
  

  // boolean
  internet: boolean;
  extracurricular: boolean;
  onlineCourses: boolean;
  eduTech: boolean;

  // string / categorical
  gender: string;
  age: string;
  learningStyle: string;
  stressLevel: string;
}

interface BehaviorFormStore {
  form: BehaviorForm;
  updateField: <K extends keyof BehaviorForm>(
    key: K,
    value: BehaviorForm[K]
  ) => void;
  resetForm: () => void;
}

export const useBehaviorFormStore = create<BehaviorFormStore>((set) => ({
  form: {
    studyHours: 0,
    attendance: 0,
    resources: 0,
    extracurricular: false,
    motivation: 0,
    onlineCourses: false,
    discussions: 0,
    assignmentCompletion: 0,
    eduTech: false,
    internet: false,
    gender: "",
    age: "",
    learningStyle: "",
    stressLevel: "",
  },

  updateField: (key, value) =>
    set((state) => ({
      form: { ...state.form, [key]: value },
    })),

  resetForm: () =>
    set({
      form: {
        studyHours: 0,
        attendance: 0,
        resources: 0,
        extracurricular: false,
        motivation: 0,
        onlineCourses: false,
        discussions: 0,
        assignmentCompletion: 0,
        eduTech: false,
        internet: false,
        gender: "",
        age: "",
        learningStyle: "",
        stressLevel: "",
      },
    }),
}));
