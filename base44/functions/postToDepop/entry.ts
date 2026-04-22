import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Maps our app's category names to Depop's product_type IDs
const CATEGORY_TO_PRODUCT_TYPE = {
  'T-shirts': 'tshirts',
  'Hoodies': 'hoodies',
  'Sweatshirts': 'sweatshirts',
  'Jumpers': 'jumpers',
  'Cardigans': 'cardigans',
  'Shirts': 'shirts',
  'Polo shirts': 'polo-shirts',
  'Blouses': 'blouses',
  'Jeans': 'jeans',
  'Trousers': 'trousers',
  'Shorts': 'shorts',
  'Skirts': 'skirts',
  'Dresses': 'dresses',
  'Jackets': 'jackets',
  'Coats': 'coats',
  'Blazers': 'blazers',
  'Suits': 'suits',
  'Activewear': 'activewear',
  'Swimwear': 'swimwear',
  'Underwear': 'underwear',
  'Socks': 'socks',
  'Shoes': 'other-shoes',
  'Boots': 'boots',
  'Trainers': 'trainers',
  'Sandals': 'sandals',
  'Bags': 'bags',
  'Hats': 'hats',
  'Scarves': 'scarves',
  'Belts': 'belts',
  'Jewellery': 'jewellery',
  'Sunglasses': 'sunglasses',
};

// Maps our category to department
const CATEGORY_TO_DEPARTMENT = {
  'T-shirts': 'womenswear',
  'Hoodies': 'womenswear',
  'Sweatshirts': 'womenswear',
  'Jumpers': 'womenswear',
  'Cardigans': 'womenswear',
  'Shirts': 'womenswear',
  'Polo shirts': 'womenswear',
  'Blouses': 'womenswear',
  'Jeans': 'womenswear',
  'Trousers': 'womenswear',
  'Shorts': 'womenswear',
  'Skirts': 'womenswear',
  'Dresses': 'womenswear',
  'Jackets': 'womenswear',
  'Coats': 'womenswear',
  'Blazers': 'womenswear',
  'Suits': 'womenswear',
  'Activewear': 'womenswear',
  'Swimwear': 'womenswear',
  'Underwear': 'womenswear',
  'Socks': 'womenswear',
  'Shoes': 'womenswear',
  'Boots': 'womenswear',
  'Trainers': 'womenswear',
  'Sandals': 'womenswear',
  'Bags': 'womenswear',
  'Hats': 'womenswear',
  'Scarves': 'womenswear',
  'Belts': 'womenswear',
  'Jewellery': 'womenswear',
  'Sunglasses': 'womenswear',
};

const CONDITION_MAP = {
  'Brand new': 'brand_new',
  'Like new': 'like_new',
  'Used - Excellent': 'used_excellent',
  'Used - Good': 'used_good',
  'Used - Fair': 'used_fair',
};

const COLOR_MAP = {
  'Black': 'black', 'Grey': 'grey', 'White': 'white', 'Brown': 'brown',
  'Tan': 'tan', 'Cream': 'cream', 'Yellow': 'yellow', 'Red': 'red',
  'Pink': 'pink', 'Orange': 'orange', 'Purple': 'purple', 'Blue': 'blue',
  'Navy': 'navy', 'Green': 'green', 'Khaki': 'khaki', 'Multicolour': 'multicolour',
};

const SOURCE_MAP = {
  'Vintage': 'vintage', 'Preloved': 'preloved',
  'Reworked / Upcycled': 'reworked', 'Custom': 'custom',
  'Handmade': 'handmade', 'Deadstock': 'deadstock',
  'Designer': 'designer', 'Repaired': 'repaired',
};

const AGE_MAP = {
  'Modern': 'modern', '00s': '00s', '90s': '90s', '80s': '80s',
  '70s': '70s', '60s': '60s', '50s': '50s', 'Antique': 'antique',
};

const STYLE_MAP = {
  'Streetwear': 'streetwear', 'Sportswear': 'sportswear', 'Loungewear': 'loungewear',
  'Goth': 'goth', 'Retro': 'retro', 'Boho': 'boho', 'Western': 'western',
  'Indie': 'indie', 'Skater': 'skater', 'Preppy': 'preppy', 'Minimalist': 'minimalist',
  'Y2K': 'y2k', 'Grunge': 'grunge', 'Classic': 'classic',
};

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const user = await base44.auth.me();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Read API key from DB (set via Settings page)
  let DEPOP_API_KEY = Deno.env.get('DEPOP_API_KEY');
  if (!DEPOP_API_KEY) {
    const settings = await base44.asServiceRole.entities.AppSettings.filter({ key: 'depop_api_key' });
    DEPOP_API_KEY = settings[0]?.value || null;
  }
  if (!DEPOP_API_KEY) {
    return Response.json({ error: 'Depop API key not configured. Please add it in Settings.' }, { status: 400 });
  }

  const { listing } = await req.json();

  if (!listing) {
    return Response.json({ error: 'No listing data provided' }, { status: 400 });
  }

  const sku = `SNAZZY-${Date.now()}`;
  const department = CATEGORY_TO_DEPARTMENT[listing.category] || 'womenswear';
  const product_type = CATEGORY_TO_PRODUCT_TYPE[listing.category] || 'other';

  const pictures = (listing.photo_urls || (listing.photo_url ? [listing.photo_url] : [])).map((url) => ({ url }));

  const body = {
    description: listing.description || '',
    price_currency: 'USD',
    price_amount: String(listing.price || '0'),
    quantity: 1,
    pictures,
    department,
    product_type,
    condition: CONDITION_MAP[listing.condition] || 'used_good',
    colour: listing.color ? [COLOR_MAP[listing.color] || listing.color.toLowerCase()] : [],
    source: listing.source ? [SOURCE_MAP[listing.source] || listing.source.toLowerCase()] : [],
    age: listing.age ? [AGE_MAP[listing.age] || listing.age.toLowerCase()] : [],
    style: listing.style ? [STYLE_MAP[listing.style] || listing.style.toLowerCase()] : [],
    brand: listing.brand || '',
    address: {
      country_code: 'US',
      state: 'Ohio',
    },
  };

  if (listing.worldwide_shipping && listing.price) {
    body.international_shipping_cost = '15.00';
  }

  const response = await fetch(`https://partnerapi.depop.com/api/v1/products/${sku}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${DEPOP_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    return Response.json({ error: data.message || 'Failed to post to Depop', details: data }, { status: response.status });
  }

  return Response.json({ success: true, product_id: data.product_id, sku });
});