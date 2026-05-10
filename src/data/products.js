// Filter taxonomies
export const categories = ['All', 'Sofas', 'Tables', 'Lighting', 'Bedroom', 'Lounge', 'Storage'];
export const materials = ['All', 'Wood', 'Velvet', 'Leather', 'Metal', 'Linen', 'Wool'];
export const roomTypes = ['All', 'Living Room', 'Bedroom', 'Dining Room', 'Office', 'Hallway'];
export const availabilities = ['All', 'In Stock', 'Made to Order', 'Pre-order'];
export const tags = ['All', 'New', 'Bestseller', 'Popular'];

// Map a category to a Lucide icon name (lowercase, kebab — must exist in lucide-react v1.14)
export const categoryIcon = {
  Sofas: 'Sofa',
  Tables: 'Table',
  Lighting: 'Lamp',
  Bedroom: 'Bed',
  Lounge: 'Armchair',
  Storage: 'Package'
};

// Curated catalog: each product has price, subtitle, tag, gallery, color variants.
// 50 items total — first 24 are hand-tuned to match the design; rest are generated.

const featuredSeed = [
  {
    name: 'Eos Lounge Chair',
    category: 'Lounge',
    subtitle: 'Finnish Wool & Steel',
    price: 124000,
    tag: 'New',
    material: 'Wool',
    roomType: 'Living Room',
    image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&q=80&w=800'
    ],
    variants: [
      { id: 'v1', colorName: 'Charcoal', colorHex: '#3a3a3a' },
      { id: 'v2', colorName: 'Walnut',   colorHex: '#5c4033' },
      { id: 'v3', colorName: 'Bone',     colorHex: '#e8e1d3' }
    ]
  },
  {
    name: 'Oda Dining Table',
    category: 'Tables',
    subtitle: 'Solid White Oak',
    price: 280000,
    tag: 'Bestseller',
    material: 'Wood',
    roomType: 'Dining Room',
    image: 'https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1617325247661-675ab03407b3?auto=format&fit=crop&q=80&w=800'
    ],
    variants: [
      { id: 'v1', colorName: 'Natural Oak', colorHex: '#d4b895' }
    ]
  },
  {
    name: 'Lumina Floor Lamp',
    category: 'Lighting',
    subtitle: 'Aged Bronze & Linen',
    price: 64000,
    tag: 'New',
    material: 'Metal',
    roomType: 'Living Room',
    image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1565183997392-2f6f122e5912?auto=format&fit=crop&q=80&w=800'
    ],
    variants: [
      { id: 'v1', colorName: 'Aged Bronze', colorHex: '#8c7853' },
      { id: 'v2', colorName: 'Black',       colorHex: '#1a1a1a' },
      { id: 'v3', colorName: 'Linen',       colorHex: '#e8dcc4' }
    ]
  },
  {
    name: 'Velour Cushion Set',
    category: 'Sofas',
    subtitle: 'Organic Cotton Velvet',
    price: 18000,
    tag: 'Popular',
    material: 'Velvet',
    roomType: 'Living Room',
    image: 'https://images.unsplash.com/photo-1592789705501-f9ae4287c4cf?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1540574163026-643ea20ade25?auto=format&fit=crop&q=80&w=800'
    ],
    variants: [
      { id: 'v1', colorName: 'Teal',     colorHex: '#1f4e4a' },
      { id: 'v2', colorName: 'Saffron',  colorHex: '#c98a3c' },
      { id: 'v3', colorName: 'Charcoal', colorHex: '#3a3a3a' }
    ]
  },
  {
    name: 'Moda Bed Frame',
    category: 'Bedroom',
    subtitle: 'Walnut & Bouclé',
    price: 340000,
    tag: 'Bestseller',
    material: 'Wood',
    roomType: 'Bedroom',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&q=80&w=800'
    ],
    variants: [
      { id: 'v1', colorName: 'Walnut', colorHex: '#5c4033' },
      { id: 'v2', colorName: 'Bone',   colorHex: '#e8e1d3' }
    ]
  },
  {
    name: 'Apex Shelf Unit',
    category: 'Storage',
    subtitle: 'Powder Coated Steel',
    price: 95000,
    tag: 'New',
    material: 'Metal',
    roomType: 'Living Room',
    image: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1616486028682-168a2bf64af2?auto=format&fit=crop&q=80&w=800'
    ],
    variants: [
      { id: 'v1', colorName: 'Black', colorHex: '#1a1a1a' }
    ]
  },
  {
    name: 'Petra Coffee Table',
    category: 'Tables',
    subtitle: 'Travertine & Oak',
    price: 158000,
    tag: 'Popular',
    material: 'Wood',
    roomType: 'Living Room',
    image: 'https://images.unsplash.com/photo-1532372576444-dda954194ad0?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1567016432779-094069958ea5?auto=format&fit=crop&q=80&w=800'
    ],
    variants: [
      { id: 'v1', colorName: 'Travertine', colorHex: '#d8c8a8' }
    ]
  },
  {
    name: 'Nordic Rug',
    category: 'Lounge',
    subtitle: 'Hand-woven New Zealand Wool',
    price: 82000,
    tag: 'Bestseller',
    material: 'Wool',
    roomType: 'Living Room',
    image: 'https://images.unsplash.com/photo-1600166898405-da9535204843?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=800'
    ],
    variants: [
      { id: 'v1', colorName: 'Cream', colorHex: '#f0e8d4' }
    ]
  },
  {
    name: 'Halden Sectional',
    category: 'Sofas',
    subtitle: 'Boucle & Solid Ash',
    price: 425000,
    tag: 'New',
    material: 'Wool',
    roomType: 'Living Room',
    image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800'
    ],
    variants: [
      { id: 'v1', colorName: 'Cream',   colorHex: '#e8dfc8' },
      { id: 'v2', colorName: 'Forest',  colorHex: '#2f4a3a' }
    ]
  },
  {
    name: 'Bram Pendant Light',
    category: 'Lighting',
    subtitle: 'Hand-blown Glass',
    price: 42000,
    tag: 'Popular',
    material: 'Metal',
    roomType: 'Dining Room',
    image: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?auto=format&fit=crop&q=80&w=800'
    ],
    variants: [
      { id: 'v1', colorName: 'Smoke', colorHex: '#5a5a5a' },
      { id: 'v2', colorName: 'Amber', colorHex: '#c98a3c' }
    ]
  },
  {
    name: 'Senna Wardrobe',
    category: 'Storage',
    subtitle: 'Reeded Walnut',
    price: 285000,
    tag: 'Bestseller',
    material: 'Wood',
    roomType: 'Bedroom',
    image: 'https://images.unsplash.com/photo-1616486028682-168a2bf64af2?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?auto=format&fit=crop&q=80&w=800'
    ],
    variants: [
      { id: 'v1', colorName: 'Walnut', colorHex: '#5c4033' }
    ]
  },
  {
    name: 'Tessa Nightstand',
    category: 'Bedroom',
    subtitle: 'Smoked Oak',
    price: 56000,
    tag: 'New',
    material: 'Wood',
    roomType: 'Bedroom',
    image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=800'
    ],
    variants: [
      { id: 'v1', colorName: 'Smoked Oak', colorHex: '#7a5e42' }
    ]
  }
];

// Variation helpers for the auto-generated remainder
const adjectives = ['Modular', 'Classic', 'Minimalist', 'Heritage', 'Studio', 'Atelier', 'Editorial', 'Linear'];
const nameRoots  = ['Oslo', 'Kova', 'Nera', 'Hemnes', 'Cello', 'Modena', 'Luna', 'Astrid', 'Jasper', 'Felix', 'Kira', 'Ravi'];

const subtitleByCategory = {
  Sofas:    ['Boucle & Brass', 'Italian Linen', 'Tufted Velvet', 'Performance Weave'],
  Tables:   ['Solid Walnut', 'Travertine Top', 'Ceramic & Iron', 'White Oak'],
  Lighting: ['Hand-blown Glass', 'Brushed Brass', 'Natural Rattan', 'Powder Coated Steel'],
  Bedroom:  ['Solid Ash', 'Upholstered Linen', 'Cane & Oak', 'Walnut & Brass'],
  Lounge:   ['Nubuck Leather', 'Boucle Wool', 'Cane & Teak', 'Hand-tufted Wool'],
  Storage:  ['Reeded Glass', 'Solid Oak', 'Powder Coated Steel', 'Walnut Veneer']
};

const galleryPool = [
  'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1616486028682-168a2bf64af2?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1617325247661-675ab03407b3?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1532372576444-dda954194ad0?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&q=80&w=800'
];

const colorPool = [
  { colorName: 'Walnut',    colorHex: '#5c4033' },
  { colorName: 'Bone',      colorHex: '#e8e1d3' },
  { colorName: 'Charcoal',  colorHex: '#3a3a3a' },
  { colorName: 'Forest',    colorHex: '#2f4a3a' },
  { colorName: 'Saffron',   colorHex: '#c98a3c' },
  { colorName: 'Teal',      colorHex: '#1f4e4a' },
  { colorName: 'Cream',     colorHex: '#f0e8d4' },
  { colorName: 'Black',     colorHex: '#1a1a1a' }
];

const featurePool = [
  'Premium Materials', 'Ergonomic Design', 'Handcrafted Details',
  'Easy Maintenance', 'Sustainable Wood', 'Scratch Resistant',
  'Sturdy Construction', 'Soft-touch Finish', 'Minimalist Aesthetic'
];

const baseDescription = (name, subtitle) =>
  `The ${name} blends architectural rigor with handcrafted warmth. Built from ${subtitle.toLowerCase()}, it is finished by hand in our Bopal workshop and made to age gracefully alongside your home.`;

// Build the seed list as full products
const seededProducts = featuredSeed.map((seed, i) => {
  const idx = i + 1;
  const imagePool = [seed.image, ...seed.gallery];
  return {
    id: `prod-${idx}`,
    name: seed.name,
    category: seed.category,
    subtitle: seed.subtitle,
    price: seed.price,
    tag: seed.tag,
    image: seed.image,
    gallery: [seed.image, ...seed.gallery],
    description: baseDescription(seed.name, seed.subtitle),
    features: [featurePool[i % featurePool.length], featurePool[(i + 1) % featurePool.length], featurePool[(i + 2) % featurePool.length]],
    variants: seed.variants.map((v, vi) => ({
      ...v,
      id: `${idx}-${v.id}`,
      image: imagePool[vi] || imagePool[imagePool.length - 1] || seed.image
    })),
    material: seed.material,
    roomType: seed.roomType,
    availability: ['In Stock', 'Made to Order', 'Pre-order'][i % 3]
  };
});

// Auto-generate the rest
const generatedProducts = Array.from({ length: 38 }, (_, k) => {
  const i = featuredSeed.length + k;
  const id = i + 1;
  const cats = ['Sofas', 'Tables', 'Lighting', 'Bedroom', 'Lounge', 'Storage'];
  const category = cats[i % cats.length];

  const root = nameRoots[i % nameRoots.length];
  const adj  = adjectives[(i + 2) % adjectives.length];
  const name = `${root} ${adj} ${category === 'Sofas' ? 'Sofa' : category === 'Tables' ? 'Table' : category === 'Lighting' ? 'Light' : category === 'Bedroom' ? 'Bed' : category === 'Lounge' ? 'Lounge' : 'Cabinet'}`;

  const subtitleOptions = subtitleByCategory[category];
  const subtitle = subtitleOptions[i % subtitleOptions.length];

  const tag = ['New', 'Bestseller', 'Popular'][i % 3];
  const price = 40000 + ((i * 17) % 40) * 5000;

  const variantCount = 1 + (i % 3);
  const variants = Array.from({ length: variantCount }, (_, vi) => {
    const c = colorPool[(i + vi) % colorPool.length];
    return { id: `${id}-v${vi + 1}`, colorName: c.colorName, colorHex: c.colorHex, image: galleryPool[(i + vi) % galleryPool.length] };
  });

  const image = variants[0].image;
  const gallery = [
    image,
    galleryPool[(i + 3) % galleryPool.length],
    galleryPool[(i + 6) % galleryPool.length]
  ];

  const materialMap = { Sofas: 'Velvet', Tables: 'Wood', Lighting: 'Metal', Bedroom: 'Wood', Lounge: 'Wool', Storage: 'Wood' };
  const roomMap     = { Sofas: 'Living Room', Tables: 'Dining Room', Lighting: 'Living Room', Bedroom: 'Bedroom', Lounge: 'Living Room', Storage: 'Bedroom' };

  return {
    id: `prod-${id}`,
    name,
    category,
    subtitle,
    price,
    tag,
    image,
    gallery,
    description: baseDescription(name, subtitle),
    features: [featurePool[i % featurePool.length], featurePool[(i + 1) % featurePool.length], featurePool[(i + 2) % featurePool.length]],
    variants,
    material: materialMap[category],
    roomType: roomMap[category],
    availability: ['In Stock', 'Made to Order', 'Pre-order'][i % 3]
  };
});

export const products = [...seededProducts, ...generatedProducts];

export const formatPrice = (n) => {
  if (n == null || isNaN(n)) return '';
  return `₹${Number(n).toLocaleString('en-IN')}`;
};
