import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Loader2, TrendingUp, Package, Clock, DollarSign, Tag, ImageOff } from 'lucide-react';
import ListingModal from '@/components/ListingModal';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { subDays, subWeeks, subMonths, format, differenceInDays, parseISO, startOfDay, startOfWeek, startOfMonth } from 'date-fns';

const PERIODS = [
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: '3 Months', value: '3m' },
  { label: 'All Time', value: 'all' },
];

function StatCard({ icon: Icon, label, value, sub, color = 'text-primary' }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 bg-primary/10`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-sm font-medium text-foreground mt-0.5">{label}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

export default function Analytics() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');
  const [selectedListing, setSelectedListing] = useState(null);

  const handleUpdate = (id, changes) => {
    setListings((prev) => prev.map((l) => l.id === id ? { ...l, ...changes } : l));
    setSelectedListing((prev) => prev?.id === id ? { ...prev, ...changes } : prev);
  };

  useEffect(() => {
    base44.entities.Listing.list('-created_date', 500).then((data) => {
      setListings(data);
      setLoading(false);
    });
  }, []);

  const periodStart = useMemo(() => {
    const now = new Date();
    if (period === '7d') return subDays(now, 7);
    if (period === '30d') return subDays(now, 30);
    if (period === '3m') return subMonths(now, 3);
    return new Date(0);
  }, [period]);

  const inPeriod = useMemo(
    () => listings.filter((l) => new Date(l.created_date) >= periodStart),
    [listings, periodStart]
  );

  const sold = listings.filter((l) => l.is_sold);
  const available = listings.filter((l) => !l.is_sold);

  // Revenue
  const totalRevenue = sold.reduce((sum, l) => sum + (parseFloat(l.price) || 0), 0);
  const avgPrice = sold.length ? (totalRevenue / sold.length).toFixed(2) : '0.00';

  // Shelf life (days from created_date to now for unsold, approximate for sold)
  const shelfDays = available.map((l) => ({
    name: l.name,
    days: differenceInDays(new Date(), new Date(l.created_date)),
    listing: l,
  }));
  const avgShelf = shelfDays.length
    ? Math.round(shelfDays.reduce((s, x) => s + x.days, 0) / shelfDays.length)
    : null;
  const longestUnsold = shelfDays.sort((a, b) => b.days - a.days).slice(0, 3);
  const shortestUnsold = [...shelfDays].sort((a, b) => a.days - b.days).slice(0, 3);

  // Chart: listings uploaded per bucket
  const chartData = useMemo(() => {
    if (period === '7d') {
      return Array.from({ length: 7 }, (_, i) => {
        const day = subDays(new Date(), 6 - i);
        const label = format(day, 'EEE');
        const dayStr = format(day, 'yyyy-MM-dd');
        const count = inPeriod.filter((l) => format(new Date(l.created_date), 'yyyy-MM-dd') === dayStr).length;
        const sales = inPeriod.filter((l) => l.is_sold && format(new Date(l.created_date), 'yyyy-MM-dd') === dayStr).length;
        return { label, listed: count, sold: sales };
      });
    }
    if (period === '30d') {
      return Array.from({ length: 4 }, (_, i) => {
        const weekStart = subWeeks(new Date(), 3 - i);
        const weekEnd = subWeeks(new Date(), 2 - i);
        const label = `Wk ${format(weekStart, 'M/d')}`;
        const count = inPeriod.filter((l) => {
          const d = new Date(l.created_date);
          return d >= weekStart && d < weekEnd;
        }).length;
        const sales = inPeriod.filter((l) => {
          const d = new Date(l.created_date);
          return l.is_sold && d >= weekStart && d < weekEnd;
        }).length;
        return { label, listed: count, sold: sales };
      });
    }
    // 3m or all: monthly
    const months = period === '3m' ? 3 : 6;
    return Array.from({ length: months }, (_, i) => {
      const mo = subMonths(new Date(), months - 1 - i);
      const label = format(mo, 'MMM');
      const moStr = format(mo, 'yyyy-MM');
      const count = listings.filter((l) => format(new Date(l.created_date), 'yyyy-MM') === moStr).length;
      const sales = listings.filter((l) => l.is_sold && format(new Date(l.created_date), 'yyyy-MM') === moStr).length;
      return { label, listed: count, sold: sales };
    });
  }, [inPeriod, listings, period]);

  const sellThroughRate = listings.length ? Math.round((sold.length / listings.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
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
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">Upload</Link>
            <Link to="/gallery" className="text-muted-foreground hover:text-foreground transition-colors">Gallery</Link>
            <Link to="/analytics" className="text-foreground">Analytics</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="font-playfair text-3xl font-semibold text-foreground mb-1">Analytics</h1>
          <p className="text-muted-foreground text-sm">Overview of your Depop shop performance</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Top stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <StatCard icon={Package} label="Total Listed" value={listings.length} sub="All time" />
              <StatCard icon={Tag} label="Items Sold" value={sold.length} sub={`${sellThroughRate}% sell-through`} />
              <StatCard icon={DollarSign} label="Total Revenue" value={`$${totalRevenue.toFixed(2)}`} sub={`Avg $${avgPrice} per item`} />
              <StatCard icon={Clock} label="Avg Shelf Life" value={avgShelf !== null ? `${avgShelf}d` : '—'} sub="Days unsold items sit" />
            </div>

            {/* Sales chart */}
            <div className="bg-card border border-border rounded-2xl p-5 mb-8">
              <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                <h2 className="font-semibold text-foreground flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" /> Listings Over Time
                </h2>
                <div className="flex gap-1.5">
                  {PERIODS.map((p) => (
                    <button
                      key={p.value}
                      onClick={() => setPeriod(p.value)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                        period === p.value
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, fontSize: 12 }}
                    cursor={{ fill: 'hsl(var(--muted))' }}
                  />
                  <Bar dataKey="listed" name="Listed" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} opacity={0.4} />
                  <Bar dataKey="sold" name="Sold" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-primary opacity-40 inline-block" />Listed</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-primary inline-block" />Sold</span>
              </div>
            </div>

            {/* Shelf life */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-card border border-border rounded-2xl p-5">
                <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" /> Longest Unsold
                </h2>
                {longestUnsold.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No unsold items 🎉</p>
                ) : (
                  <ul className="space-y-3">
                    {longestUnsold.map((item, i) => (
                      <li key={i} className="flex items-center justify-between gap-2 cursor-pointer hover:bg-muted/50 rounded-xl p-1.5 -mx-1.5 transition-colors" onClick={() => setSelectedListing(item.listing)}>
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                            {item.listing.bg_removed_url || item.listing.photo_url ? (
                              <img src={item.listing.bg_removed_url || item.listing.photo_url} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center"><ImageOff className="w-4 h-4 text-muted-foreground" /></div>
                            )}
                          </div>
                          <span className="text-sm text-foreground truncate">{item.name}</span>
                        </div>
                        <span className="text-sm font-bold text-red-400 whitespace-nowrap">{item.days}d</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="bg-card border border-border rounded-2xl p-5">
                <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" /> Freshest Listings
                </h2>
                {shortestUnsold.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No unsold items 🎉</p>
                ) : (
                  <ul className="space-y-3">
                    {shortestUnsold.map((item, i) => (
                      <li key={i} className="flex items-center justify-between gap-2 cursor-pointer hover:bg-muted/50 rounded-xl p-1.5 -mx-1.5 transition-colors" onClick={() => setSelectedListing(item.listing)}>
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                            {item.listing.bg_removed_url || item.listing.photo_url ? (
                              <img src={item.listing.bg_removed_url || item.listing.photo_url} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center"><ImageOff className="w-4 h-4 text-muted-foreground" /></div>
                            )}
                          </div>
                          <span className="text-sm text-foreground truncate">{item.name}</span>
                        </div>
                        <span className="text-sm font-bold text-green-500 whitespace-nowrap">{item.days}d</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </>
        )}
      </main>

      <ListingModal listing={selectedListing} onClose={() => setSelectedListing(null)} onUpdate={handleUpdate} />
    </div>
  );
}