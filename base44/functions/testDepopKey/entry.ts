import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const user = await base44.auth.me();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { api_key } = await req.json();

  if (!api_key) {
    return Response.json({ error: 'No API key provided' }, { status: 400 });
  }

  // Test the key by fetching products list — a simple read call
  const response = await fetch('https://partnerapi.depop.com/api/v1/products?limit=1', {
    headers: {
      'Authorization': `Bearer ${api_key}`,
    },
  });

  if (response.ok) {
    // Key is valid — store it as a secret so postToDepop can use it
    // Note: in production you'd persist this server-side; for now we confirm validity
    return Response.json({ success: true });
  }

  const data = await response.json().catch(() => ({}));
  return Response.json({ success: false, error: data.message || 'Invalid API key' });
});