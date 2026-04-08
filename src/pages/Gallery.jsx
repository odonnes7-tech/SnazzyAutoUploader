import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { RotateCcw, ImageOff, Loader2 } from 'lucide-react';

export default function Gallery() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Listing.list('-created_date', 50).then((data) => {
      setListings(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/">
            <img
              src="https://media.base44.com/images/public/69d5a5fae0f16dce3d35a112/44a38e278_image.png"
              alt="Snazzy Boutique & Gifts"
              className="h-12 w-auto"
            />
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Upload
            </Link>
            <Link to="/gallery" className="text-foreground">
              Gallery
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="font-playfair text-3xl font-semibold text-foreground mb-1">My Listings</h1>
          <p className="text-muted-foreground text-sm">All items uploaded to Depop</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <ImageOff className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-foreground font-medium mb-1">No listings yet</p>
            <p className="text-muted-foreground text-sm mb-6">Upload your first item to get started</p>
            <Link
              to="/"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
            >
              Upload an Item
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {listings.map((listing, i) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="aspect-square bg-muted overflow-hidden">
                  {listing.bg_removed_url || listing.photo_url ? (
                    <img
                      src={listing.bg_removed_url || listing.photo_url}
                      alt={listing.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageOff className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold text-foreground truncate">{listing.name}</p>
                  {listing.price && (
                    <p className="text-sm text-primary font-medium mt-0.5">${listing.price}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}