import { useState } from 'react';
import { uploadItemImage } from '../api';

const ItemImageUploader = ({ externalId, currentThumb, currentFull: _currentFull, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(currentThumb || null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
        setFile(selectedFile);
        // Create local preview
        const objectUrl = URL.createObjectURL(selectedFile);
        setPreview(objectUrl);
    }
  };

  const handleUpload = async () => {
    if (!file || !externalId) return;

    setUploading(true);
    setError(null);

    try {
      const result = await uploadItemImage(externalId, file);
      setUploading(false);
      setFile(null);
      if (onUploadSuccess) {
          onUploadSuccess(result);
      }
      alert('Image uploaded successfully!');
    } catch (err) {
      console.error(err);
      setError('Upload failed. Check console.');
      setUploading(false);
    }
  };

  return (
    <div className="p-4 border rounded bg-gray-50">
      <h3 className="text-lg font-bold mb-2">Item Image</h3>
      
      <div className="flex gap-4 items-center mb-4">
        {preview ? (
            <img src={preview} alt="Preview" className="w-24 h-24 object-contain border bg-white" />
        ) : (
            <div className="w-24 h-24 bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                No Image
            </div>
        )}
        
        <div className="flex-1">
             <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100
                "
             />
             <p className="text-xs text-gray-500 mt-1">Accepts JPG, PNG, WebP.</p>
        </div>
      </div>

      {error && <div className="text-red-500 text-sm mb-2">{error}</div>}

      <button 
        onClick={handleUpload} 
        disabled={!file || uploading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {uploading ? 'Uploading & Processing...' : 'Upload Image'}
      </button>
    </div>
  );
};

export default ItemImageUploader;
