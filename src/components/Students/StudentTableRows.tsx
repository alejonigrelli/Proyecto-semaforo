import { Edit, Trash2 } from 'lucide-react';
import type { Database } from '../../lib/database.types';

type Student = Database['public']['Tables']['students']['Row'];

interface StudentTableRowsProps {
  students: Student[];
  onEdit: (student: Student) => void;
  onDelete: (id: string) => void;
  onConfirmDelete: (id: string) => void;
  deleteConfirm: string | null;
  getGradeStatus: (grade: number) => { color: string; label: string };
}

export function StudentTableRows({
  students,
  onEdit,
  onDelete,
  onConfirmDelete,
  deleteConfirm,
  getGradeStatus,
}: StudentTableRowsProps) {
  if (students.length === 0) {
    return null;
  }

  const ROW_HEIGHT = 53;
  const MAX_VISIBLE_ROWS = Math.min(students.length, 15);

  return (
    <div
      style={{
        height: Math.min(students.length * ROW_HEIGHT, MAX_VISIBLE_ROWS * ROW_HEIGHT),
        overflow: 'auto',
      }}
    >
      <table className="w-full">
        <tbody className="bg-white divide-y divide-gray-200">
          {students.map((student) => {
            const status = getGradeStatus(student.grade);
            return (
              <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-4 sticky left-0 bg-inherit">
                  <div className="relative group">
                    <div className={`w-4 h-4 rounded-full ${status.color}`} />
                    <div className="absolute left-6 top-0 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                      {status.label}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm font-medium text-gray-900">
                  {student.last_name}
                </td>
                <td className="px-4 py-4 text-sm text-gray-500">
                  {student.first_name}
                </td>
                <td className="px-4 py-4 text-sm text-gray-500">
                  {student.legajo}
                </td>
                <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                  {student.grade}
                </td>
                <td className="px-4 py-4 text-sm text-gray-500 max-w-xs truncate">
                  {student.observations || '-'}
                </td>
                <td className="px-4 py-4 text-right text-sm sticky right-0 bg-inherit">
                  {deleteConfirm === student.id ? (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onConfirmDelete(student.id)}
                        className="text-red-600 hover:text-red-800 font-semibold transition"
                      >
                        Confirmar
                      </button>
                      <button
                        onClick={() => onDelete('')}
                        className="text-gray-600 hover:text-gray-800 transition"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onEdit(student)}
                        className="text-blue-600 hover:text-blue-800 transition p-1 hover:bg-blue-50 rounded"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => onDelete(student.id)}
                        className="text-red-600 hover:text-red-800 transition p-1 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
