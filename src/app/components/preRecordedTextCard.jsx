import React from 'react';
import { Trash2, Copy } from 'lucide-react';

const PrerecordedTextCard = ({ preConvertedText = [] }) => {
  const copyText = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      {preConvertedText.map((text, index) => (
        <div 
          key={index}
          className="backdrop-blur-sm bg-gray-800  shadow-lg overflow-hidden border-gray-700 py-2 px-6 rounded-xl"
        >
          <div className=" h-1" />
          <div className="p-4 flex items-start justify-between gap-4">
            <p className="flex-1  text-lg overflow-x-auto whitespace-nowrap">
              {text}
            </p>
            <div className="flex items-center space-x-2 flex-shrink-0">
              <button 
                onClick={() => copyText(text)}
                className="p-2 bg-gray-100 rounded-full transition-colors"
                title="Copy text"
              >
                <Copy size={20} className="text-gray-600" />
              </button>
              <button 
                onClick={() => {/* Add delete handler */}}
                className="p-2 bg-red-50 rounded-full transition-colors"
                title="Delete text"
              >
                <Trash2 size={20} className="text-red-500" />
              </button>
            </div>
          </div>
        </div>
      ))}

      {preConvertedText.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          No recorded text available
        </div>
      )}
    </div>
  );
};

export default PrerecordedTextCard;