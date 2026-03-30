import { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { useAuthStore } from './stores/authStore';
import { Login } from './components/Auth/Login';
import { Register } from './components/Auth/Register';
import { Dashboard } from './components/Dashboard/Dashboard';
import { ToastContainer } from 'react-toastify';
import { Loader2 } from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';

function AppContent() {
  const { user, loading, initialized } = useAuthStore();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-100 flex items-center justify-center p-4">
        {authMode === 'login' ? (
          <Login onToggleMode={() => setAuthMode('register')} />
        ) : (
          <Register onToggleMode={() => setAuthMode('login')} />
        )}
      </div>
    );
  }

  return <Dashboard darkMode={darkMode} toggleDarkMode={toggleDarkMode} />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </AuthProvider>
  );
}

export default App;
