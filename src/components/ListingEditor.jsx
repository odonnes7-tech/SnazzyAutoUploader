import { useState } from 'react';
import { DollarSign, ChevronDown, ChevronUp, Zap } from 'lucide-react';

const CATEGORIES = [
  'T-shirts', 'Hoodies', 'Sweatshirts', 'Jumpers', 'Cardigans', 'Shirts',
  'Polo shirts', 'Blouses', 'Jeans', 'Trousers', 'Shorts', 'Skirts',
  'Dresses', 'Jackets', 'Coats', 'Blazers', 'Suits', 'Activewear',
  'Swimwear', 'Underwear', 'Socks', 'Shoes', 'Boots', 'Trainers',
  'Sandals', 'Bags', 'Hats', 'Scarves', 'Belts', 'Jewellery', 'Sunglasses',
];

const CONDITIONS = ['Brand new', 'Like new', 'Used - Excellent', 'Used - Good', 'Used - Fair'];

const COLORS = ['Black', 'Grey', 'White', 'Brown', 'Tan', 'Cream', 'Yellow', 'Red', 'Pink',
  'Orange', 'Purple', 'Blue', 'Navy', 'Green', 'Khaki', 'Multicolour'];

const SOURCES = ['Vintage', 'Preloved', 'Reworked / Upcycled', 'Custom', 'Handmade', 'Deadstock', 'Designer', 'Repaired'];

const AGES = ['Modern', '00s', '90s', '80s', '70s', '60s', '50s', 'Antique'];

const STYLES = ['Streetwear', 'Sportswear', 'Loungewear', 'Goth', 'Retro', 'Boho', 'Western',
  'Indie', 'Skater', 'Preppy', 'Minimalist', 'Y2K', 'Grunge', 'Classic'];

const PACKAGE_SIZES = ['Extra Small', 'Small', 'Medium', 'Large', 'Extra Large'];

function SelectField({ label, value, onChange, options, placeholder = 'Select...' }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all appearance-none cursor-pointer"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function TextField({ label, value, onChange, placeholder = '' }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
      />
    </div>
  );
}

function ToggleField({ label, value, onChange, description }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 ${value ? 'bg-primary' : 'bg-border'}`}
      >
        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${value ? 'left-5' : 'left-1'}`} />
      </button>
    </div>
  );
}

export default function ListingEditor({ listing, onChange }) {
  const [showExtra, setShowExtra] = useState(false);

  const update = (field, value) => onChange({ ...listing, [field]: value });

  return (
    <div className="space-y-5">
      {/* Item Name */}
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-foreground tracking-wide uppercase">Item Name</label>
        <input
          type="text"
          value={listing.name}
          onChange={(e) => update('name', e.target.value)}
          placeholder="e.g. Vintage Levi's 501 Straight Leg Jeans"
          className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm"
        />
      </div>

      {/* Price + Boost */}
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-foreground tracking-wide uppercase">Price</label>
        <div className="flex gap-3 items-stretch">
          <div className="relative flex-1">
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
          {/* Boost toggle */}
          <button
            type="button"
            onClick={() => update('boost', !listing.boost)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm font-medium transition-all whitespace-nowrap ${
              listing.boost
                ? 'bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20'
                : 'bg-card border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
            }`}
          >
            <Zap className="w-4 h-4" />
            {listing.boost ? 'Boosted' : 'Boost'}
          </button>
        </div>
        {listing.boost && (
          <p className="text-xs text-muted-foreground">
            +12% fee only if sold — promotes your item higher in search
          </p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-foreground tracking-wide uppercase">Description</label>
        <textarea
          value={listing.description}
          onChange={(e) => update('description', e.target.value)}
          placeholder="Item description, measurements, and hashtags will appear here after analysis..."
          rows={10}
          className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm resize-none leading-relaxed"
        />
      </div>

      {/* Other fields toggle */}
      <button
        type="button"
        onClick={() => setShowExtra((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-border bg-secondary/50 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
      >
        <span>Other fields (filled out automatically)</span>
        {showExtra ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {showExtra && (
        <div className="space-y-4 px-4 py-4 bg-secondary/30 rounded-xl border border-border">
          <SelectField label="Category" value={listing.category || ''} onChange={(v) => update('category', v)} options={CATEGORIES} />
          <TextField label="Brand" value={listing.brand || ''} onChange={(v) => update('brand', v)} placeholder="e.g. Nike, Levi's, Vintage" />
          <SelectField label="Condition" value={listing.condition || ''} onChange={(v) => update('condition', v)} options={CONDITIONS} />
          <SelectField label="Color" value={listing.color || ''} onChange={(v) => update('color', v)} options={COLORS} />
          <SelectField label="Source" value={listing.source || ''} onChange={(v) => update('source', v)} options={SOURCES} />
          <SelectField label="Age" value={listing.age || ''} onChange={(v) => update('age', v)} options={AGES} />
          <SelectField label="Style" value={listing.style || ''} onChange={(v) => update('style', v)} options={STYLES} />
          <SelectField label="Package Size" value={listing.package_size || ''} onChange={(v) => update('package_size', v)} options={PACKAGE_SIZES} />
          <ToggleField
            label="Worldwide Shipping"
            value={listing.worldwide_shipping || false}
            onChange={(v) => update('worldwide_shipping', v)}
            description="Offer international shipping on this item"
          />
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Location</label>
            <div className="px-3 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground">
              Oxford, Ohio · United States
            </div>
          </div>
        </div>
      )}
    </div>
  );
}