import React, { useState } from 'react';
import { CharacterSelect, Character } from './components/CharacterSelect';
import { WebcamRecorder } from './components/WebcamRecorder';
import { ProcessingStatus } from './components/ProcessingStatus';
import { ResultVideo } from './components/ResultVideo';
import { transformVideo } from './lib/api';

type AppState = 'select' | 'record' | 'processing' | 'result';

function App() {
  const [state, setState] = useState<AppState>('select');
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [resultUrl, setResultUrl] = useState<string>('');

  const handleCharacterSelect = (character: Character) => {
    setSelectedCharacter(character);
    setState('record');
  };

  const handleCustomImage = async (file: File) => {
    const character: Character = {
      id: 'custom',
      name: 'Custom',
      image: URL.createObjectURL(file),
      voiceId: 'pNInz6obpgDQGcFmaJgB', // Default voice ID
      description: 'Custom character'
    };
    setSelectedCharacter(character);
    setState('record');
  };

  const handleRecordingComplete = async (blob: Blob) => {
    if (!selectedCharacter) return;
    
    setState('processing');
    try {
      const resultBlob = await transformVideo(selectedCharacter, blob);
      const url = URL.createObjectURL(resultBlob);
      setResultUrl(url);
      setState('result');
    } catch (error) {
      console.error('Error processing video:', error);
      // Handle error appropriately
      setState('select');
    }
  };

  const handleReset = () => {
    setState('select');
    setSelectedCharacter(null);
    if (resultUrl) {
      URL.revokeObjectURL(resultUrl);
      setResultUrl('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white py-12">
      {state === 'select' && (
        <CharacterSelect
          onSelect={handleCharacterSelect}
          onCustomImage={handleCustomImage}
        />
      )}
      
      {state === 'record' && (
        <WebcamRecorder
          onComplete={handleRecordingComplete}
        />
      )}
      
      {state === 'processing' && (
        <ProcessingStatus />
      )}
      
      {state === 'result' && (
        <ResultVideo
          url={resultUrl}
          onReset={handleReset}
        />
      )}
    </div>
  );
}

export default App;