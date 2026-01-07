import { ChevronLeft, ChevronRight, Download, X } from "lucide-react";
import { useEffect } from "react";

const ImageModal = ({ images, currentIndex, onClose, onIndexChange }) => {
  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && currentIndex > 0) {
        onIndexChange(currentIndex - 1);
      }
      if (e.key === "ArrowRight" && currentIndex < images.length - 1) {
        onIndexChange(currentIndex + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, images.length, onClose, onIndexChange]);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      onIndexChange(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      onIndexChange(currentIndex + 1);
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = images[currentIndex];
    link.download = `image-${currentIndex + 1}.jpg`;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-full transition text-white"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-white text-sm">
            {currentIndex + 1} / {images.length}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            className="p-2 hover:bg-white/10 rounded-full transition text-white"
          >
            <Download className="w-5 h-5" />
          </button>
          {/* <button className="p-2 hover:bg-white/10 rounded-full transition text-white">
            <Share2 className="w-5 h-5" />
          </button> */}
        </div>
      </div>

      {/* Main Image Display */}
      <div className="flex-1 flex items-center justify-center relative px-4">
        {/* Previous Button */}
        {currentIndex > 0 && (
          <button
            onClick={handlePrevious}
            className="absolute left-4 p-3 bg-black/50 hover:bg-black/70 rounded-full transition text-white z-10"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Image */}
        <img
          src={images[currentIndex]}
          alt={`Image ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain"
        />

        {/* Next Button */}
        {currentIndex < images.length - 1 && (
          <button
            onClick={handleNext}
            className="absolute right-4 p-3 bg-black/50 hover:bg-black/70 rounded-full transition text-white z-10"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="p-4 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex gap-2 overflow-x-auto py-2 justify-center">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => onIndexChange(idx)}
                className={`flex-shrink-0 rounded-lg overflow-hidden transition ${
                  idx === currentIndex
                    ? "ring-2 ring-white scale-110"
                    : "opacity-50 hover:opacity-100"
                }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-16 h-16 object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageModal;
