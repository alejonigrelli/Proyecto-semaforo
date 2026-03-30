import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { ProfileSection } from '../Profile/ProfileSection';
import { StudentList } from '../Students/StudentList';
import { ExportModal } from '../Export/ExportModal';
import { LogOut, User, GraduationCap, Moon, Sun } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

interface DashboardProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export function Dashboard({ darkMode, toggleDarkMode }: DashboardProps) {
  const { professor, signOut } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'students' | 'profile'>('students');
  const [showExportModal, setShowExportModal] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Sesión cerrada correctamente');
    } catch (error) {
      toast.error('Error al cerrar sesión');
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-blue-50'}`}>
      <nav className={`shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <GraduationCap className={`w-8 h-8 ${darkMode ? 'text-blue-400' : 'text-blue-600'} mr-2`} />
              <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Panel del Profesor
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <div className={`hidden md:block text-right ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <p className="font-semibold">
                  {professor?.first_name && professor?.last_name
                    ? `${professor.first_name} ${professor.last_name}`
                    : 'Profesor'}
                </p>
              </div>

              {professor?.profile_photo_url && (
                <img
                  src={professor.profile_photo_url}
                  alt="Perfil"
                  className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
                />
              )}

              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg transition ${
                  darkMode ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <button
                onClick={handleSignOut}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center"
              >
                <LogOut className="w-5 h-5 mr-2" />
                <span className="hidden md:inline">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className={`flex gap-2 p-1 rounded-lg inline-flex ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <button
              onClick={() => setActiveTab('students')}
              className={`py-2 px-6 rounded-lg font-semibold transition-all ${
                activeTab === 'students'
                  ? 'bg-blue-500 text-white shadow-md'
                  : darkMode
                  ? 'text-gray-300 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <GraduationCap className="w-5 h-5 inline mr-2" />
              Estudiantes
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-2 px-6 rounded-lg font-semibold transition-all ${
                activeTab === 'profile'
                  ? 'bg-blue-500 text-white shadow-md'
                  : darkMode
                  ? 'text-gray-300 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <User className="w-5 h-5 inline mr-2" />
              Mi Perfil
            </button>
          </div>
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'students' ? (
            <StudentList onExport={() => setShowExportModal(true)} />
          ) : (
            <ProfileSection />
          )}
        </motion.div>
      </div>

      {showExportModal && <ExportModal onClose={() => setShowExportModal(false)} />}
    </div>
  );
}
