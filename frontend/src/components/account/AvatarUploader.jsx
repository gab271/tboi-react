import { useState, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';

export default function AvatarUploader({ url, size, onUpload }) {
  const { user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useState(() => {
    if (url) downloadImage(url);
  }, [url]);

  async function downloadImage(path) {
    try {
      const { data, error } = await supabase.storage.from('avatars').download(path);
      if (error) {
        throw error;
      }
      const url = URL.createObjectURL(data);
      setAvatarUrl(url);
    } catch (error) {
      console.log('Error downloading image: ', error.message);
    }
  }

  const uploadAvatar = async (event) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      onUpload(event, filePath);
      
      // Update local preview immediately
      const { data } = await supabase.storage.from('avatars').download(filePath);
      const url = URL.createObjectURL(data);
      setAvatarUrl(url);

    } catch (error) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt="Avatar"
          className="rounded-full object-cover border-4 border-gray-700"
          style={{ height: size, width: size }}
        />
      ) : (
        <div 
            className="rounded-full bg-gray-700 flex items-center justify-center border-4 border-gray-600"
            style={{ height: size, width: size }}
        >
            <span className="text-2xl text-gray-400">?</span>
        </div>
      )}
      <div style={{ width: size }}>
        <input
            style={{ display: 'none' }}
            type="file"
            id="single"
            accept="image/*"
            onChange={uploadAvatar}
            disabled={uploading}
            ref={fileInputRef}
        />
        <Button 
            className="w-full text-xs"
            onClick={() => fileInputRef.current.click()}
            disabled={uploading}
        >
            {uploading ? 'Uploading...' : 'Upload'}
        </Button>
      </div>
    </div>
  );
}
