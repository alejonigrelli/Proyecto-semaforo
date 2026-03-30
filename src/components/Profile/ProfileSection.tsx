import { useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { toast } from 'react-toastify';
import { User, Camera, Save, Loader2 } from 'lucide-react';
import type { Database } from '../../lib/database.types';

type Professor = Database['public']['Tables']['professors']['Row'];

export function ProfileSection() {
  const { professor, setProfessor, user } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(professor?.first_name || '');
  const [lastName, setLastName] = useState(professor?.last_name || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor seleccione una imagen válida');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('La imagen no debe superar los 2MB');
      return;
    }

    setUploading(true);

    try {
      if (professor?.profile_photo_url) {
        const oldPath = professor.profile_photo_url.split('/').pop();
        if (oldPath) {
          await supabase.storage
            .from('profile-photos')
            .remove([`${user.id}/${oldPath}`]);
        }
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from('profile-photos').getPublicUrl(filePath);

      const { data: updatedProfessor, error: updateError } = await supabase
        .from('professors')
        .update({ profile_photo_url: publicUrl })
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      setProfessor(updatedProfessor);
      toast.success('Foto actualizada correctamente');
    } catch (error) {
      toast.error('Error al subir la foto');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    if (!firstName.trim() || !lastName.trim()) {
      toast.error('Nombre y apellido son requeridos');
      return;
    }

    setSaving(true);

    try {
      const { data: updatedProfessor, error } = await supabase
        .from('professors')
        .update({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      setProfessor(updatedProfessor);
      setEditing(false);
      toast.success('Perfil actualizado correctamente');
    } catch (error) {
      toast.error('Error al actualizar el perfil');
      console.error('Save profile error:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <User className="w-6 h-6 mr-2" />
        Mi Perfil
      </h2>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
              {professor?.profile_photo_url ? (
                <img
                  src={professor.profile_photo_url}
                  alt="Foto de perfil"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-16 h-16 text-gray-400" />
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full transition disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Camera className="w-5 h-5" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">Máximo 2MB</p>
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={!editing}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 transition"
              placeholder="Ingrese su nombre"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Apellido
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={!editing}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 transition"
              placeholder="Ingrese su apellido"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
            />
          </div>

          <div className="flex gap-3 pt-4">
            {editing ? (
              <>
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Guardar
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setFirstName(professor?.first_name || '');
                    setLastName(professor?.last_name || '');
                  }}
                  disabled={saving}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50"
                >
                  Cancelar
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                Editar Perfil
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
