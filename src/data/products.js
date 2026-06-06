// Catalog seed data.
// Edits made by an admin (via the Admin page) are layered on top of this seed
// in localStorage. To make those edits permanent for all visitors, export the
// updated file from the Admin page and replace this file, then redeploy.

export const categoryIcon = {
  Sofas: 'Sofa',
  Tables: 'Table',
  Lighting: 'Lamp',
  Bedroom: 'Bed',
  Lounge: 'Armchair',
  Storage: 'Package'
};

export const productsData = {
  categories:   ['Sofas', 'Tables', 'Lighting', 'Bedroom', 'Lounge', 'Storage'],
  // Optional second level under a category, keyed by category name.
  // e.g. { Sofas: ['2-Seater', '3-Seater'] }
  subcategories: {},
  materials:    ['Wood', 'Velvet', 'Leather', 'Metal', 'Linen', 'Wool', 'Marble', 'Glass'],
  roomTypes:    ['Living Room', 'Bedroom', 'Dining Room', 'Office', 'Hallway'],
  tags:         ['New', 'Bestseller', 'Popular'],
  availabilities: ['In Stock', 'Made to Order', 'Pre-order'],
  products: [
    {
      id: 'prod-1',
      name: 'Eos Lounge Chair',
      category: 'Lounge',
      subtitle: 'Finnish Wool & Steel',
      tag: 'New',
      material: 'Wool',
      roomType: 'Living Room',
      availability: 'In Stock',
      image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=800',
      gallery: [
        'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&q=80&w=800'
      ],
      description: 'A sculpted lounge chair that pairs Finnish wool upholstery with a slim powder-coated steel frame. Built for long evenings.',
      features: ['Handcrafted Details', 'Premium Materials', 'Ergonomic Design'],
      variants: [
        { id: '1-v1', colorName: 'Charcoal Wool', colorHex: '#3a3a3a', image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=800' },
        { id: '1-v2', colorName: 'Walnut Frame',  colorHex: '#5c4033', image: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=800' },
        { id: '1-v3', colorName: 'Bone Bouclé',   colorHex: '#e8e1d3', image: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&q=80&w=800' }
      ]
    },
    {
      id: 'prod-2',
      name: 'Oda Dining Table',
      category: 'Tables',
      subtitle: 'Solid White Oak',
      tag: 'Bestseller',
      material: 'Wood',
      roomType: 'Dining Room',
      availability: 'Made to Order',
      image: 'https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&q=80&w=800',
      gallery: [
        'https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1617325247661-675ab03407b3?auto=format&fit=crop&q=80&w=800'
      ],
      description: 'A six-seater oak dining table with hand-finished edges. Seats six comfortably, eight at a squeeze.',
      features: ['Sustainable Wood', 'Sturdy Construction', 'Soft-touch Finish'],
      variants: [
        { id: '2-v1', colorName: 'Natural Oak',   colorHex: '#d4b895', image: 'https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&q=80&w=800' },
        { id: '2-v2', colorName: 'Smoked Oak',    colorHex: '#7a5e42', image: 'https://images.unsplash.com/photo-1617325247661-675ab03407b3?auto=format&fit=crop&q=80&w=800' }
      ]
    },
    {
      id: 'prod-3',
      name: 'Lumina Floor Lamp',
      category: 'Lighting',
      subtitle: 'Aged Bronze & Linen',
      tag: 'New',
      material: 'Metal',
      roomType: 'Living Room',
      availability: 'In Stock',
      image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=80&w=800',
      gallery: [
        'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1565183997392-2f6f122e5912?auto=format&fit=crop&q=80&w=800'
      ],
      description: 'A reading-height floor lamp with a softly diffused linen shade and a slim metal stem.',
      features: ['Dimmable LED', 'Hand-finished Brass', 'Weighted Base'],
      variants: [
        { id: '3-v1', colorName: 'Aged Bronze', colorHex: '#8c7853', image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=80&w=800' },
        { id: '3-v2', colorName: 'Matte Black', colorHex: '#1a1a1a', image: 'https://images.unsplash.com/photo-1565183997392-2f6f122e5912?auto=format&fit=crop&q=80&w=800' }
      ]
    },
    {
      id: 'prod-4',
      name: 'Velour Cushion Set',
      category: 'Sofas',
      subtitle: 'Organic Cotton Velvet',
      tag: 'Popular',
      material: 'Velvet',
      roomType: 'Living Room',
      availability: 'In Stock',
      image: 'https://images.unsplash.com/photo-1592789705501-f9ae4287c4cf?auto=format&fit=crop&q=80&w=800',
      gallery: [
        'https://images.unsplash.com/photo-1592789705501-f9ae4287c4cf?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1540574163026-643ea20ade25?auto=format&fit=crop&q=80&w=800'
      ],
      description: 'Set of three cushions in heavyweight cotton velvet with concealed zips and feather-down inserts.',
      features: ['Removable Covers', 'Feather-down Filling', 'Hand-stitched'],
      variants: [
        { id: '4-v1', colorName: 'Teal',     colorHex: '#1f4e4a', image: 'https://images.unsplash.com/photo-1592789705501-f9ae4287c4cf?auto=format&fit=crop&q=80&w=800' },
        { id: '4-v2', colorName: 'Saffron',  colorHex: '#c98a3c', image: 'https://images.unsplash.com/photo-1540574163026-643ea20ade25?auto=format&fit=crop&q=80&w=800' },
        { id: '4-v3', colorName: 'Charcoal', colorHex: '#3a3a3a', image: 'https://images.unsplash.com/photo-1592789705501-f9ae4287c4cf?auto=format&fit=crop&q=80&w=800' }
      ]
    },
    {
      id: 'prod-5',
      name: 'Moda Bed Frame',
      category: 'Bedroom',
      subtitle: 'Walnut & Bouclé',
      tag: 'Bestseller',
      material: 'Wood',
      roomType: 'Bedroom',
      availability: 'Made to Order',
      image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=800',
      gallery: [
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&q=80&w=800'
      ],
      description: 'A low-profile platform bed in solid walnut with a generous bouclé-upholstered headboard.',
      features: ['Solid Walnut', 'Slatted Base', 'No-box-spring Required'],
      variants: [
        { id: '5-v1', colorName: 'Walnut & Ivory', colorHex: '#5c4033', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=800' },
        { id: '5-v2', colorName: 'Walnut & Sand',  colorHex: '#d8c8a8', image: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&q=80&w=800' }
      ]
    },
    {
      id: 'prod-6',
      name: 'Apex Shelf Unit',
      category: 'Storage',
      subtitle: 'Powder-coated Steel',
      tag: 'New',
      material: 'Metal',
      roomType: 'Living Room',
      availability: 'In Stock',
      image: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?auto=format&fit=crop&q=80&w=800',
      gallery: [
        'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1616486028682-168a2bf64af2?auto=format&fit=crop&q=80&w=800'
      ],
      description: 'A free-standing five-tier shelf with adjustable rails and concealed wall anchors.',
      features: ['Adjustable Shelves', 'Wall-anchor Included', 'Tool-free Assembly'],
      variants: [
        { id: '6-v1', colorName: 'Matte Black',  colorHex: '#1a1a1a', image: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?auto=format&fit=crop&q=80&w=800' },
        { id: '6-v2', colorName: 'Ivory Powder', colorHex: '#f5f0e6', image: 'https://images.unsplash.com/photo-1616486028682-168a2bf64af2?auto=format&fit=crop&q=80&w=800' }
      ]
    },
    {
      id: 'prod-7',
      name: 'Petra Coffee Table',
      category: 'Tables',
      subtitle: 'Travertine & Oak',
      tag: 'Popular',
      material: 'Marble',
      roomType: 'Living Room',
      availability: 'In Stock',
      image: 'https://images.unsplash.com/photo-1532372576444-dda954194ad0?auto=format&fit=crop&q=80&w=800',
      gallery: [
        'https://images.unsplash.com/photo-1532372576444-dda954194ad0?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1567016432779-094069958ea5?auto=format&fit=crop&q=80&w=800'
      ],
      description: 'A round travertine coffee table on a sculpted oak plinth — substantial yet airy.',
      features: ['Honed Travertine', 'Solid Oak Plinth', 'Felt Floor Protectors'],
      variants: [
        { id: '7-v1', colorName: 'Travertine Cream', colorHex: '#d8c8a8', image: 'https://images.unsplash.com/photo-1532372576444-dda954194ad0?auto=format&fit=crop&q=80&w=800' },
        { id: '7-v2', colorName: 'Travertine Storm', colorHex: '#7c7166', image: 'https://images.unsplash.com/photo-1567016432779-094069958ea5?auto=format&fit=crop&q=80&w=800' }
      ]
    },
    {
      id: 'prod-8',
      name: 'Nordic Wool Rug',
      category: 'Lounge',
      subtitle: 'Hand-woven New Zealand Wool',
      tag: 'Bestseller',
      material: 'Wool',
      roomType: 'Living Room',
      availability: 'In Stock',
      image: 'https://images.unsplash.com/photo-1600166898405-da9535204843?auto=format&fit=crop&q=80&w=800',
      gallery: [
        'https://images.unsplash.com/photo-1600166898405-da9535204843?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=800'
      ],
      description: 'A hand-woven low-pile rug in undyed New Zealand wool. Naturally stain-resistant.',
      features: ['Hand-woven', 'Natural Stain-resistance', 'Reversible Weave'],
      variants: [
        { id: '8-v1', colorName: 'Cream',  colorHex: '#f0e8d4', image: 'https://images.unsplash.com/photo-1600166898405-da9535204843?auto=format&fit=crop&q=80&w=800' },
        { id: '8-v2', colorName: 'Sienna', colorHex: '#a0522d', image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=800' }
      ]
    },
    {
      id: 'prod-9',
      name: 'Halden Sectional',
      category: 'Sofas',
      subtitle: 'Bouclé & Solid Ash',
      tag: 'New',
      material: 'Wool',
      roomType: 'Living Room',
      availability: 'Made to Order',
      image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80&w=800',
      gallery: [
        'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800'
      ],
      description: 'A modular four-seat sectional in heavyweight bouclé over a solid-ash internal frame.',
      features: ['Modular Configuration', 'Solid-ash Frame', 'Stain-shield Bouclé'],
      variants: [
        { id: '9-v1', colorName: 'Ivory Bouclé', colorHex: '#e8dfc8', image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80&w=800' },
        { id: '9-v2', colorName: 'Forest Bouclé', colorHex: '#2f4a3a', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800' }
      ]
    },
    {
      id: 'prod-10',
      name: 'Bram Pendant Light',
      category: 'Lighting',
      subtitle: 'Hand-blown Glass',
      tag: 'Popular',
      material: 'Glass',
      roomType: 'Dining Room',
      availability: 'In Stock',
      image: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&q=80&w=800',
      gallery: [
        'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?auto=format&fit=crop&q=80&w=800'
      ],
      description: 'A single hand-blown glass pendant, glazed and finished individually. No two are identical.',
      features: ['Hand-blown Glass', 'Adjustable Cable', 'Warm-white LED'],
      variants: [
        { id: '10-v1', colorName: 'Smoke', colorHex: '#5a5a5a', image: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&q=80&w=800' },
        { id: '10-v2', colorName: 'Amber', colorHex: '#c98a3c', image: 'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?auto=format&fit=crop&q=80&w=800' }
      ]
    },
    {
      id: 'prod-11',
      name: 'Senna Wardrobe',
      category: 'Storage',
      subtitle: 'Reeded Walnut',
      tag: 'Bestseller',
      material: 'Wood',
      roomType: 'Bedroom',
      availability: 'Made to Order',
      image: 'https://images.unsplash.com/photo-1616486028682-168a2bf64af2?auto=format&fit=crop&q=80&w=800',
      gallery: [
        'https://images.unsplash.com/photo-1616486028682-168a2bf64af2?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?auto=format&fit=crop&q=80&w=800'
      ],
      description: 'A two-door wardrobe with reeded walnut fronts, soft-close hinges, and an internal jewellery drawer.',
      features: ['Soft-close Doors', 'Internal Drawer', 'Adjustable Shelving'],
      variants: [
        { id: '11-v1', colorName: 'Walnut Reeded', colorHex: '#5c4033', image: 'https://images.unsplash.com/photo-1616486028682-168a2bf64af2?auto=format&fit=crop&q=80&w=800' }
      ]
    },
    {
      id: 'prod-12',
      name: 'Tessa Nightstand',
      category: 'Bedroom',
      subtitle: 'Smoked Oak',
      tag: 'New',
      material: 'Wood',
      roomType: 'Bedroom',
      availability: 'In Stock',
      image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=800',
      gallery: [
        'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=800'
      ],
      description: 'A compact bedside cabinet with a single soft-close drawer and a wireless-charging top shelf.',
      features: ['Wireless Charging', 'Soft-close Drawer', 'Cable Pass-through'],
      variants: [
        { id: '12-v1', colorName: 'Smoked Oak', colorHex: '#7a5e42', image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=800' },
        { id: '12-v2', colorName: 'Pale Ash',   colorHex: '#c8b89c', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=800' }
      ]
    },
    {
      id: 'prod-13',
      name: 'Kova Console Table',
      category: 'Tables',
      subtitle: 'Marble & Brass',
      tag: 'Popular',
      material: 'Marble',
      roomType: 'Hallway',
      availability: 'In Stock',
      image: 'https://images.unsplash.com/photo-1567016432779-094069958ea5?auto=format&fit=crop&q=80&w=800',
      gallery: [
        'https://images.unsplash.com/photo-1567016432779-094069958ea5?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1532372576444-dda954194ad0?auto=format&fit=crop&q=80&w=800'
      ],
      description: 'A slim hallway console with a Carrara marble top and brushed brass legs.',
      features: ['Carrara Marble', 'Brushed Brass', 'Sealed Stone Surface'],
      variants: [
        { id: '13-v1', colorName: 'Carrara White', colorHex: '#ede6dc', image: 'https://images.unsplash.com/photo-1567016432779-094069958ea5?auto=format&fit=crop&q=80&w=800' },
        { id: '13-v2', colorName: 'Nero Black',    colorHex: '#1a1a1a', image: 'https://images.unsplash.com/photo-1532372576444-dda954194ad0?auto=format&fit=crop&q=80&w=800' }
      ]
    },
    {
      id: 'prod-14',
      name: 'Astrid Wall Sconce',
      category: 'Lighting',
      subtitle: 'Brushed Brass',
      tag: 'New',
      material: 'Metal',
      roomType: 'Hallway',
      availability: 'In Stock',
      image: 'https://images.unsplash.com/photo-1565183997392-2f6f122e5912?auto=format&fit=crop&q=80&w=800',
      gallery: [
        'https://images.unsplash.com/photo-1565183997392-2f6f122e5912?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=80&w=800'
      ],
      description: 'A directional brass sconce with a knurled adjustment knob — for stairwells and reading nooks.',
      features: ['Directional Head', 'Knurled Knob', 'Hardwired Install'],
      variants: [
        { id: '14-v1', colorName: 'Brushed Brass', colorHex: '#b08d57', image: 'https://images.unsplash.com/photo-1565183997392-2f6f122e5912?auto=format&fit=crop&q=80&w=800' },
        { id: '14-v2', colorName: 'Antique Nickel', colorHex: '#8a8a8a', image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=80&w=800' }
      ]
    },
    {
      id: 'prod-15',
      name: 'Jasper Cane Armchair',
      category: 'Lounge',
      subtitle: 'Cane & Teak',
      tag: 'Bestseller',
      material: 'Wood',
      roomType: 'Living Room',
      availability: 'In Stock',
      image: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=800',
      gallery: [
        'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=800'
      ],
      description: 'A breezy armchair with a hand-woven cane back and a solid teak frame.',
      features: ['Hand-woven Cane', 'Solid Teak Frame', 'Removable Cushion'],
      variants: [
        { id: '15-v1', colorName: 'Honey Teak', colorHex: '#caa472', image: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=800' },
        { id: '15-v2', colorName: 'Black Teak', colorHex: '#2a2018', image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=800' }
      ]
    },
    {
      id: 'prod-16',
      name: 'Felix Modular Sofa',
      category: 'Sofas',
      subtitle: 'Performance Weave',
      tag: 'New',
      material: 'Linen',
      roomType: 'Living Room',
      availability: 'Made to Order',
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800',
      gallery: [
        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80&w=800'
      ],
      description: 'A reconfigurable three-piece sofa in a hard-wearing performance weave. Pet- and child-friendly.',
      features: ['Performance Fabric', 'Reconfigurable', 'Removable Covers'],
      variants: [
        { id: '16-v1', colorName: 'Sand',   colorHex: '#d8c8a8', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800' },
        { id: '16-v2', colorName: 'Indigo', colorHex: '#2a3a55', image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80&w=800' },
        { id: '16-v3', colorName: 'Olive',  colorHex: '#6b6e3a', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800' }
      ]
    },
    {
      id: 'prod-17',
      name: 'Marlow Side Table',
      category: 'Tables',
      subtitle: 'Iron & Ceramic',
      tag: 'Popular',
      material: 'Metal',
      roomType: 'Living Room',
      availability: 'In Stock',
      image: 'https://images.unsplash.com/photo-1617325247661-675ab03407b3?auto=format&fit=crop&q=80&w=800',
      gallery: [
        'https://images.unsplash.com/photo-1617325247661-675ab03407b3?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&q=80&w=800'
      ],
      description: 'A petite side table with a glazed ceramic top and a fine cast-iron base.',
      features: ['Glazed Ceramic', 'Cast-iron Base', 'Stackable Pair'],
      variants: [
        { id: '17-v1', colorName: 'Ink Black',  colorHex: '#16181c', image: 'https://images.unsplash.com/photo-1617325247661-675ab03407b3?auto=format&fit=crop&q=80&w=800' },
        { id: '17-v2', colorName: 'Bone White', colorHex: '#e8e1d3', image: 'https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&q=80&w=800' }
      ]
    },
    {
      id: 'prod-18',
      name: 'Linear Sideboard',
      category: 'Storage',
      subtitle: 'Reeded Glass & Oak',
      tag: 'New',
      material: 'Glass',
      roomType: 'Dining Room',
      availability: 'Made to Order',
      image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=800',
      gallery: [
        'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1616486028682-168a2bf64af2?auto=format&fit=crop&q=80&w=800'
      ],
      description: 'A long four-door sideboard with reeded glass fronts and a solid oak carcass.',
      features: ['Reeded Glass', 'Push-to-open Doors', 'Cable Management'],
      variants: [
        { id: '18-v1', colorName: 'Natural Oak', colorHex: '#d4b895', image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=800' },
        { id: '18-v2', colorName: 'Stained Walnut', colorHex: '#5c4033', image: 'https://images.unsplash.com/photo-1616486028682-168a2bf64af2?auto=format&fit=crop&q=80&w=800' }
      ]
    },
    {
      id: 'prod-19',
      name: 'Kira Leather Ottoman',
      category: 'Lounge',
      subtitle: 'Nubuck Leather',
      tag: 'Popular',
      material: 'Leather',
      roomType: 'Living Room',
      availability: 'In Stock',
      image: 'https://images.unsplash.com/photo-1540574163026-643ea20ade25?auto=format&fit=crop&q=80&w=800',
      gallery: [
        'https://images.unsplash.com/photo-1540574163026-643ea20ade25?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1592789705501-f9ae4287c4cf?auto=format&fit=crop&q=80&w=800'
      ],
      description: 'A rounded leather ottoman that doubles as extra seating. Naturally develops a patina with use.',
      features: ['Full-grain Nubuck', 'Develops Patina', 'Hidden Storage'],
      variants: [
        { id: '19-v1', colorName: 'Cognac', colorHex: '#a05a2c', image: 'https://images.unsplash.com/photo-1540574163026-643ea20ade25?auto=format&fit=crop&q=80&w=800' },
        { id: '19-v2', colorName: 'Stone',  colorHex: '#a8a098', image: 'https://images.unsplash.com/photo-1592789705501-f9ae4287c4cf?auto=format&fit=crop&q=80&w=800' }
      ]
    },
    {
      id: 'prod-20',
      name: 'Mira Headboard Bench',
      category: 'Bedroom',
      subtitle: 'Boucle Wool',
      tag: 'New',
      material: 'Wool',
      roomType: 'Bedroom',
      availability: 'Made to Order',
      image: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&q=80&w=800',
      gallery: [
        'https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=800'
      ],
      description: 'A long upholstered bench finished in heavyweight boucle. Designed to sit at the foot of a bed.',
      features: ['Heavyweight Bouclé', 'Solid-ash Frame', 'Stain-shielded'],
      variants: [
        { id: '20-v1', colorName: 'Oat',   colorHex: '#e0d4be', image: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&q=80&w=800' },
        { id: '20-v2', colorName: 'Slate', colorHex: '#5b6770', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=800' }
      ]
    }
  ]
};

// Backwards-compatible named exports so existing imports keep working.
export const products       = productsData.products;
export const subcategories  = productsData.subcategories || {};
export const categories     = ['All', ...productsData.categories];
export const materials      = ['All', ...productsData.materials];
export const roomTypes      = ['All', ...productsData.roomTypes];
export const tags           = ['All', ...productsData.tags];
export const availabilities = ['All', ...productsData.availabilities];
