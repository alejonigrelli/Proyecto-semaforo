import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-toastify';
import { LogIn, Mail, Lock, Loader2 } from 'lucide-react';

interface LoginProps {
  onToggleMode: () => void;
}

export function Login({ onToggleMode }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!email.trim()) {
      toast.error('El email es requerido');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Por favor ingrese un email válido');
      return false;
    }

    if (!password) {
      toast.error('La contraseña es requerida');
      return false;
    }

    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Credenciales inválidas');
        } else if (error.message.includes('Email not confirmed')) {
          toast.error('Por favor confirme su email');
        } else {
          toast.error(error.message);
        }
        return;
      }

      toast.success('Sesión iniciada correctamente');
    } catch (error) {
      toast.error('Error al iniciar sesión');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-center mb-8">
          <div className="bg-blue-500 p-3 rounded-full">
            <LogIn className="w-8 h-8 text-white" />
          </div>
        </div>

        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Bienvenido
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Ingrese a su cuenta para continuar
        </p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="profesor@ejemplo.com"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Iniciando sesión...
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5 mr-2" />
                Iniciar Sesión
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            ¿No tiene una cuenta?{' '}
            <button
              onClick={onToggleMode}
              className="text-blue-500 hover:text-blue-600 font-semibold transition"
            >
              Registrarse
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
