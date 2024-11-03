import axios from 'axios';
import { Character } from '../types';

const HUGGINGFACE_API_KEY = import.meta.env.VITE_HUGGINGFACE_API_KEY;
const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;

const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models/KwaiVGI/liveportrait';
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/speech-to-speech';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const checkModelStatus = async (): Promise<boolean> => {
  try {
    const response = await axios.get(HUGGINGFACE_API_URL, {
      headers: {
        'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`
      }
    });
    return response.status === 200;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 503) {
      return false; // Model is loading
    }
    throw error;
  }
};

const waitForModel = async (maxAttempts = 5): Promise<void> => {
  for (let i = 0; i < maxAttempts; i++) {
    const isReady = await checkModelStatus();
    if (isReady) return;
    await sleep(2000); // Wait 2 seconds between checks
  }
  throw new Error('Model failed to load after multiple attempts');
};

const extractAudio = async (videoBlob: Blob): Promise<Blob> => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const arrayBuffer = await videoBlob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    const wavBuffer = await audioBufferToWav(audioBuffer);
    return new Blob([wavBuffer], { type: 'audio/wav' });
  } catch (error) {
    console.error('Audio extraction error:', error);
    throw new Error('Failed to extract audio from video');
  }
};

const audioBufferToWav = async (audioBuffer: AudioBuffer): Promise<ArrayBuffer> => {
  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  
  const buffer = audioBuffer.getChannelData(0);
  const samples = buffer.length;
  const dataSize = samples * blockAlign;
  const arrayBuffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(arrayBuffer);
  
  // Write WAV header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);
  
  // Write audio data
  const offset = 44;
  const channelData = new Float32Array(buffer);
  
  for (let i = 0; i < samples; i++) {
    const sample = Math.max(-1, Math.min(1, channelData[i]));
    view.setInt16(offset + (i * bytesPerSample), sample * 0x7FFF, true);
  }
  
  return arrayBuffer;
};

const writeString = (view: DataView, offset: number, string: string): void => {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
};

const cloneVoice = async (audioBlob: Blob, voiceId: string): Promise<Blob> => {
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob);
    formData.append('model_id', 'eleven_english_sts_v2');
    formData.append('voice_settings', JSON.stringify({
      stability: 0.5,
      similarity_boost: 0.75
    }));

    const response = await axios.post(
      `${ELEVENLABS_API_URL}/${voiceId}/stream`,
      formData,
      {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Accept': 'audio/mpeg'
        },
        responseType: 'blob'
      }
    );

    if (!response.data) {
      throw new Error('No audio data received from ElevenLabs');
    }

    return response.data;
  } catch (error) {
    console.error('Voice cloning error:', error);
    throw new Error('Voice cloning failed. Please try again.');
  }
};

const transferFacialMovements = async (sourceImage: string, drivingVideo: Blob): Promise<Blob> => {
  try {
    await waitForModel();

    const formData = new FormData();
    const sourceBlob = await fetch(sourceImage).then(r => r.blob());
    formData.append('source', sourceBlob);
    formData.append('driving', drivingVideo);

    const response = await axios.post(
      HUGGINGFACE_API_URL,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
          'Accept': 'video/mp4'
        },
        responseType: 'blob',
        timeout: 300000
      }
    );

    if (!response.data || response.data.type.includes('application/json')) {
      const reader = new FileReader();
      const errorText = await new Promise((resolve) => {
        reader.onload = () => resolve(reader.result);
        reader.readAsText(response.data);
      });
      throw new Error(`API Error: ${errorText}`);
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.error || error.message;
      console.error('Facial movement transfer error:', errorMessage);
      throw new Error(`Failed to transfer facial movements: ${errorMessage}`);
    }
    throw error;
  }
};

export const transformVideo = async (
  character: Character,
  videoBlob: Blob,
  onProgress?: (progress: number) => void
): Promise<Blob> => {
  try {
    onProgress?.(0);
    
    const audioBlob = await extractAudio(videoBlob);
    onProgress?.(25);
    
    const clonedVoice = await cloneVoice(audioBlob, character.voiceId);
    onProgress?.(50);
    
    const transformedVideo = await transferFacialMovements(character.image, videoBlob);
    onProgress?.(75);
    
    // In a production environment, you'd combine the cloned voice with the video here
    onProgress?.(100);
    
    return transformedVideo;
  } catch (error) {
    console.error('Video transformation error:', error);
    throw error instanceof Error ? error : new Error('Video transformation failed');
  }
};