import { createContext, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setProfessor, setLoading, setInitialized } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          setUser(session.user);

          const { data: professor } = await supabase
            .from('professors')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (professor) {
            setProfessor(professor);
          } else {
            const { data: newProfessor } = await supabase
              .from('professors')
              .insert({ id: session.user.id })
              .select()
              .single();

            if (newProfessor) {
              setProfessor(newProfessor);
            }
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);

          const { data: professor } = await supabase
            .from('professors')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (professor) {
            setProfessor(professor);
          } else {
            const { data: newProfessor } = await supabase
              .from('professors')
              .insert({ id: session.user.id })
              .select()
              .single();

            if (newProfessor) {
              setProfessor(newProfessor);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfessor(null);
        }

        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setProfessor, setLoading, setInitialized]);

  return <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>;
}
