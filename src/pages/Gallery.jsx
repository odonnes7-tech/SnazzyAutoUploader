import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { ImageOff, Loader2, Search, SlidersHorizontal } from 'lucide-react';
import ListingModal from '@/components/ListingModal';

const SORT_OPTIONS = [
  { value: '-created_date', label: 'Newest first' },
  { value: 'created_date', label: 'Oldest first' },
  { value: 'name', label: 'Name A–Z' },
  { value: '-price', label: 'Price high–low' },
  { value: 'price', label: 'Price low–high' },
];

export default function Gallery() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('-created_date');

  useEffect(() => {
    base44.entities.Listing.list('-created_date', 200).then((data) => {
      setListings(data);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    let result = [...listings];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) =>
          l.name?.toLowerCase().includes(q) ||
          l.description?.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      const desc = sort.startsWith('-');
      const key = desc ? sort.slice(1) : sort;
      const av = a[key] ?? '';
      const bv = b[key] ?? '';
      if (key === 'price') {
        return desc ? parseFloat(bv) - parseFloat(av) : parseFloat(av) - parseFloat(bv);
      }
      return desc
        ? String(bv).localeCompare(String(av))
        : String(av).localeCompare(String(bv));
    });

    return result;
  }, [listings, search, sort]);

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
        <div className="mb-6">
          <h1 className="font-playfair text-3xl font-semibold text-foreground mb-1">My Listings</h1>
          <p className="text-muted-foreground text-sm">{listings.length} item{listings.length !== 1 ? 's' : ''} uploaded to Depop</p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or description..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
            />
          </div>
          <div className="relative">
            <SlidersHorizontal className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="pl-10 pr-8 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all appearance-none cursor-pointer"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
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
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Search className="w-10 h-10 text-muted-foreground mb-3" />
            <p className="text-foreground font-medium mb-1">No results found</p>
            <p className="text-muted-foreground text-sm">Try a different search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {filtered.map((listing, i) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => setSelected(listing)}
                className="bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer"
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

      <ListingModal listing={selected} onClose={() => setSelected(null)} />
    </div>
  );
}