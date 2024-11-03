import React, { useEffect, useRef } from 'react';
import { RotateCcw, Download } from 'lucide-react';

interface ResultVideoProps {
  url: string;
  onReset: () => void;
}

export function ResultVideo({ url, onReset }: ResultVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = '';
        videoRef.current.load();
      }
    };
  }, []);

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transformed-video.webm';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex gap-8 max-w-6xl mx-auto p-4">
      <div className="relative w-[360px] bg-gray-800 rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          src={url}
          controls
          playsInline
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex flex-col gap-4">
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
          Try Again
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors"
        >
          <Download className="w-5 h-5" />
          Download Video
        </button>
      </div>
    </div>
  );
}