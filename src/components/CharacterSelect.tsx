import React from 'react';
import { ArrowRight, Upload } from 'lucide-react';

export interface Character {
  id: string;
  name: string;
  image: string;
  voiceId: string;
  description: string;
}

const characters: Character[] = [
  {
    id: '1',
    name: 'Sarah',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=688&h=1032',
    voiceId: 'pNInz6obpgDQGcFmaJgB',
    description: 'Professional & Warm'
  },
  {
    id: '2',
    name: 'Emma',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=687&h=1031',
    voiceId: 'TxGEqnHWrfWFTfGW9XjX',
    description: 'Young & Friendly'
  },
  {
    id: '3',
    name: 'Dr. James',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=870&h=1305',
    voiceId: 'VR6AewLTigWG4xSOukaG',
    description: 'Experienced & Trustworthy'
  }
];

interface CharacterSelectProps {
  onSelect: (character: Character) => void;
  onCustomImage: (file: File) => void;
}

export const CharacterSelect: React.FC<CharacterSelectProps> = ({ onSelect, onCustomImage }) => {
  const handleCustomImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onCustomImage(file);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-orange-500 to-orange-600 text-transparent bg-clip-text">
          Choose Your Character
        </h2>
        <p className="text-gray-400 text-lg">Select a character or upload your own image</p>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {characters.map((character) => (
          <button
            key={character.id}
            onClick={() => onSelect(character)}
            className="group relative bg-gray-900 rounded-xl overflow-hidden transition-transform hover:scale-[1.02] duration-300 shadow-lg hover:shadow-orange-500/20"
          >
            <div className="aspect-[9/16] relative">
              <img
                src={character.image}
                alt={character.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-80" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
                <h3 className="text-xl font-semibold mb-1">{character.name}</h3>
                <p className="text-sm text-gray-300">{character.description}</p>
              </div>
              <div className="absolute inset-0 border-2 border-orange-500/0 group-hover:border-orange-500/50 transition-colors rounded-xl" />
            </div>
          </button>
        ))}

        <label className="group relative bg-gray-900 rounded-xl overflow-hidden cursor-pointer transition-transform hover:scale-[1.02] duration-300 shadow-lg hover:shadow-orange-500/20">
          <div className="aspect-[9/16] flex items-center justify-center bg-gray-800">
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 p-[2px]">
                <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-orange-500" />
                </div>
              </div>
              <p className="text-lg font-semibold mb-2">Upload Custom</p>
              <p className="text-sm text-gray-400">Use your own image</p>
            </div>
          </div>
          <div className="absolute inset-0 border-2 border-orange-500/0 group-hover:border-orange-500/50 transition-colors rounded-xl" />
          <input
            type="file"
            accept="image/*"
            onChange={handleCustomImage}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
};