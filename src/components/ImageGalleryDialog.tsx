import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface Image {
  imageId?: string;
  imageUrl: string;
}

interface ImageGalleryDialogProps {
  images: Image[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialIndex: number;
}

export const ImageGalleryDialog: React.FC<ImageGalleryDialogProps> = ({
  images,
  open,
  onOpenChange,
  initialIndex = 0,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  
  // Reset index when dialog opens with a different initial index
  useEffect(() => {
    if (open) {
      setCurrentIndex(initialIndex);
    }
  }, [open, initialIndex]);

  const handleNext = () => {
    setCurrentIndex((currentIndex + 1) % images.length);
  };

  const handlePrevious = () => {
    setCurrentIndex((currentIndex - 1 + images.length) % images.length);
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
  };

  const currentImage = images[currentIndex]?.imageUrl;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-11/12 p-0 bg-black text-white">
        <div className="relative h-[80vh] flex flex-col">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 z-50 text-white bg-black/50 hover:bg-black/70 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Image counter */}
          <div className="absolute top-4 left-4 z-50 bg-black/50 text-white text-sm px-3 py-1 rounded-full">
            {currentIndex + 1} / {images.length}
          </div>

          {/* Main image */}
          <div className="flex-1 flex items-center justify-center overflow-hidden">
            {currentImage && (
              <img
                src={currentImage}
                alt={`Property view ${currentIndex + 1}`}
                className="max-h-full max-w-full object-contain"
              />
            )}

            {/* Navigation arrows */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full h-10 w-10"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full h-10 w-10"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex justify-center gap-2 p-4 bg-black/90 overflow-x-auto">
              {images.map((image, index) => (
                <div
                  key={image.imageId || index}
                  className={`w-16 h-12 cursor-pointer border-2 transition-all ${
                    index === currentIndex ? 'border-white' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                  onClick={() => handleThumbnailClick(index)}
                >
                  <img
                    src={image.imageUrl}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};