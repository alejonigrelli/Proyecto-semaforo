import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { Database } from '../lib/database.types';

type Professor = Database['public']['Tables']['professors']['Row'];

interface AuthState {
  user: User | null;
  professor: Professor | null;
  loading: boolean;
  initialized: boolean;
  setUser: (user: User | null) => void;
  setProfessor: (professor: Professor | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  professor: null,
  loading: true,
  initialized: false,
  setUser: (user) => set({ user }),
  setProfessor: (professor) => set({ professor }),
  setLoading: (loading) => set({ loading }),
  setInitialized: (initialized) => set({ initialized }),
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, professor: null });
  },
}));
