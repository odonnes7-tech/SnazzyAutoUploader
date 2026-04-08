import { motion, AnimatePresence } from 'framer-motion';
import { X, ImageOff, DollarSign, ExternalLink } from 'lucide-react';

export default function ListingModal({ listing, onClose }) {
  if (!listing) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-card rounded-2xl shadow-2xl border border-border w-full max-w-lg overflow-hidden"
        >
          {/* Image */}
          <div className="aspect-[4/3] bg-muted relative">
            {listing.bg_removed_url || listing.photo_url ? (
              <img
                src={listing.bg_removed_url || listing.photo_url}
                alt={listing.name}
                className={`w-full h-full object-cover transition-all ${listing.is_sold ? 'blur-[2px]' : ''}`}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageOff className="w-12 h-12 text-muted-foreground" />
              </div>
            )}
            {listing.is_sold && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-black tracking-widest text-gray-200 drop-shadow-lg">SOLD</span>
              </div>
            )}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow hover:bg-white transition-colors"
            >
              <X className="w-4 h-4 text-foreground" />
            </button>
          </div>

          {/* Details */}
          <div className="p-5 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-playfair text-xl font-semibold text-foreground leading-snug">{listing.name}</h2>
              {listing.price && (
                <span className="flex items-center gap-0.5 text-primary font-bold text-lg whitespace-nowrap">
                  <DollarSign className="w-4 h-4" />{listing.price}
                </span>
              )}
            </div>
            {listing.description && (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed border-t border-border pt-3">
                {listing.description}
              </p>
            )}
            <div className="flex items-center justify-between pt-1">
              <p className="text-xs text-muted-foreground">
                Listed {new Date(listing.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
              {listing.is_sold && (
                <span className="text-xs font-bold text-gray-400 tracking-widest uppercase">Sold</span>
              )}
            </div>
            {listing.depop_url && (
              <a
                href={listing.depop_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View on Depop
              </a>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}