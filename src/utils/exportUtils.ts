import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, WidthType, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import type { Database } from '../lib/database.types';

type Student = Database['public']['Tables']['students']['Row'];

interface ExportData {
  students: Student[];
  professorName: string;
  exportDate: string;
}

const getGradeStatus = (grade: number) => {
  if (grade >= 80) return 'Promocionado';
  if (grade >= 60) return 'Regular';
  return 'Desaprobado';
};

const getGradeColor = (grade: number): [number, number, number] => {
  if (grade >= 80) return [34, 197, 94];
  if (grade >= 60) return [234, 179, 8];
  return [239, 68, 68];
};

export const exportToExcel = ({ students, professorName, exportDate }: ExportData) => {
  const data = students.map((student) => ({
    Apellido: student.last_name,
    Nombre: student.first_name,
    Legajo: student.legajo,
    Nota: student.grade,
    Estado: getGradeStatus(student.grade),
    Observaciones: student.observations || '',
  }));

  const ws = XLSX.utils.json_to_sheet(data);

  ws['!cols'] = [
    { wch: 15 },
    { wch: 15 },
    { wch: 12 },
    { wch: 8 },
    { wch: 15 },
    { wch: 40 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Estudiantes');

  XLSX.writeFile(wb, `estudiantes_${professorName}_${exportDate}.xlsx`);
};

export const exportToPDF = ({ students, professorName, exportDate }: ExportData) => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text('Lista de Estudiantes', 14, 20);

  doc.setFontSize(11);
  doc.text(`Profesor: ${professorName}`, 14, 30);
  doc.text(`Fecha de exportación: ${exportDate}`, 14, 37);

  const tableData = students.map((student) => [
    student.last_name,
    student.first_name,
    student.legajo,
    student.grade.toString(),
    getGradeStatus(student.grade),
    student.observations || '-',
  ]);

  autoTable(doc, {
    startY: 45,
    head: [['Apellido', 'Nombre', 'Legajo', 'Nota', 'Estado', 'Observaciones']],
    body: tableData,
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: 'bold',
    },
    columnStyles: {
      3: { halign: 'center', fontStyle: 'bold' },
      4: { halign: 'center' },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 4) {
        const grade = students[data.row.index].grade;
        const color = getGradeColor(grade);
        data.cell.styles.textColor = color;
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });

  doc.save(`estudiantes_${professorName}_${exportDate}.pdf`);
};

export const exportToWord = async ({ students, professorName, exportDate }: ExportData) => {
  const tableRows = [
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ text: 'Apellido', bold: true })],
          shading: { fill: '3B82F6' },
        }),
        new TableCell({
          children: [new Paragraph({ text: 'Nombre', bold: true })],
          shading: { fill: '3B82F6' },
        }),
        new TableCell({
          children: [new Paragraph({ text: 'Legajo', bold: true })],
          shading: { fill: '3B82F6' },
        }),
        new TableCell({
          children: [new Paragraph({ text: 'Nota', bold: true })],
          shading: { fill: '3B82F6' },
        }),
        new TableCell({
          children: [new Paragraph({ text: 'Estado', bold: true })],
          shading: { fill: '3B82F6' },
        }),
        new TableCell({
          children: [new Paragraph({ text: 'Observaciones', bold: true })],
          shading: { fill: '3B82F6' },
        }),
      ],
    }),
    ...students.map(
      (student) =>
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph(student.last_name)],
            }),
            new TableCell({
              children: [new Paragraph(student.first_name)],
            }),
            new TableCell({
              children: [new Paragraph(student.legajo)],
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: student.grade.toString(),
                      bold: true,
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
              ],
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: getGradeStatus(student.grade),
                      bold: true,
                      color: student.grade >= 80 ? '22C55E' : student.grade >= 60 ? 'EAB308' : 'EF4444',
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
              ],
            }),
            new TableCell({
              children: [new Paragraph(student.observations || '-')],
            }),
          ],
        })
    ),
  ];

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: 'Lista de Estudiantes',
                bold: true,
                size: 32,
              }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Profesor: ${professorName}`,
                size: 22,
              }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Fecha de exportación: ${exportDate}`,
                size: 22,
              }),
            ],
            spacing: { after: 300 },
          }),
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            rows: tableRows,
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `estudiantes_${professorName}_${exportDate}.docx`);
};
