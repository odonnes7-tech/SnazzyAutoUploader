import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, RotateCcw, Loader2, AlertCircle, Scissors } from 'lucide-react';
import { Link } from 'react-router-dom';
import heic2any from 'heic2any';
import { base44 } from '@/api/base44Client';
import PhotoUploader from '@/components/PhotoUploader';
import ListingEditor from '@/components/ListingEditor.jsx';

const EMPTY_LISTING = { name: '', price: '', description: '', boost: false, category: '', brand: '', condition: '', color: '', source: '', age: '', style: '', package_size: '', worldwide_shipping: false };

async function prepareFile(file) {
  if (file.type === 'image/heic' || file.name?.toLowerCase().endsWith('.heic')) {
    const converted = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.85 });
    return new File([converted], file.name.replace(/\.heic$/i, '.jpg'), { type: 'image/jpeg' });
  }
  return file;
}

export default function Home() {
  const [photos, setPhotos] = useState([]);
  const [listing, setListing] = useState(EMPTY_LISTING);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [removingBg, setRemovingBg] = useState(false);
  const [bgRemovedUrl, setBgRemovedUrl] = useState(null);

  const handlePhotosChanged = (newPhotos) => {
    setPhotos(newPhotos);
    if (newPhotos.length === 0) {
      setAnalyzed(false);
      setListing(EMPTY_LISTING);
      setBgRemovedUrl(null);
    }
    setError(null);
  };

  const mainPhoto = photos[0] || null;

  const removeBackground = async () => {
    if (!mainPhoto) return;
    setRemovingBg(true);
    setError(null);
    const file = await prepareFile(mainPhoto.file);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const response = await base44.functions.invoke('removeBg', { image_url: file_url });
    setBgRemovedUrl(response.data.result_url);
    setRemovingBg(false);
  };

  const analyzePhoto = async () => {
    if (!mainPhoto) return;
    setAnalyzing(true);
    setError(null);

    let file_url;
    if (bgRemovedUrl) {
      const res = await fetch(bgRemovedUrl);
      const blob = await res.blob();
      const bgFile = new File([blob], 'bg-removed.png', { type: 'image/png' });
      ({ file_url } = await base44.integrations.Core.UploadFile({ file: bgFile }));
    } else {
      const file = await prepareFile(mainPhoto.file);
      ({ file_url } = await base44.integrations.Core.UploadFile({ file }));
    }

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert vintage/thrift clothing reseller. Analyze this photo of a clothing item placed on a measuring board.

Generate:
1. A catchy, specific item name (include brand if visible, style, and key features)
2. A description that contains ONLY: ALL measurements you can read from the measuring board (e.g. "Length: 24in, Chest: 18in, Waist: 16in, Inseam: 30in"), followed by a blank line and then 10-15 relevant Depop hashtags (e.g. #vintage #denim #y2k). Do NOT include any prose description of the item.
3. category: pick the single best match from: T-shirts, Hoodies, Sweatshirts, Jumpers, Cardigans, Shirts, Polo shirts, Blouses, Jeans, Trousers, Shorts, Skirts, Dresses, Jackets, Coats, Blazers, Suits, Activewear, Swimwear, Underwear, Socks, Shoes, Boots, Trainers, Sandals, Bags, Hats, Scarves, Belts, Jewellery, Sunglasses
4. condition: pick from: Brand new, Like new, Used - Excellent, Used - Good, Used - Fair
5. color: pick the single best match from: Black, Grey, White, Brown, Tan, Cream, Yellow, Red, Pink, Orange, Purple, Blue, Navy, Green, Khaki, Multicolour
6. source: pick from: Vintage, Preloved, Reworked / Upcycled, Custom, Handmade, Deadstock, Designer, Repaired
7. age: pick from: Modern, 00s, 90s, 80s, 70s, 60s, 50s, Antique
8. style: pick the single best match from: Streetwear, Sportswear, Loungewear, Goth, Retro, Boho, Western, Indie, Skater, Preppy, Minimalist, Y2K, Grunge, Classic

Return ONLY a JSON object with keys: name, description, category, condition, color, source, age, style. Values must exactly match one of the options listed above.`,
      file_urls: [file_url],
      response_json_schema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          category: { type: 'string' },
          condition: { type: 'string' },
          color: { type: 'string' },
          source: { type: 'string' },
          age: { type: 'string' },
          style: { type: 'string' },
        },
      },
    });

    setListing((prev) => ({
      ...prev,
      name: result.name || '',
      description: result.description || '',
      category: result.category || '',
      condition: result.condition || '',
      color: result.color || '',
      source: 'Vintage',
      age: result.age || '',
      style: result.style || '',
    }));
    setAnalyzed(true);
    setAnalyzing(false);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    // Upload all photos and collect URLs
    const uploadedUrls = await Promise.all(
      photos.map(async (p) => {
        const file = await prepareFile(p.file);
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        return file_url;
      })
    );

    await base44.entities.Listing.create({
      name: listing.name,
      price: listing.price,
      description: listing.description,
      photo_url: uploadedUrls[0] || null,
      photo_urls: uploadedUrls,
      bg_removed_url: bgRemovedUrl || null,
      boost: listing.boost || false,
      category: listing.category || '',
      brand: listing.brand || '',
      condition: listing.condition || '',
      color: listing.color || '',
      source: listing.source || '',
      age: listing.age || '',
      style: listing.style || '',
      package_size: listing.package_size || '',
      worldwide_shipping: listing.worldwide_shipping || false,
    });

    setSubmitted(true);
    setSubmitting(false);
  };

  const reset = () => {
    setPhotos([]);
    setListing(EMPTY_LISTING);
    setAnalyzed(false);
    setSubmitted(false);
    setError(null);
    setBgRemovedUrl(null);
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
          <div className="flex items-center gap-4">
            <Link to="/gallery" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">Gallery</Link>
            <Link to="/analytics" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">Analytics</Link>
            {(photos.length > 0 || analyzed) && (
              <button
                onClick={reset}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Start over
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-32 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                className="mb-8"
              >
                <img src="https://media.base44.com/images/public/69d5a5fae0f16dce3d35a112/3894110f1_depop.png" alt="Depop" className="w-24 h-24" />
              </motion.div>
              <h2 className="font-playfair text-4xl font-semibold text-foreground mb-3">
                Upload Complete!
              </h2>
              <p className="text-muted-foreground text-lg mb-2">
                Your listing is now live on Depop.
              </p>
              <p className="text-muted-foreground text-sm mb-10">
                Ready to list your next item?
              </p>
              <button
                onClick={reset}
                className="px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold text-base hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20 flex items-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Upload Another Item
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="main"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-10"
            >
              {/* Left: Photos */}
              <div className="space-y-5">
                <div>
                  <h2 className="font-playfair text-xl font-medium text-foreground mb-1">
                    Upload Photos
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Lay the item flat on a measuring board for best results · First photo is main
                  </p>
                </div>

                <div className={`rounded-2xl transition-all duration-300 ${analyzed ? 'ring-2 ring-green-400 ring-offset-2' : ''}`}>
                  <PhotoUploader onPhotosChanged={handlePhotosChanged} photos={photos} />
                </div>

                {mainPhoto && !analyzed && (
                  <motion.button
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={removeBackground}
                    disabled={removingBg}
                    className="w-full py-3 border border-border bg-card text-foreground rounded-xl font-medium flex items-center justify-center gap-2.5 hover:bg-secondary transition-all disabled:opacity-60 disabled:cursor-not-allowed text-sm"
                  >
                    {removingBg ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Removing background...
                      </>
                    ) : (
                      <>
                        <Scissors className="w-4 h-4" />
                        Remove Background from Main Photo (optional)
                      </>
                    )}
                  </motion.button>
                )}

                {bgRemovedUrl && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl overflow-hidden border border-border bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAH0lEQVQ4jWNgYGD4TxBmIIqBgYHhPxGaRg2gHAAAAP//AwAI+AL+hc2rNAAAAABJRU5ErkJggg==')] bg-repeat"
                  >
                    <img src={bgRemovedUrl} alt="Background removed" className="w-full h-full object-contain aspect-[4/3]" />
                  </motion.div>
                )}

                {mainPhoto && !analyzed && (
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