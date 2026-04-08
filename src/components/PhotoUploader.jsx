import { useRef, useState } from 'react';
import { Upload, Camera, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PhotoUploader({ onPhotoSelected, photo }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    onPhotoSelected({ file, url });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {photo ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative rounded-2xl overflow-hidden bg-muted aspect-[4/3] group"
          >
            <img
              src={photo.url}
              alt="Clothing item"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
              <button
                onClick={() => onPhotoSelected(null)}
                className="opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full p-2 shadow-lg"
              >
                <X className="w-5 h-5 text-foreground" />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="uploader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`
              relative rounded-2xl border-2 border-dashed cursor-pointer
              aspect-[4/3] flex flex-col items-center justify-center gap-4
              transition-all duration-300
              ${dragging
                ? 'border-primary bg-accent scale-[1.01]'
                : 'border-border bg-muted/40 hover:border-primary/50 hover:bg-accent/30'
              }
            `}
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Camera className="w-8 h-8 text-primary" />
            </div>
            <div className="text-center px-6">
              <p className="font-semibold text-foreground text-lg">Drop your photo here</p>
              <p className="text-muted-foreground text-sm mt-1">
                Place clothing on a measuring board, then upload
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Upload className="w-3.5 h-3.5" />
              <span>JPG, PNG, HEIC supported</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFile(e.target.files[0])}
      />
    </div>
  );
}