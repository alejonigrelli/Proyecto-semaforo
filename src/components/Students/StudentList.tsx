import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { useStudentsStore } from '../../stores/studentsStore';
import { toast } from 'react-toastify';
import {
  GraduationCap,
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  Download,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { StudentForm } from './StudentForm';
import { StudentTableRows } from './StudentTableRows';
import type { Database } from '../../lib/database.types';

type Student = Database['public']['Tables']['students']['Row'];

type SortType = 'name-asc' | 'name-desc' | 'grade-asc' | 'grade-desc';

interface StudentListProps {
  onExport: () => void;
}

export function StudentList({ onExport }: StudentListProps) {
  const { user } = useAuthStore();
  const { students, setStudents, deleteStudent } = useStudentsStore();
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortType>('name-asc');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadStudents();
  }, [user]);

  const loadStudents = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('professor_id', user.id)
        .order('last_name');

      if (error) throw error;

      setStudents(data || []);
    } catch (error) {
      toast.error('Error al cargar los estudiantes');
      console.error('Load students error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('students').delete().eq('id', id);

      if (error) throw error;

      deleteStudent(id);
      toast.success('Estudiante eliminado correctamente');
      setDeleteConfirm(null);
    } catch (error) {
      toast.error('Error al eliminar el estudiante');
      console.error('Delete student error:', error);
    }
  };

  const getGradeStatus = useCallback((grade: number) => {
    if (grade >= 80) return { color: 'bg-green-500', label: 'Promocionado' };
    if (grade >= 60) return { color: 'bg-yellow-500', label: 'Regular' };
    return { color: 'bg-red-500', label: 'Desaprobado' };
  }, []);

  const filteredAndSortedStudents = useMemo(() => {
    let result = students.filter(
      (student) =>
        student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.legajo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    result.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.last_name.localeCompare(b.last_name);
        case 'name-desc':
          return b.last_name.localeCompare(a.last_name);
        case 'grade-asc':
          return a.grade - b.grade;
        case 'grade-desc':
          return b.grade - a.grade;
        default:
          return 0;
      }
    });

    return result;
  }, [students, searchTerm, sortBy]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <GraduationCap className="w-6 h-6 mr-2" />
            Mis Estudiantes ({students.length})
          </h2>
          <div className="flex gap-2">
            <button
              onClick={onExport}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center"
            >
              <Download className="w-5 h-5 mr-2" />
              Exportar
            </button>
            <button
              onClick={() => {
                setSelectedStudent(undefined);
                setShowForm(true);
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Agregar
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre, apellido o legajo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortType)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          >
            <option value="name-asc">Apellido (A-Z)</option>
            <option value="name-desc">Apellido (Z-A)</option>
            <option value="grade-desc">Nota (Mayor a Menor)</option>
            <option value="grade-asc">Nota (Menor a Mayor)</option>
          </select>
        </div>

        {filteredAndSortedStudents.length === 0 ? (
          <div className="text-center py-12">
            <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {searchTerm
                ? 'No se encontraron estudiantes'
                : 'No hay estudiantes registrados'}
            </p>
          </div>
        ) : (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Apellido
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                      Legajo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                      Nota
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Observaciones
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                      Acciones
                    </th>
                  </tr>
                </thead>
              </table>
            </div>
            <div className="border-t border-gray-200 bg-white">
              <StudentTableRows
                students={filteredAndSortedStudents}
                onEdit={(student) => {
                  setSelectedStudent(student);
                  setShowForm(true);
                }}
                onDelete={(id) => setDeleteConfirm(id)}
                onConfirmDelete={handleDelete}
                deleteConfirm={deleteConfirm}
                getGradeStatus={getGradeStatus}
              />
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <StudentForm
          student={selectedStudent}
          onClose={() => {
            setShowForm(false);
            setSelectedStudent(undefined);
          }}
        />
      )}
    </>
  );
}
