import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { useStudentsStore } from '../../stores/studentsStore';
import { toast } from 'react-toastify';
import { X, Save, Loader2 } from 'lucide-react';
import type { Database } from '../../lib/database.types';

type Student = Database['public']['Tables']['students']['Row'];

interface StudentFormProps {
  student?: Student;
  onClose: () => void;
}

export function StudentForm({ student, onClose }: StudentFormProps) {
  const { user } = useAuthStore();
  const { addStudent, updateStudent } = useStudentsStore();
  const [firstName, setFirstName] = useState(student?.first_name || '');
  const [lastName, setLastName] = useState(student?.last_name || '');
  const [legajo, setLegajo] = useState(student?.legajo || '');
  const [grade, setGrade] = useState(student?.grade.toString() || '');
  const [observations, setObservations] = useState(student?.observations || '');
  const [saving, setSaving] = useState(false);

  const validateForm = () => {
    if (!firstName.trim()) {
      toast.error('El nombre es requerido');
      return false;
    }

    if (!lastName.trim()) {
      toast.error('El apellido es requerido');
      return false;
    }

    if (!legajo.trim()) {
      toast.error('El legajo es requerido');
      return false;
    }

    const gradeNum = parseInt(grade);
    if (isNaN(gradeNum) || gradeNum < 0 || gradeNum > 100) {
      toast.error('La nota debe estar entre 0 y 100');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !user) return;

    setSaving(true);

    try {
      const studentData = {
        professor_id: user.id,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        legajo: legajo.trim(),
        grade: parseInt(grade),
        observations: observations.trim(),
      };

      if (student) {
        const { data, error } = await supabase
          .from('students')
          .update(studentData)
          .eq('id', student.id)
          .select()
          .single();

        if (error) {
          if (error.message.includes('duplicate key')) {
            toast.error('Ya existe un estudiante con ese legajo');
          } else {
            throw error;
          }
          return;
        }

        updateStudent(student.id, data);
        toast.success('Estudiante actualizado correctamente');
      } else {
        const { data, error } = await supabase
          .from('students')
          .insert(studentData)
          .select()
          .single();

        if (error) {
          if (error.message.includes('duplicate key')) {
            toast.error('Ya existe un estudiante con ese legajo');
          } else {
            throw error;
          }
          return;
        }

        addStudent(data);
        toast.success('Estudiante agregado correctamente');
      }

      onClose();
    } catch (error) {
      toast.error('Error al guardar el estudiante');
      console.error('Save student error:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h3 className="text-2xl font-bold text-gray-800">
            {student ? 'Editar Estudiante' : 'Agregar Estudiante'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Juan"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Apellido <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Pérez"
                disabled={saving}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Legajo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={legajo}
                onChange={(e) => setLegajo(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="12345"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nota (0-100) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="85"
                disabled={saving}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones
            </label>
            <textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
              placeholder="Notas adicionales sobre el estudiante..."
              disabled={saving}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  {student ? 'Actualizar' : 'Guardar'}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
