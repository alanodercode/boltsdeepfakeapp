import React from 'react';
import { Loader2 } from 'lucide-react';

export function ProcessingStatus() {
  return (
    <div className="max-w-2xl mx-auto p-4 text-center">
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700">
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 animate-spin-slow" style={{ clipPath: 'inset(0 0 50% 0)' }} />
          <div className="absolute inset-[2px] rounded-full bg-gray-900 flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
          </div>
        </div>
        <h2 className="text-2xl font-semibold mb-3 bg-gradient-to-r from-orange-500 to-orange-600 text-transparent bg-clip-text">
          Processing Your Video
        </h2>
        <p className="text-gray-400">
          This may take a few minutes. Please don't close this window.
        </p>
      </div>
    </div>
  );
}