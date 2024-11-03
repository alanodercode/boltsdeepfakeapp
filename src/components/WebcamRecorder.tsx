import React, { useRef, useState, useCallback } from 'react';
import { Video, X, Camera } from 'lucide-react';

interface WebcamRecorderProps {
  onComplete: (blob: Blob) => Promise<void>;
}

export function WebcamRecorder({ onComplete }: WebcamRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number>();

  const getAudioDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(device => device.kind === 'audioinput');
      setAudioDevices(audioInputs);
      if (audioInputs.length > 0) {
        setSelectedAudioDevice(audioInputs[0].deviceId);
      }
    } catch (err) {
      console.error('Error getting audio devices:', err);
    }
  };

  React.useEffect(() => {
    getAudioDevices();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setIsRecording(false);
      
      const tracks = videoRef.current?.srcObject instanceof MediaStream 
        ? videoRef.current.srcObject.getTracks() 
        : [];
      tracks.forEach(track => track.stop());
    }
  }, [isRecording]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          aspectRatio: 1,
          width: { ideal: 640 },
          height: { ideal: 640 }
        },
        audio: { deviceId: selectedAudioDevice }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        if (videoRef.current) {
          videoRef.current.srcObject = null;
          videoRef.current.src = url;
          videoRef.current.play();
        }
        chunksRef.current = [];
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000);
      setIsRecording(true);
      setError(null);
      setRecordingTime(0);

      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 120) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      setError('Failed to access camera or microphone');
      console.error('Error accessing media devices:', err);
    }
  }, [selectedAudioDevice, stopRecording]);

  const handleRetry = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setRecordingTime(0);
  }, [previewUrl]);

  const handleSubmit = useCallback(async () => {
    if (!previewUrl) return;
    
    try {
      const response = await fetch(previewUrl);
      const blob = await response.blob();
      await onComplete(blob);
    } catch (err) {
      setError('Failed to process video');
      console.error('Error processing video:', err);
    }
  }, [previewUrl, onComplete]);

  return (
    <div className="max-w-xl mx-auto p-4">
      {isRecording && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-gray-800">
          <div 
            className="h-full bg-gradient-to-r from-orange-500 to-orange-600"
            style={{ width: `${(recordingTime / 120) * 100}%` }}
          />
        </div>
      )}

      <div className="relative aspect-square bg-gray-900 rounded-2xl overflow-hidden mb-6 shadow-lg shadow-orange-500/10">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        {!isRecording && !previewUrl && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Camera className="w-16 h-16 text-orange-500" />
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 mb-4 text-red-500">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        {!isRecording && !previewUrl && (
          <>
            <select
              value={selectedAudioDevice}
              onChange={(e) => setSelectedAudioDevice(e.target.value)}
              className="flex-1 bg-gray-800 text-white px-4 py-3 rounded-xl border border-gray-700 focus:border-orange-500 outline-none transition-colors"
            >
              {audioDevices.map(device => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Microphone ${device.deviceId.slice(0, 5)}...`}
                </option>
              ))}
            </select>
            <button
              onClick={startRecording}
              className="flex-1 flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl hover:opacity-90 transition-opacity"
            >
              <Video className="w-5 h-5" />
              Start Recording
            </button>
          </>
        )}

        {isRecording && (
          <button
            onClick={stopRecording}
            className="w-full flex items-center justify-center gap-2 px-8 py-3 bg-red-500 rounded-xl hover:opacity-90 transition-opacity"
          >
            <X className="w-5 h-5" />
            Stop Recording
          </button>
        )}

        {previewUrl && (
          <>
            <button
              onClick={handleRetry}
              className="flex-1 flex items-center justify-center gap-2 px-8 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors"
            >
              <Video className="w-5 h-5" />
              Record Again
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl hover:opacity-90 transition-opacity"
            >
              Process Video
            </button>
          </>
        )}
      </div>
    </div>
  );
}