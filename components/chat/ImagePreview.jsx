import React from 'react';
import { X } from 'lucide-react';

const ImagePreview = ({ images, onRemove }) => {
  if (images.length === 0) return null;

  return (
    <div className="p-3 sm:p-4 border-t border-gray-200 bg-gray-50">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {images.map((img, index) => (
          <div key={index} className="relative flex-shrink-0">
            <img
              src={img}
              alt={`Selected ${index + 1}`}
              className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg"
            />
            <button
              onClick={() => onRemove(index)}
              className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full p-1 hover:bg-gray-900"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImagePreview;