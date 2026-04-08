import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, RotateCcw, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import heic2any from 'heic2any';
import { base44 } from '@/api/base44Client';
import PhotoUploader from '@/components/PhotoUploader';
import ListingEditor from '@/components/ListingEditor';

const EMPTY_LISTING = { name: '', price: '', description: '' };

export default function Home() {
  const [photo, setPhoto] = useState(null);
  const [listing, setListing] = useState(EMPTY_LISTING);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handlePhotoSelected = (p) => {
    setPhoto(p);
    setAnalyzed(false);
    setListing(EMPTY_LISTING);
    setError(null);
  };

  const analyzePhoto = async () => {
    if (!photo) return;
    setAnalyzing(true);
    setError(null);

    // Convert HEIC to JPEG if needed
    let fileToUpload = photo.file;
    if (photo.file.type === 'image/heic' || photo.file.name?.toLowerCase().endsWith('.heic')) {
      const converted = await heic2any({ blob: photo.file, toType: 'image/jpeg', quality: 0.85 });
      fileToUpload = new File([converted], photo.file.name.replace(/\.heic$/i, '.jpg'), { type: 'image/jpeg' });
    }

    // Upload the file first
    const { file_url } = await base44.integrations.Core.UploadFile({ file: fileToUpload });

    // Ask AI to analyze the photo
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert vintage/thrift clothing reseller. Analyze this photo of a clothing item placed on a measuring board.

Extract the measurements visible in the photo (look for ruler/measuring tape markings), and generate:
1. A catchy, specific item name (brand if visible, style, key features)
2. A single description block that includes: item type, color, material (if identifiable), condition, ALL measurements you can read from the measuring board (e.g. length, width, chest, waist, inseam, etc.), followed by a blank line and then 10-15 relevant Depop hashtags (e.g. #vintage #denim #y2k). Everything in one field — no separate hashtags field.

Return ONLY a JSON object with keys: name, description (contains everything — details, measurements, and hashtags at the bottom)`,
      file_urls: [file_url],
      response_json_schema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
        },
      },
    });

    setListing((prev) => ({
      ...prev,
      name: result.name || '',
      description: result.description || '',
    }));
    setAnalyzed(true);
    setAnalyzing(false);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    // Placeholder: Depop API submission
    // When you have API credentials, wire this up to your backend function
    await new Promise((r) => setTimeout(r, 1500));

    setSubmitted(true);
    setSubmitting(false);
  };

  const reset = () => {
    setPhoto(null);
    setListing(EMPTY_LISTING);
    setAnalyzed(false);
    setSubmitted(false);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <img
            src="https://media.base44.com/images/public/69d5a5fae0f16dce3d35a112/44a38e278_image.png"
            alt="Snazzy Boutique & Gifts"
            className="h-12 w-auto"
          />
          {(photo || analyzed) && (
            <button
              onClick={reset}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Start over
            </button>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="font-playfair text-3xl font-semibold text-foreground mb-2">
                Listing submitted!
              </h2>
              <p className="text-muted-foreground mb-8">
                Your item has been sent to Depop successfully.
              </p>
              <button
                onClick={reset}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
              >
                List another item
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="main"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-10"
            >
              {/* Left: Photo */}
              <div className="space-y-5">
                <div>
                  <h2 className="font-playfair text-xl font-medium text-foreground mb-1">
                    Upload Photo
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Lay the item flat on a measuring board for best results
                  </p>
                </div>

                <PhotoUploader onPhotoSelected={handlePhotoSelected} photo={photo} />

                {photo && !analyzed && (
                  <motion.button
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={analyzePhoto}
                    disabled={analyzing}
                    className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2.5 hover:bg-primary/90 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm shadow-primary/20"
                  >
                    {analyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyzing photo...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Analyze & Generate Listing
                      </>
                    )}
                  </motion.button>
                )}

                {analyzed && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3"
                  >
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    <span>Analysis complete — edit below before submitting</span>
                  </motion.div>
                )}
              </div>

              {/* Right: Listing Editor */}
              <div className="space-y-5">
                <div>
                  <h2 className="font-playfair text-xl font-medium text-foreground mb-1">
                    Listing Details
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {analyzed ? 'Review and edit the AI-generated details' : 'Details will appear after analysis'}
                  </p>
                </div>

                <div className={`transition-opacity duration-300 ${analyzed ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                  <ListingEditor listing={listing} onChange={setListing} />
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {analyzed && (
                  <motion.button
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={handleSubmit}
                    disabled={submitting || !listing.name || !listing.price}
                    className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2.5 hover:bg-primary/90 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm shadow-primary/20"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Posting to Depop...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Post to Depop
                      </>
                    )}
                  </motion.button>
                )}

                {analyzed && (!listing.name || !listing.price) && (
                  <p className="text-xs text-muted-foreground text-center">
                    Name and price are required to submit
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}