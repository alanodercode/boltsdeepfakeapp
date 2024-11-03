import React, { useCallback } from 'react';
import { Upload } from 'lucide-react';

interface VideoUploadProps {
  onUpload: (file: File) => void;
  onNext: () => void;
}

const VideoUpload: React.FC<VideoUploadProps> = ({ onUpload, onNext }) => {
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      onUpload(file);
    }
  }, [onUpload]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  }, [onUpload]);

  return (
    <div className="space-y-6">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-gray-700 rounded-xl p-12 text-center hover:border-orange-500 transition-colors"
      >
        <Upload className="w-12 h-12 mx-auto mb-4 text-orange-500" />
        <h3 className="text-xl font-semibold mb-2">Drop your video here</h3>
        <p className="text-gray-400 mb-4">or</p>
        <label className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-3 rounded-lg cursor-pointer hover:opacity-90 transition-opacity">
          Browse Files
          <input
            type="file"
            accept="video/*"
            onChange={handleFileInput}
            className="hidden"
          />
        </label>
        <p className="text-sm text-gray-400 mt-4">Maximum duration: 2 minutes</p>
      </div>
      
      <button
        onClick={onNext}
        className="w-full bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
      >
        Continue to Recording
      </button>
    </div>
  );
};

export default VideoUpload;