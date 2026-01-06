import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, X, Grid3X3 } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogClose,
} from "./ui/dialog";

interface ImageGalleryProps {
  images: string[];
  alt: string;
}

export const ImageGallery = ({ images, alt }: ImageGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const goToPrevious = () => {
    if (images.length <= 1) return;
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    if (images.length <= 1) return;
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isModalOpen) return;
      if (e.key === "ArrowLeft") goToPrevious();
      if (e.key === "ArrowRight") goToNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, images.length]);

  if (images.length === 0) {
    return (
      <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-secondary flex items-center justify-center">
        <span className="text-muted-foreground">No image available</span>
      </div>
    );
  }

  // For single image, show just the image
  if (images.length === 1) {
    return (
      <>
        <div 
          className="aspect-[4/3] rounded-2xl overflow-hidden bg-secondary cursor-pointer"
          onClick={() => setIsModalOpen(true)}
        >
          <img
            src={images[0]}
            alt={alt}
            className="w-full h-full object-cover"
          />
        </div>
        <FullscreenGallery
          images={images}
          alt={alt}
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          goToNext={goToNext}
          goToPrevious={goToPrevious}
        />
      </>
    );
  }

  // Grid layout for multiple images (Airbnb style)
  return (
    <>
      <div className="grid grid-cols-4 grid-rows-2 gap-2 rounded-2xl overflow-hidden h-[300px] md:h-[400px]">
        {/* Main large image - takes up left half */}
        <div 
          className="col-span-2 row-span-2 relative cursor-pointer group"
          onClick={() => {
            setCurrentIndex(0);
            setIsModalOpen(true);
          }}
        >
          <img
            src={images[0]}
            alt={`${alt} - Main`}
            className="w-full h-full object-cover transition-all duration-200 group-hover:brightness-90"
          />
        </div>

        {/* Top right images */}
        {images.slice(1, 3).map((image, index) => (
          <div 
            key={index}
            className="relative cursor-pointer group"
            onClick={() => {
              setCurrentIndex(index + 1);
              setIsModalOpen(true);
            }}
          >
            <img
              src={image}
              alt={`${alt} - Image ${index + 2}`}
              className="w-full h-full object-cover transition-all duration-200 group-hover:brightness-90"
            />
          </div>
        ))}

        {/* Bottom right images */}
        {images.slice(3, 5).map((image, index) => (
          <div 
            key={index}
            className={cn(
              "relative cursor-pointer group",
              index === 1 && "relative"
            )}
            onClick={() => {
              setCurrentIndex(index + 3);
              setIsModalOpen(true);
            }}
          >
            <img
              src={image}
              alt={`${alt} - Image ${index + 4}`}
              className="w-full h-full object-cover transition-all duration-200 group-hover:brightness-90"
            />
            
            {/* Show all photos button on last visible image */}
            {index === 1 && images.length > 5 && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white font-medium">+{images.length - 5} more</span>
              </div>
            )}
          </div>
        ))}

        {/* Fill empty slots if less than 5 images */}
        {images.length < 5 && 
          Array(5 - images.length).fill(null).map((_, index) => (
            <div key={`empty-${index}`} className="bg-secondary" />
          ))
        }
      </div>

      {/* Show all photos button */}
      <Button
        variant="outline"
        size="sm"
        className="absolute bottom-4 right-4 bg-background/95 backdrop-blur-sm shadow-lg hover:bg-background"
        onClick={() => setIsModalOpen(true)}
      >
        <Grid3X3 className="h-4 w-4 mr-2" />
        Show all photos
      </Button>

      <FullscreenGallery
        images={images}
        alt={alt}
        currentIndex={currentIndex}
        setCurrentIndex={setCurrentIndex}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        goToNext={goToNext}
        goToPrevious={goToPrevious}
      />
    </>
  );
};

// Fullscreen gallery modal component
interface FullscreenGalleryProps {
  images: string[];
  alt: string;
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  isOpen: boolean;
  onClose: () => void;
  goToNext: () => void;
  goToPrevious: () => void;
}

const FullscreenGallery = ({
  images,
  alt,
  currentIndex,
  setCurrentIndex,
  isOpen,
  onClose,
  goToNext,
  goToPrevious,
}: FullscreenGalleryProps) => {
  // Swipe handling for mobile
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) goToNext();
    if (isRightSwipe) goToPrevious();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-background border-none">
        <div className="relative h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <span className="text-sm font-medium">
              {currentIndex + 1} / {images.length}
            </span>
            <DialogClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-5 w-5" />
              </Button>
            </DialogClose>
          </div>

          {/* Main Image */}
          <div 
            className="flex-1 relative flex items-center justify-center p-4"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <img
              src={images[currentIndex]}
              alt={`${alt} - Image ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 p-4 overflow-x-auto justify-center border-t">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={cn(
                    "shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all duration-200",
                    currentIndex === index
                      ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                      : "opacity-50 hover:opacity-100"
                  )}
                >
                  <img
                    src={image}
                    alt={`${alt} thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
