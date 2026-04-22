# Panel del Profesor - Gestión de Estudiantes

Una aplicación web moderna y optimizada para que docentes gestionen el registro, seguimiento y análisis del desempeño académico de sus estudiantes.

## Características Principales

### 🔐 Autenticación Segura
- Registro e inicio de sesión con email y contraseña
- Autenticación basada en Supabase Auth
- Sesiones persistentes con recuperación automática
- Cierre de sesión seguro

### 👤 Gestión de Perfil
- Edición de nombre, apellido y datos personales
- Carga de foto de perfil con validación
- Almacenamiento seguro en Supabase Storage
- Perfiles completamente personalizables

### 🧾 Gestión de Estudiantes
- **CRUD Completo**: Crear, leer, actualizar y eliminar estudiantes
- **Campos Detallados**:
  - Nombre y apellido
  - Número de legajo (único por profesor)
  - Nota (0-100)
  - Observaciones adicionales
- **Búsqueda Avanzada**: Filtrar por nombre, apellido o legajo en tiempo real
- **Ordenamiento Flexible**:
  - Apellido (A-Z / Z-A)
  - Nota (Mayor a Menor / Menor a Mayor)
- **Confirmación de Eliminación**: Previene eliminaciones accidentales

### 📊 Indicadores Visuales de Desempeño
Estado del estudiante con código de colores:
- 🟢 **Verde (80-100)**: Promocionado
- 🟡 **Amarillo (60-79)**: Regular
- 🔴 **Rojo (0-59)**: Desaprobado

Tooltips informativos al pasar el cursor sobre los indicadores.

### 💾 Exportación de Datos
Descarga la lista completa de estudiantes en múltiples formatos:
- **Excel (.xlsx)**: Compatible con Microsoft Excel y Google Sheets
- **Word (.docx)**: Documento formateado profesionalmente
- **PDF (.pdf)**: Tablas con colores y estructura clara

Todos los exports incluyen:
- Nombre del profesor
- Fecha de exportación
- Información completa del estudiante
- Códigos de color de estado académico

### 🌙 Modo Oscuro
- Toggle de tema oscuro/claro
- Persistencia en localStorage
- Interfaz optimizada para ambos modos
- Transiciones suaves entre temas

### ⚡ Optimización de Rendimiento
- **Renderizado Eficiente**: Memoización con `useMemo()` y `useCallback()`
- **Sin Bloqueos**: Maneja 100+ estudiantes sin lag
- **Búsqueda Instantánea**: Filtrado en tiempo real sin demoras
- **Scroll Optimizado**: Tabla con scroll contenido
- **Transiciones CSS**: Reemplaza animaciones pesadas con CSS moderno

### 📱 Diseño Responsive
- Interfaz fluida en móvil, tablet y escritorio
- Layout adaptativo con Tailwind CSS
- Navegación intuitiva en todos los dispositivos

### 🔔 Notificaciones
- Toast notifications para todas las acciones
- Feedback visual inmediato
- Mensajes de error claros y útiles

## Stack Tecnológico

### Frontend
- **React 18** - Librería de interfaz de usuario
- **TypeScript** - Tipado estático para mayor seguridad
- **Vite** - Build tool ultrarrápido
- **Tailwind CSS** - Estilos utilitarios responsive
- **Lucide React** - Iconografía moderna

### Backend & Base de Datos
- **Supabase** - Backend as a Service
  - Autenticación con email/password
  - Base de datos PostgreSQL
  - Storage para imágenes
  - Row Level Security (RLS) para privacidad

### Estado & Librerías
- **Zustand** - Gestión de estado simple y eficiente
- **Framer Motion** - Animaciones suaves
- **React Toastify** - Notificaciones toast
- **React Window** - Virtualización de listas (optimización)

### Exportación de Datos
- **XLSX** - Generación de archivos Excel
- **jsPDF** - Generación de PDF con tablas
- **docx** - Creación de documentos Word
- **File Saver** - Descarga de archivos en el navegador

## Instalación y Configuración

### Requisitos Previos
- Node.js 16+ 
- npm o yarn
- Cuenta de Supabase (gratuita)

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/usuario/panel-profesor.git
cd panel-profesor
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
Crear archivo `.env` en la raíz del proyecto:
```env
VITE_SUPABASE_URL=https://tuproyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_aqui
```

4. **Iniciar servidor de desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### Configuración de Supabase

1. Crear proyecto en [Supabase](https://supabase.com)
2. Las tablas se crean automáticamente con las migraciones
3. Configurar Storage bucket para `profile-photos`
4. Las políticas RLS se activan automáticamente

## Estructura del Proyecto

```
src/
├── components/
│   ├── Auth/
│   │   ├── Login.tsx
│   │   └── Register.tsx
│   ├── Dashboard/
│   │   └── Dashboard.tsx
│   ├── Students/
│   │   ├── StudentList.tsx
│   │   ├── StudentForm.tsx
│   │   └── StudentTableRows.tsx
│   ├── Profile/
│   │   └── ProfileSection.tsx
│   └── Export/
│       └── ExportModal.tsx
├── contexts/
│   └── AuthContext.tsx
├── stores/
│   ├── authStore.ts
│   └── studentsStore.ts
├── lib/
│   ├── supabase.ts
│   └── database.types.ts
├── utils/
│   └── exportUtils.ts
├── App.tsx
└── main.tsx
```

## Seguridad

### Row Level Security (RLS)
- Cada profesor solo ve sus propios estudiantes
- Datos protegidos a nivel de base de datos
- Políticas automáticas en Supabase

### Validaciones
- Email y contraseña en registro
- Validación de nota (0-100)
- Legajo único por profesor
- Tamaño máximo de imagen (2MB)

### Almacenamiento de Archivos
- Fotos de perfil en Storage bucket privado
- URLs públicas para lectura
- Solo el propietario puede modificar su foto

## Uso

### Primer Acceso
1. Haz clic en "Registrarse"
2. Ingresa email y contraseña
3. Se creará tu perfil automáticamente

### Gestionar Estudiantes
1. Ve a la pestaña "Estudiantes"
2. Haz clic en "Agregar" para crear nuevo estudiante
3. Completa los campos requeridos
4. Usa el buscador para encontrar estudiantes rápidamente
5. Ordena por nombre o nota según necesites

### Actualizar Perfil
1. Ve a la pestaña "Mi Perfil"
2. Haz clic en "Editar Perfil"
3. Cambia tu información
4. Carga una foto haciendo clic en la imagen
5. Haz clic en "Guardar"

### Exportar Datos
1. Ve a "Estudiantes"
2. Haz clic en "Exportar"
3. Selecciona el formato deseado
4. El archivo se descargará automáticamente

## Rendimiento

La aplicación está optimizada para manejar:
- ✅ 100+ estudiantes sin lag
- ✅ Búsqueda instantánea
- ✅ Cambios de ordenamiento fluidos
- ✅ Animaciones suaves
- ✅ Carga de imágenes rápida

## Desarrollo

### Comandos Disponibles
```bash
# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build

# Vista previa de build de producción
npm run preview

# Verificar tipos TypeScript
npm run typecheck

# Ejecutar ESLint
npm run lint
```

### Variables de Entorno Disponibles
```
VITE_SUPABASE_URL      - URL de Supabase
VITE_SUPABASE_ANON_KEY - Clave anónima de Supabase
```

## Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Roadmap

- [ ] Reporte de calificaciones por período
- [ ] Gráficos de desempeño académico
- [ ] Sistema de asistencia
- [ ] Notas por tema/materia
- [ ] Generación de reportes PDF personalizados
- [ ] Exportación a formato CSV
- [ ] API para integración con sistemas educativos
- [ ] Soporte multidioma

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Soporte

Para reportar bugs o solicitar features, por favor abre un [Issue](https://github.com/usuario/panel-profesor/issues).

## Autores

Desarrollado con ❤️ para educadores que buscan herramientas modernas de gestión académica.

---

**Nota**: Esta aplicación respeta la privacidad de los datos. Toda la información de estudiantes está protegida con Row Level Security de Supabase y no es compartida con terceros.
