import { useRef, useState } from 'react';
import { Upload, Camera, X, Plus } from 'lucide-react';

export default function PhotoUploader({ onPhotosChanged, photos = [] }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = (files) => {
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith('image/') || f.name?.toLowerCase().endsWith('.heic'));
    if (!imageFiles.length) return;
    const newPhotos = imageFiles.map((file) => ({ file, url: URL.createObjectURL(file) }));
    onPhotosChanged([...photos, ...newPhotos]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const removePhoto = (index) => {
    onPhotosChanged(photos.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full space-y-3">
      {/* Photo grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo, i) => (
            <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-muted group">
              <img src={photo.url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                <button
                  onClick={() => removePhoto(i)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full p-1.5 shadow-lg"
                >
                  <X className="w-4 h-4 text-foreground" />
                </button>
              </div>
              {i === 0 && (
                <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-md font-medium">
                  Main
                </span>
              )}
            </div>
          ))}

          {/* Add more tile */}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="aspect-square rounded-xl border-2 border-dashed border-border bg-muted/40 hover:border-primary/50 hover:bg-accent/30 transition-all flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary"
          >
            <Plus className="w-6 h-6" />
            <span className="text-xs font-medium">Add</span>
          </button>
        </div>
      )}

      {/* Drop zone (only shown when no photos yet) */}
      {photos.length === 0 && (
        <div
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
            <p className="font-semibold text-foreground text-lg">Drop your photos here</p>
            <p className="text-muted-foreground text-sm mt-1">
              Place clothing on a measuring board, then upload
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Upload className="w-3.5 h-3.5" />
            <span>JPG, PNG, HEIC supported · Multiple photos OK</span>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}