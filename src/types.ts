export interface Character {
  id: string;
  name: string;
  image: string;
  voiceId: string;
  description: string;
}

export interface ProcessingStatus {
  status: 'idle' | 'processing' | 'complete' | 'error';
  error?: string;
  progress?: number;
}

export interface VideoTransformationProgress {
  stage: 'audio' | 'voice' | 'facial' | 'complete';
  progress: number;
  error?: string;
}