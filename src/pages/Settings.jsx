import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { CheckCircle, AlertCircle, Loader2, KeyRound, ExternalLink, Eye, EyeOff } from 'lucide-react';

export default function Settings() {
  const [apiKey, setApiKey] = useState('');
  const [savedKey, setSavedKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null); // null | 'success' | 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    base44.entities.AppSettings.filter({ key: 'depop_api_key' }).then((results) => {
      if (results.length > 0) {
        setSavedKey(results[0].value || '');
        setApiKey(results[0].value || '');
      }
      setLoading(false);
    });
  }, []);

  const saveAndTest = async () => {
    if (!apiKey.trim()) return;
    setSaving(true);
    setStatus(null);
    setMessage('');

    // Test the key first
    const response = await base44.functions.invoke('testDepopKey', { api_key: apiKey.trim() });

    if (response.data?.success) {
      // Save to DB
      const existing = await base44.entities.AppSettings.filter({ key: 'depop_api_key' });
      if (existing.length > 0) {
        await base44.entities.AppSettings.update(existing[0].id, { value: apiKey.trim() });
      } else {
        await base44.entities.AppSettings.create({ key: 'depop_api_key', value: apiKey.trim() });
      }
      setSavedKey(apiKey.trim());
      setStatus('success');
      setMessage('Connected! Listings will now be posted directly to Depop.');
    } else {
      setStatus('error');
      setMessage(response.data?.error || 'Invalid API key. Please check it and try again.');
    }

    setSaving(false);
  };

  const isKeyChanged = apiKey !== savedKey;

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
            <Link to="/analytics" className="text-muted-foreground hover:text-foreground transition-colors">Analytics</Link>
            <Link to="/settings" className="text-foreground">Settings</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-6 py-12">
        <h1 className="font-playfair text-3xl font-semibold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground text-sm mb-10">Configure your integrations</p>

        <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Depop API Key</h2>
              <p className="text-xs text-muted-foreground">Connect your Depop shop to auto-post listings</p>
            </div>
            {savedKey && (
              <span className="ml-auto flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                <CheckCircle className="w-3 h-3" /> Connected
              </span>
            )}
          </div>

          <div className="text-xs text-muted-foreground bg-secondary/50 rounded-xl px-4 py-3 leading-relaxed">
            Apply for Depop Partner API access at{' '}
            <a href="mailto:business@depop.com" className="text-primary underline">business@depop.com</a>.
            Once approved, paste your key below — it saves automatically.{' '}
            <a
              href="https://partnerapi.depop.com/api-docs/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary underline"
            >
              API docs <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading...
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">API Key</label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => { setApiKey(e.target.value); setStatus(null); }}
                  placeholder="pak_••••••••••••••••••••••••••••••••••••"
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowKey((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="flex items-start gap-2.5 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{message}</span>
            </div>
          )}

          {status === 'error' && (
            <div className="flex items-start gap-2.5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{message}</span>
            </div>
          )}

          <button
            onClick={saveAndTest}
            disabled={!apiKey.trim() || saving || !isKeyChanged}
            className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Verifying & saving...</>
            ) : savedKey && !isKeyChanged ? (
              <><CheckCircle className="w-4 h-4" /> Key saved</>
            ) : (
              'Save & Connect'
            )}
          </button>
        </div>
      </main>
    </div>
  );
}