"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
import Image from "next/image";

interface ImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  src: string;
  alt?: string;
}

export default function ImageLightbox({ isOpen, onClose, src, alt }: ImageLightboxProps) {

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden bg-black/90 border-none sm:rounded-3xl">
        <DialogTitle className="sr-only">{alt || "Image Preview"}</DialogTitle>
        <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X size={24} />
          </button>
          
          <div className="flex-1 w-full relative min-h-[50vh] flex items-center justify-center overflow-auto custom-scrollbar">
            <Image 
              src={src} 
              alt={alt || "Image Preview"} 
              fill
              className="object-contain shadow-2xl animate-in zoom-in-95 duration-300"
            />
          </div>

          {alt && (
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-white text-center font-medium tracking-wide">
                {alt}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
