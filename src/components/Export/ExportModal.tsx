import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useStudentsStore } from '../../stores/studentsStore';
import { exportToExcel, exportToPDF, exportToWord } from '../../utils/exportUtils';
import { toast } from 'react-toastify';
import { X, FileSpreadsheet, FileText, Download, Loader2 } from 'lucide-react';

interface ExportModalProps {
  onClose: () => void;
}

export function ExportModal({ onClose }: ExportModalProps) {
  const { professor } = useAuthStore();
  const { students } = useStudentsStore();
  const [exporting, setExporting] = useState(false);

  const handleExport = async (format: 'excel' | 'word' | 'pdf') => {
    if (students.length === 0) {
      toast.error('No hay estudiantes para exportar');
      return;
    }

    setExporting(true);

    try {
      const professorName = professor?.first_name && professor?.last_name
        ? `${professor.first_name}_${professor.last_name}`
        : 'Profesor';

      const exportDate = new Date().toLocaleDateString('es-AR').replace(/\//g, '-');

      const exportData = {
        students,
        professorName,
        exportDate,
      };

      switch (format) {
        case 'excel':
          exportToExcel(exportData);
          toast.success('Archivo Excel exportado correctamente');
          break;
        case 'word':
          await exportToWord(exportData);
          toast.success('Archivo Word exportado correctamente');
          break;
        case 'pdf':
          exportToPDF(exportData);
          toast.success('Archivo PDF exportado correctamente');
          break;
      }

      onClose();
    } catch (error) {
      toast.error('Error al exportar el archivo');
      console.error('Export error:', error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h3 className="text-2xl font-bold text-gray-800 flex items-center">
            <Download className="w-6 h-6 mr-2" />
            Exportar Estudiantes
          </h3>
          <button
            onClick={onClose}
            disabled={exporting}
            className="text-gray-500 hover:text-gray-700 transition disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-gray-600 mb-4">
            Seleccione el formato en el que desea exportar la lista de estudiantes:
          </p>

          <button
            onClick={() => handleExport('excel')}
            disabled={exporting}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-6 rounded-lg transition flex items-center justify-center disabled:opacity-50"
          >
            {exporting ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <FileSpreadsheet className="w-6 h-6 mr-3" />
                <span>Exportar a Excel (.xlsx)</span>
              </>
            )}
          </button>

          <button
            onClick={() => handleExport('word')}
            disabled={exporting}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg transition flex items-center justify-center disabled:opacity-50"
          >
            {exporting ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <FileText className="w-6 h-6 mr-3" />
                <span>Exportar a Word (.docx)</span>
              </>
            )}
          </button>

          <button
            onClick={() => handleExport('pdf')}
            disabled={exporting}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-4 px-6 rounded-lg transition flex items-center justify-center disabled:opacity-50"
          >
            {exporting ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <FileText className="w-6 h-6 mr-3" />
                <span>Exportar a PDF (.pdf)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
