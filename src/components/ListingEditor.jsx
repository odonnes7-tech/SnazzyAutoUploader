import { DollarSign } from 'lucide-react';

export default function ListingEditor({ listing, onChange }) {
  const update = (field, value) => onChange({ ...listing, [field]: value });

  return (
    <div className="space-y-5">
      {/* Item Name */}
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-foreground tracking-wide uppercase">
          Item Name
        </label>
        <input
          type="text"
          value={listing.name}
          onChange={(e) => update('name', e.target.value)}
          placeholder="e.g. Vintage Levi's 501 Straight Leg Jeans"
          className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm"
        />
      </div>

      {/* Price */}
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-foreground tracking-wide uppercase">
          Price
        </label>
        <div className="relative">
          <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="number"
            value={listing.price}
            onChange={(e) => update('price', e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm"
          />
        </div>
      </div>

      {/* Description + Hashtags */}
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-foreground tracking-wide uppercase">
          Description
        </label>
        <textarea
          value={listing.description}
          onChange={(e) => update('description', e.target.value)}
          placeholder="Item description, measurements, and hashtags will appear here after analysis..."
          rows={10}
          className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm resize-none leading-relaxed"
        />
      </div>
    </div>
  );
}