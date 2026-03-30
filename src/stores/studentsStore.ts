import { create } from 'zustand';
import type { Database } from '../lib/database.types';

type Student = Database['public']['Tables']['students']['Row'];

interface StudentsState {
  students: Student[];
  setStudents: (students: Student[]) => void;
  addStudent: (student: Student) => void;
  updateStudent: (id: string, student: Student) => void;
  deleteStudent: (id: string) => void;
}

export const useStudentsStore = create<StudentsState>((set) => ({
  students: [],
  setStudents: (students) => set({ students }),
  addStudent: (student) =>
    set((state) => ({ students: [...state.students, student] })),
  updateStudent: (id, student) =>
    set((state) => ({
      students: state.students.map((s) => (s.id === id ? student : s)),
    })),
  deleteStudent: (id) =>
    set((state) => ({
      students: state.students.filter((s) => s.id !== id),
    })),
}));
