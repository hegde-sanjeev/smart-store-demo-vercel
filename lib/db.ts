import path from 'path';
import fs from 'fs';

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
  location: { x: number; y: number; aisle: string; row?: number };
}

export interface Session {
  id: string;
  activeProductId: string | null;
  kioskStatus: 'idle' | 'browsing' | 'handoff_initiated';
  alexaQuery: string | null;
  lastUpdate: number;
}

export interface Alert {
  id: string;
  sessionId: string;
  productId: string;
  status: 'new' | 'viewed' | 'resolved';
  deviceType: string;
  timestamp: number;
}

export interface Database {
  products: Product[];
  sessions: Record<string, Session>;
  alerts: Alert[];
}

// Store layout: Letter = Section (A–H), Number = Row (1–5)
// A = Electronics   (top-left)
// B = Clothing      (top second)
// C = Sports        (top third)
// D = Home & Garden (top right)
// E = Produce       (bottom-left)
// F = Bakery        (bottom second)
// G = Dairy&Chilled (bottom third)
// H = Pharmacy      (bottom right)

const DEFAULT_PRODUCTS: Product[] = [

  // ─── ELECTRONICS (Aisle A) ──────────────────────────────────────────────────

  {
    id: "1",
    name: "Samsung 65\" 4K QLED Smart TV",
    price: 1099,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500&auto=format&fit=crop",
    description: "Experience cinema-quality colour with Quantum Dot technology across a 65-inch panel. Features 4K upscaling, Dolby Atmos, and a built-in voice assistant. Perfect for home entertainment with 4 HDMI ports and a clean, slim bezel design.",
    location: { x: 10, y: 14, aisle: "A1", row: 1 }
  },
  {
    id: "2",
    name: "Apple MacBook Pro 14\"",
    price: 1999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop",
    description: "Powered by the M3 Pro chip, this MacBook delivers extraordinary performance for professionals. With a stunning Liquid Retina XDR display, up to 18 hours of battery life, and MagSafe charging, it redefines what a pro laptop can do.",
    location: { x: 12, y: 14, aisle: "A1", row: 1 }
  },
  {
    id: "3",
    name: "iPhone 15 Pro",
    price: 999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500&auto=format&fit=crop",
    description: "Forged in titanium with the A17 Pro chip, a customisable Action button, and a breakthrough 48MP camera system with 5x telephoto optical zoom. USB-C connectivity enables professional-grade 4K 60fps video recording.",
    location: { x: 14, y: 16, aisle: "A2", row: 2 }
  },
  {
    id: "4",
    name: "Sony WH-1000XM5 Headphones",
    price: 349,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop",
    description: "Industry-leading noise cancellation powered by two processors and eight microphones. Soft-fit leather and lightweight design ensure all-day comfort, with 30-hour battery life and multipoint connection to switch between two devices seamlessly.",
    location: { x: 16, y: 16, aisle: "A2", row: 2 }
  },
  {
    id: "5",
    name: "iPad Pro 12.9\"",
    price: 1099,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&auto=format&fit=crop",
    description: "The most advanced iPad ever, featuring the M2 chip and a Liquid Retina XDR display with ProMotion technology. Compatible with Apple Pencil and the Magic Keyboard, it transforms from a powerful tablet to a laptop replacement in seconds.",
    location: { x: 10, y: 18, aisle: "A3", row: 3 }
  },
  {
    id: "6",
    name: "Sony Alpha A7 IV Camera",
    price: 2499,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=500&auto=format&fit=crop",
    description: "A full-frame mirrorless camera with a 33MP back-illuminated sensor delivering stunning detail in any lighting condition. Real-time tracking AF and 10fps burst shooting capture every decisive moment for photo and video professionals alike.",
    location: { x: 12, y: 18, aisle: "A3", row: 3 }
  },
  {
    id: "7",
    name: "Keychron Q1 Mechanical Keyboard",
    price: 169,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop",
    description: "A fully customisable QMK/VIA compatible mechanical keyboard in a solid aluminium body with Gateron G Pro switches and double-shot PBT keycaps. Per-key RGB backlighting and a brass weight underneath give it a premium feel and satisfying sound.",
    location: { x: 14, y: 20, aisle: "A4", row: 4 }
  },
  {
    id: "8",
    name: "LG 27\" UltraGear 4K Monitor",
    price: 449,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop",
    description: "A 4K Nano IPS display with 1ms response time and 144Hz refresh rate for gamers and creatives alike. HDR600 support, 98% sRGB colour accuracy, and USB-C with 90W power delivery make this a true all-in-one workstation display.",
    location: { x: 16, y: 20, aisle: "A4", row: 4 }
  },
  {
    id: "9",
    name: "Nintendo Switch OLED",
    price: 349,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=500&auto=format&fit=crop",
    description: "Play at home on TV or take it anywhere with the vibrant 7-inch OLED screen and enhanced audio. Includes a wide adjustable stand, a dock with LAN port, and 64GB of internal storage for a complete gaming experience at home or on the go.",
    location: { x: 10, y: 22, aisle: "A5", row: 5 }
  },
  {
    id: "10",
    name: "Apple AirPods Pro (2nd Gen)",
    price: 249,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1606741965429-8d76ff50bb2f?w=500&auto=format&fit=crop",
    description: "Rebuilt with the H2 chip for up to 2x more active noise cancellation. Adaptive Transparency, Personalised Spatial Audio, and up to 30 hours total battery life with the MagSafe charging case make these the benchmark for wireless earbuds.",
    location: { x: 12, y: 22, aisle: "A5", row: 5 }
  },
  {
    id: "11",
    name: "Logitech MX Master 3S Mouse",
    price: 99,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&auto=format&fit=crop",
    description: "An advanced wireless mouse with a MagSpeed electromagnetic scroll wheel that spins at 1,000 lines per second and auto-shifts between ratchet and free-spin modes. Works on any surface including glass. Three-device Bluetooth pairing included.",
    location: { x: 14, y: 14, aisle: "A2", row: 2 }
  },
  {
    id: "12",
    name: "Anker 24,000mAh Power Bank",
    price: 59,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500&auto=format&fit=crop",
    description: "Charge three devices simultaneously with 140W USB-C output — enough to fully charge a MacBook Pro in under 90 minutes. The high-capacity cell delivers three full iPhone charges. LED indicator shows remaining power at a glance in any lighting condition.",
    location: { x: 16, y: 14, aisle: "A1", row: 1 }
  },
  {
    id: "13",
    name: "Google Nest Hub (2nd Gen)",
    price: 99,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&auto=format&fit=crop",
    description: "A smart home hub with a 7-inch display to control smart devices, stream content, and follow along with recipes hands-free. The built-in Sleep Sensing feature uses radar technology to track your sleep without wearing a device. Just ask Google.",
    location: { x: 10, y: 20, aisle: "A4", row: 4 }
  },

  // ─── CLOTHING (Aisle B) ─────────────────────────────────────────────────────

  {
    id: "14",
    name: "Classic Oxford Shirt",
    price: 79,
    category: "Clothing",
    image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=500&auto=format&fit=crop",
    description: "Cut from 100% premium cotton in a subtle Oxford weave, this timeless shirt transitions effortlessly from boardroom to weekend brunch. The relaxed fit, button-down collar, and single chest pocket give it an understated versatility that never goes out of style.",
    location: { x: 34, y: 14, aisle: "B1", row: 1 }
  },
  {
    id: "15",
    name: "Slim Fit Selvedge Denim Jeans",
    price: 89,
    category: "Clothing",
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&auto=format&fit=crop",
    description: "Crafted from Japanese selvedge denim with 2% elastane for comfort and shape retention. The slim cut tapers cleanly from thigh to ankle, working equally well dressed up with a blazer or down with a clean trainer. Available in raw indigo and washed grey.",
    location: { x: 36, y: 14, aisle: "B1", row: 1 }
  },
  {
    id: "16",
    name: "Floral Wrap Midi Dress",
    price: 95,
    category: "Clothing",
    image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=500&auto=format&fit=crop",
    description: "A feminine silhouette in lightweight viscose crepe with an adjustable self-tie wrap waist. The midi length and V-neckline are universally flattering, while the vibrant botanical print brings the look to life. Machine washable and barely creases — ideal for travel.",
    location: { x: 34, y: 16, aisle: "B2", row: 2 }
  },
  {
    id: "17",
    name: "Merino Wool Crewneck Sweater",
    price: 129,
    category: "Clothing",
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&auto=format&fit=crop",
    description: "Knitted from extra-fine 18.5-micron merino wool that feels as soft as cashmere. Temperature-regulating and naturally odour-resistant, it works across all seasons. The relaxed crewneck silhouette layers perfectly over shirts or under jackets.",
    location: { x: 36, y: 16, aisle: "B2", row: 2 }
  },
  {
    id: "18",
    name: "Leather Biker Jacket",
    price: 299,
    category: "Clothing",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&auto=format&fit=crop",
    description: "Full-grain lamb leather with a supple hand feel that softens and improves with age. Asymmetric zip closure, snap-down lapels, and quilted shoulder panels give an authentic edge. Fully satin-lined for easy on-and-off. A wardrobe investment built to last decades.",
    location: { x: 34, y: 18, aisle: "B3", row: 3 }
  },
  {
    id: "19",
    name: "Linen Blend Summer Blazer",
    price: 149,
    category: "Clothing",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500&auto=format&fit=crop",
    description: "A relaxed, unstructured blazer in a premium linen-cotton blend — breathable enough for warm days yet polished enough for smart-casual occasions. Notch lapels, a single-button front, and patch pockets give it a clean, contemporary feel.",
    location: { x: 36, y: 18, aisle: "B3", row: 3 }
  },
  {
    id: "20",
    name: "Heavyweight Garment-Dyed Hoodie",
    price: 85,
    category: "Clothing",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&auto=format&fit=crop",
    description: "Garment-dyed in a vintage wash, this 420gsm French terry hoodie develops character the more you wear it. Double-layered hood, ribbed cuffs, and a kangaroo pocket. Pre-shrunk and reinforced at all stress points for a fit that holds its shape wash after wash.",
    location: { x: 34, y: 20, aisle: "B4", row: 4 }
  },
  {
    id: "21",
    name: "Tailored Chino Trousers",
    price: 99,
    category: "Clothing",
    image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500&auto=format&fit=crop",
    description: "Cut from a fine peach-finish cotton twill that drapes cleanly without being stiff. A mid-rise waist and straight leg make these a wardrobe workhorse — pair with a tucked shirt for smart-casual or a tee for weekends. Available in sand, navy, olive, and charcoal.",
    location: { x: 36, y: 20, aisle: "B4", row: 4 }
  },
  {
    id: "22",
    name: "Silk Blend Blouse",
    price: 115,
    category: "Clothing",
    image: "https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=500&auto=format&fit=crop",
    description: "A fluid, lustrous blouse in a 70% silk, 30% crepe de chine blend. The relaxed, boxy silhouette tucks cleanly into tailored trousers or sits beautifully untucked over wide-leg denim. Hand wash cold for a garment that outlasts trends.",
    location: { x: 34, y: 22, aisle: "B5", row: 5 }
  },
  {
    id: "23",
    name: "Recycled Down Puffer Coat",
    price: 249,
    category: "Clothing",
    image: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=500&auto=format&fit=crop",
    description: "Filled with 600-fill-power recycled down in a water-resistant ripstop shell, this coat delivers serious warmth without bulk. An internal storm flap, adjustable cuffs, and hem drawcord seal in heat, while the packable design folds into its own inner pocket.",
    location: { x: 36, y: 22, aisle: "B5", row: 5 }
  },
  {
    id: "24",
    name: "Cotton-Modal Polo Shirt",
    price: 65,
    category: "Clothing",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop",
    description: "Knitted from a premium cotton-modal blend with a natural sheen and beautiful drape. The two-button placket, ribbed collar and cuffs give refined structure while keeping the relaxed feel of a weekend shirt. A wardrobe essential available in ten classic colours.",
    location: { x: 34, y: 14, aisle: "B1", row: 1 }
  },
  {
    id: "25",
    name: "Pure Linen Wide-Leg Trousers",
    price: 89,
    category: "Clothing",
    image: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=500&auto=format&fit=crop",
    description: "Pure linen wide-leg trousers with an elasticated back waistband for easy all-day comfort. The relaxed drape is effortlessly chic and the fabric softens with every wash. Side pockets with clean-finished seams. Style with sandals or slides for effortless summer dressing.",
    location: { x: 36, y: 14, aisle: "B2", row: 2 }
  },
  {
    id: "26",
    name: "Merino Knit Beanie",
    price: 35,
    category: "Clothing",
    image: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=500&auto=format&fit=crop",
    description: "A dense chunky-knit beanie in 100% merino wool that sits close to the head for warmth without bulk. The ribbed body and folded cuff give a clean look that works with everything from winter coats to fleece jackets. Available in 12 seasonal colourways.",
    location: { x: 38, y: 16, aisle: "B2", row: 2 }
  },

  // ─── SPORTS (Aisle C) ───────────────────────────────────────────────────────

  {
    id: "27",
    name: "Liforme Pro Yoga Mat",
    price: 149,
    category: "Sports",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&auto=format&fit=crop",
    description: "The world's most supportive yoga mat, featuring AlignForMe markers to perfect every pose. The 4.2mm natural rubber base provides exceptional grip even when wet, while the polyurethane top layer prevents slipping during hot yoga. Includes a carry strap.",
    location: { x: 58, y: 14, aisle: "C1", row: 1 }
  },
  {
    id: "28",
    name: "Bowflex SelectTech 552 Dumbbells",
    price: 429,
    category: "Sports",
    image: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=500&auto=format&fit=crop",
    description: "Two dumbbells that replace 15 sets of weights with a simple dial-select system adjusting from 5 to 52.5 lbs in 2.5 lb increments. The compact design stores in a fraction of the space of a traditional rack. Ideal for home gyms and endorsed by professional trainers.",
    location: { x: 60, y: 14, aisle: "C1", row: 1 }
  },
  {
    id: "29",
    name: "Wilson NBA Official Basketball",
    price: 79,
    category: "Sports",
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=500&auto=format&fit=crop",
    description: "The official game ball of the NBA, constructed with the same eight-panel configuration and Cushion Core technology used in professional play. The composite leather cover provides superior grip and a consistent feel in all weather conditions, indoors and outdoors.",
    location: { x: 58, y: 16, aisle: "C2", row: 2 }
  },
  {
    id: "30",
    name: "Theraband Resistance Band Set (5-piece)",
    price: 39,
    category: "Sports",
    image: "https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=500&auto=format&fit=crop",
    description: "Five latex resistance bands in progressive resistance levels from 5 to 50 lbs, used by physiotherapists worldwide. Suitable for strength training, rehabilitation, and stretching. Durable, portable, and appropriate for all fitness levels from beginner to elite athlete.",
    location: { x: 60, y: 16, aisle: "C2", row: 2 }
  },
  {
    id: "31",
    name: "TriggerPoint GRID Foam Roller",
    price: 49,
    category: "Sports",
    image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop",
    description: "The original foam roller with a multi-density exterior designed to replicate the hands of a massage therapist. The hollow core supports up to 500 lbs. The GRID pattern channels blood and oxygen into muscles, accelerating post-workout recovery and reducing soreness.",
    location: { x: 58, y: 18, aisle: "C3", row: 3 }
  },
  {
    id: "32",
    name: "WOD Nation Speed Jump Rope",
    price: 29,
    category: "Sports",
    image: "https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=500&auto=format&fit=crop",
    description: "A precision-engineered jump rope with 360° rotation ball-bearing handles and an ultra-lightweight PVC-coated cable. Fully adjustable from 7 to 11 feet for all heights. Includes an extra cable and spare bearings. Endorsed by CrossFit coaches worldwide.",
    location: { x: 60, y: 18, aisle: "C3", row: 3 }
  },
  {
    id: "33",
    name: "On Cloudsurfer Running Shoes",
    price: 159,
    category: "Sports",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop",
    description: "Built on On's CloudTec® cushioning system, each landing triggers soft underfoot cushioning while launching a firm, explosive toe-off. The engineered mesh upper wraps the foot in precise support without restricting natural movement. Zero break-in required.",
    location: { x: 58, y: 20, aisle: "C4", row: 4 }
  },
  {
    id: "34",
    name: "Hydro Flask 32oz Wide Mouth",
    price: 44,
    category: "Sports",
    image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop",
    description: "TempShield double-wall vacuum insulation keeps drinks cold for 24 hours and hot for 12. The wide mouth fits ice cubes and is compatible with straw, flex cap, and bite valve lids. BPA-free, phthalate-free, and dishwasher safe. Made from professional-grade stainless steel.",
    location: { x: 60, y: 20, aisle: "C4", row: 4 }
  },
  {
    id: "35",
    name: "CAP Barbell 35lb Kettlebell",
    price: 65,
    category: "Sports",
    image: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=500&auto=format&fit=crop",
    description: "Cast from a single piece of solid iron with a smooth, corrosion-resistant enamel coating and a flat base to prevent rolling. The ergonomic handle is wide enough for two-handed swings and cleans. A foundational piece of equipment for functional fitness training.",
    location: { x: 58, y: 22, aisle: "C5", row: 5 }
  },
  {
    id: "36",
    name: "Adidas Squadra 40L Training Bag",
    price: 55,
    category: "Sports",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop",
    description: "A spacious 40-litre duffel in durable 300D polyester with a reinforced base. Features a ventilated shoe compartment, water-resistant wet pocket, and padded laptop sleeve. Adjustable shoulder strap and carry handles for flexible transport from gym to pitch.",
    location: { x: 60, y: 22, aisle: "C5", row: 5 }
  },
  {
    id: "37",
    name: "Gaiam Premium Yoga Blocks (2-pack)",
    price: 24,
    category: "Sports",
    image: "https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=500&auto=format&fit=crop",
    description: "Firm, bevelled-edge foam yoga blocks that provide support and improve alignment in every pose. The lightweight 9x6x4-inch design fits easily in a yoga bag, while three height options let you customise depth and difficulty for any flexibility level or practice style.",
    location: { x: 58, y: 14, aisle: "C1", row: 1 }
  },
  {
    id: "38",
    name: "Wilson Pro Staff Tennis Racket",
    price: 229,
    category: "Sports",
    image: "https://images.unsplash.com/photo-1531315630201-bb15abeb1653?w=500&auto=format&fit=crop",
    description: "Co-designed with Roger Federer, the Pro Staff RF97 Autograph features a braided graphite frame for remarkable feel and control. Countervail technology reduces vibration by 21%, protecting your arm on every swing. The racket of choice for those who prioritise precision.",
    location: { x: 60, y: 16, aisle: "C2", row: 2 }
  },
  {
    id: "39",
    name: "MIPS Road Cycling Helmet",
    price: 89,
    category: "Sports",
    image: "https://images.unsplash.com/photo-1601971360277-7b4c8aa60894?w=500&auto=format&fit=crop",
    description: "MIPS-equipped for advanced rotational protection, featuring 20 aerodynamic vents, an integrated rear LED, and a BOA fit system for tool-free micro-adjustable sizing. Lightweight at just 285g — comfortable enough to forget you're wearing it on long rides.",
    location: { x: 58, y: 16, aisle: "C2", row: 2 }
  },

  // ─── HOME & GARDEN (Aisle D) ────────────────────────────────────────────────

  {
    id: "40",
    name: "Le Creuset Signature Casserole 26cm",
    price: 299,
    category: "Home & Garden",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&auto=format&fit=crop",
    description: "The iconic French oven enamelled inside and out for a lifetime of cooking. The sand interior resists staining and aids browning monitoring. Suitable for all hob types including induction, oven-safe to 260°C. The tight-fitting lid circulates steam to lock in moisture and flavour.",
    location: { x: 82, y: 14, aisle: "D1", row: 1 }
  },
  {
    id: "41",
    name: "Brooklinen Luxe Core Sheet Set",
    price: 149,
    category: "Home & Garden",
    image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500&auto=format&fit=crop",
    description: "480-thread-count 100% long-staple cotton in a sateen weave that feels incredibly smooth from the first wash. Includes a flat sheet, a fitted sheet with 16-inch deep pockets, and two pillowcases. Pre-washed to prevent shrinking. Available in 35 colours.",
    location: { x: 84, y: 14, aisle: "D1", row: 1 }
  },
  {
    id: "42",
    name: "Sage-Glazed Terracotta Pot Set (3-piece)",
    price: 49,
    category: "Home & Garden",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500&auto=format&fit=crop",
    description: "Hand-thrown terracotta pots in graduated sizes of 10cm, 14cm, and 18cm with matching drainage saucers. The porous clay regulates soil moisture naturally, reducing the risk of overwatering. A satin matte sage green glaze adds a contemporary edge to classic terracotta.",
    location: { x: 82, y: 16, aisle: "D2", row: 2 }
  },
  {
    id: "43",
    name: "Diptyque Figuier Candle 300g",
    price: 85,
    category: "Home & Garden",
    image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=500&auto=format&fit=crop",
    description: "Inspired by a fig tree in full sun, this iconic candle blends milky sap, fresh leaves, and warm woody bark into a complex fragrance that fills a room without overwhelming. Made in France using natural waxes and a cotton wick. Burns for approximately 60 hours.",
    location: { x: 84, y: 16, aisle: "D2", row: 2 }
  },
  {
    id: "44",
    name: "Bambu Organic Cutting Board Set",
    price: 55,
    category: "Home & Garden",
    image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=500&auto=format&fit=crop",
    description: "Three sustainable bamboo cutting boards in small, medium, and large. Bamboo is naturally antimicrobial, harder than maple, and gentler on knife edges. Each board has a juice groove and non-slip rubber feet. Food-safe and easy to clean after every use.",
    location: { x: 82, y: 18, aisle: "D3", row: 3 }
  },
  {
    id: "45",
    name: "Anglepoise Original 1227 Desk Lamp",
    price: 249,
    category: "Home & Garden",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&auto=format&fit=crop",
    description: "The lamp that defined a design icon in 1935 and hasn't needed changing since. Three springs balance it perfectly at any angle for infinitely adjustable task lighting. Made in England with full metal construction. Fits a standard E27 bulb and comes with a 5-year guarantee.",
    location: { x: 84, y: 18, aisle: "D3", row: 3 }
  },
  {
    id: "46",
    name: "Tower Cerastone 5-Piece Cookware Set",
    price: 179,
    category: "Home & Garden",
    image: "https://images.unsplash.com/photo-1592156553722-a2335059951a?w=500&auto=format&fit=crop",
    description: "A complete set including a 16cm saucepan, 20cm saucepan, 28cm frying pan, and 24cm casserole with glass lids. The Cerastone forged aluminium body delivers even heat, while the ceramic non-stick coating is PFOA-free and safe for metal utensils.",
    location: { x: 82, y: 20, aisle: "D4", row: 4 }
  },
  {
    id: "47",
    name: "Vitruvi Stone Essential Oil Diffuser",
    price: 119,
    category: "Home & Garden",
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&auto=format&fit=crop",
    description: "A minimalist ultrasonic diffuser milled from real stone that doubles as a sculptural home object. Runs for up to 7 hours continuously or on a 4-hour auto-shutoff. Whisper-quiet operation and a soft warm glow make it ideal for bedrooms and living spaces.",
    location: { x: 84, y: 20, aisle: "D4", row: 4 }
  },
  {
    id: "48",
    name: "Pendleton Eco-Wise Merino Throw",
    price: 99,
    category: "Home & Garden",
    image: "https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?w=500&auto=format&fit=crop",
    description: "Woven in Portland, Oregon from 100% virgin merino wool treated with an eco-conscious wash process that makes it fully machine washable. The bold geometric pattern draws on Pendleton's 150-year heritage of artisan weaving. Sized at a generous 50 x 70 inches.",
    location: { x: 82, y: 22, aisle: "D5", row: 5 }
  },
  {
    id: "49",
    name: "Fiskars Xact 3-Piece Garden Tool Set",
    price: 79,
    category: "Home & Garden",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500&auto=format&fit=crop",
    description: "A cultivator, trowel, and transplanter forged from solid steel for long-lasting durability. The ergonomic SoftGrip handle reduces hand fatigue during extended planting sessions. The pointed trowel blade penetrates compacted soil with ease. Lifetime guarantee against breakage.",
    location: { x: 84, y: 22, aisle: "D5", row: 5 }
  },
  {
    id: "50",
    name: "Brabantia Bo Touch Bin 60L",
    price: 139,
    category: "Home & Garden",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&auto=format&fit=crop",
    description: "A fingerprint-proof steel kitchen bin with a silent, soft-touch lid mechanism and a removable inner bucket for easy emptying. The FlatBack design fits flush against walls to save space. Includes one year's supply of well-fitting liners. Available in matte black and platinum.",
    location: { x: 82, y: 14, aisle: "D1", row: 1 }
  },
  {
    id: "51",
    name: "Joseph Joseph Nest 9 Prep Set",
    price: 89,
    category: "Home & Garden",
    image: "https://images.unsplash.com/photo-1584990347193-6bebebfeaeee?w=500&auto=format&fit=crop",
    description: "Nine colour-coded mixing bowls, colanders, and sieves that nest together to occupy the footprint of a single bowl. Made from impact-resistant BPA-free polypropylene. The smart design means every item is instantly accessible without digging through a cupboard.",
    location: { x: 84, y: 14, aisle: "D1", row: 1 }
  },
  {
    id: "52",
    name: "LEGO Botanical Orchid (608 pieces)",
    price: 55,
    category: "Home & Garden",
    image: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=500&auto=format&fit=crop",
    description: "Build a stunning display orchid from 608 LEGO pieces that will never need watering. Adjustable stem and leaf positions let you style it exactly as you like. The detailed blooms are indistinguishable from real flowers at a distance. A perfect gift for plant lovers and builders alike.",
    location: { x: 82, y: 16, aisle: "D2", row: 2 }
  },

  // ─── PRODUCE (Aisle E) ──────────────────────────────────────────────────────

  {
    id: "53",
    name: "Organic Bananas (bunch, ~6)",
    price: 1.89,
    category: "Produce",
    image: "https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=500&auto=format&fit=crop",
    description: "Grown under Rainforest Alliance certified conditions in Ecuador, these organic bananas arrive at just the right ripeness. Naturally rich in potassium, vitamin B6, and dietary fibre — the perfect grab-and-go snack, smoothie base, or porridge topping.",
    location: { x: 10, y: 42, aisle: "E1", row: 1 }
  },
  {
    id: "54",
    name: "British Strawberries 400g",
    price: 3.29,
    category: "Produce",
    image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=500&auto=format&fit=crop",
    description: "Seasonal British strawberries hand-picked at peak ripeness from farms in Kent and Herefordshire. Sweeter and more intensely flavoured than imported varieties — outstanding eaten fresh with cream, atop pavlova, or blitzed into a vibrant coulis.",
    location: { x: 12, y: 42, aisle: "E1", row: 1 }
  },
  {
    id: "55",
    name: "Baby Spinach 200g",
    price: 1.59,
    category: "Produce",
    image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop",
    description: "Tender baby spinach leaves, triple-washed and ready to eat. An outstanding source of iron, folate, and vitamins K and C. Mild enough for salads and robust enough to wilt into pastas, curries, and omelettes. Grown in pesticide-free greenhouses for year-round freshness.",
    location: { x: 10, y: 44, aisle: "E2", row: 2 }
  },
  {
    id: "56",
    name: "Ripe Avocados (pack of 4)",
    price: 2.99,
    category: "Produce",
    image: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=500&auto=format&fit=crop",
    description: "Hand-selected Hass avocados from family farms in Peru, selected to be perfectly ripe today. Creamy, buttery flesh ideal for toast, salads, or guacamole. High in heart-healthy monounsaturated fats, potassium, and vitamins E, K, and B-complex.",
    location: { x: 12, y: 44, aisle: "E2", row: 2 }
  },
  {
    id: "57",
    name: "Mixed Cherry Tomatoes 500g",
    price: 2.19,
    category: "Produce",
    image: "https://images.unsplash.com/photo-1570543375343-63fe3d67761b?w=500&auto=format&fit=crop",
    description: "A vibrant punnet of vine-ripened red, yellow, and orange cherry tomatoes grown in sun-drenched Spanish greenhouses. Naturally sweet with a satisfying pop of acidity — exceptional raw in salads, roasted whole with olive oil, or scattered over homemade pizza.",
    location: { x: 10, y: 46, aisle: "E3", row: 3 }
  },
  {
    id: "58",
    name: "Tenderstem Broccoli 200g",
    price: 1.99,
    category: "Produce",
    image: "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=500&auto=format&fit=crop",
    description: "Tender, sweet Tenderstem spears with fully edible stems and florets requiring no trimming. Blanch for two minutes, stir-fry with garlic, or roast with parmesan and lemon. One of the most nutrient-dense vegetables available, loaded with vitamin C, folate, and fibre.",
    location: { x: 12, y: 46, aisle: "E3", row: 3 }
  },
  {
    id: "59",
    name: "Mixed Salad Leaves 150g",
    price: 1.49,
    category: "Produce",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop",
    description: "A seasonal blend of rocket, baby gem, radicchio, spinach, and mizuna, harvested at peak freshness and triple-washed for convenience. The peppery, slightly bitter notes balance beautifully with a lemon vinaigrette or a rich Caesar dressing.",
    location: { x: 10, y: 48, aisle: "E4", row: 4 }
  },
  {
    id: "60",
    name: "Organic Chantenay Carrots 1kg",
    price: 1.29,
    category: "Produce",
    image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500&auto=format&fit=crop",
    description: "Unwashed organic Chantenay carrots grown in mineral-rich Lincolnshire soil. Sweeter and more flavourful than conventional carrots — excellent raw with hummus, roasted with honey and thyme, or slow-cooked into a rich Moroccan tagine.",
    location: { x: 12, y: 48, aisle: "E4", row: 4 }
  },
  {
    id: "61",
    name: "Red Bell Peppers (3-pack)",
    price: 2.49,
    category: "Produce",
    image: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=500&auto=format&fit=crop",
    description: "Three large, crisp red bell peppers at peak ripeness — significantly sweeter than green peppers and three times richer in vitamin C than an orange. Excellent raw in dips, roasted into sandwiches, or charred over a flame for a deep smoky flavour.",
    location: { x: 10, y: 50, aisle: "E5", row: 5 }
  },
  {
    id: "62",
    name: "Blueberries 250g",
    price: 2.79,
    category: "Produce",
    image: "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=500&auto=format&fit=crop",
    description: "Plump, sweet-tart blueberries from Andalusia, Spain. Among the most antioxidant-rich foods available — brilliant stirred into overnight oats, scattered onto yoghurt, folded into muffin batter, or eaten straight from the punnet.",
    location: { x: 12, y: 50, aisle: "E5", row: 5 }
  },
  {
    id: "63",
    name: "Garlic Bulbs (3-pack)",
    price: 0.99,
    category: "Produce",
    image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500&auto=format&fit=crop",
    description: "Three firm, dry-cured Spanish garlic bulbs with a robust flavour that mellows beautifully when roasted whole. A cornerstone of Mediterranean cooking and an essential base for sauces, stir-fries, aioli, and marinades. Store in a cool, dry place for up to four weeks.",
    location: { x: 10, y: 42, aisle: "E1", row: 1 }
  },
  {
    id: "64",
    name: "Sicilian Unwaxed Lemons (5-pack)",
    price: 1.19,
    category: "Produce",
    image: "https://images.unsplash.com/photo-1502741224143-90386d7f8c82?w=500&auto=format&fit=crop",
    description: "Naturally unwaxed lemons from sun-drenched Sicilian groves, sourced for both zest and juice. Their bright, floral acidity lifts salad dressings, marinades, and cocktails, while the fragrant zest adds depth to cakes, pasta, and cured fish. No chemical coatings.",
    location: { x: 12, y: 42, aisle: "E1", row: 1 }
  },

  // ─── BAKERY (Aisle F) ───────────────────────────────────────────────────────

  {
    id: "65",
    name: "Stone-Baked Sourdough Boule (800g)",
    price: 4.50,
    category: "Bakery",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop",
    description: "Baked in our in-store deck ovens every morning using 72-hour cold-fermented dough and a 15-year-old starter culture. A thick, crackling crust and open, glossy crumb with a gentle tang. Best enjoyed slightly warm with good salted butter.",
    location: { x: 34, y: 42, aisle: "F1", row: 1 }
  },
  {
    id: "66",
    name: "All-Butter Croissants (4-pack)",
    price: 3.79,
    category: "Bakery",
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop",
    description: "Laminated with 32 layers of French AOP butter using a traditional détrempe method over two days. Each croissant bakes to a deep amber exterior with a shattering crust and a soft, honeycomb interior. Reheat at 180°C for five minutes to restore oven-fresh perfection.",
    location: { x: 36, y: 42, aisle: "F1", row: 1 }
  },
  {
    id: "67",
    name: "Blueberry & Lemon Muffins (6-pack)",
    price: 3.29,
    category: "Bakery",
    image: "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=500&auto=format&fit=crop",
    description: "Generously domed muffins packed with whole British blueberries and brightened with fresh lemon zest. Made with free-range eggs and no artificial preservatives. The crisp sugar-crystal top gives way to a moist, cloud-like crumb. Perfect with morning coffee.",
    location: { x: 34, y: 44, aisle: "F2", row: 2 }
  },
  {
    id: "68",
    name: "Swedish Cinnamon Swirl Buns (4-pack)",
    price: 4.29,
    category: "Bakery",
    image: "https://images.unsplash.com/photo-1509365465985-25d11c17e812?w=500&auto=format&fit=crop",
    description: "Soft, pillowy enriched dough rolled with Vietnamese cinnamon, brown butter, and demerara sugar, then glazed with cream cheese frosting. Baked fresh each morning and best eaten warm. A Scandinavian-inspired bun with a devoted local following.",
    location: { x: 36, y: 44, aisle: "F2", row: 2 }
  },
  {
    id: "69",
    name: "Seeded Sourdough Baguette",
    price: 2.99,
    category: "Bakery",
    image: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=500&auto=format&fit=crop",
    description: "Long-fermented sourdough baguette rolled in sesame, poppy, linseeds, and sunflower seeds before baking. The scoring creates an airy, open crumb under a blistered, seeded crust. Outstanding alongside soups, cheese boards, and house-made pâtés.",
    location: { x: 34, y: 46, aisle: "F3", row: 3 }
  },
  {
    id: "70",
    name: "Belgian Chocolate Éclairs (4-pack)",
    price: 5.49,
    category: "Bakery",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop",
    description: "Delicate choux pastry filled with silky Madagascan vanilla crème pâtissière and glazed with a 70% Belgian dark chocolate ganache. Each éclair is assembled to order and best consumed the day of purchase for optimum pastry crispness.",
    location: { x: 36, y: 46, aisle: "F3", row: 3 }
  },
  {
    id: "71",
    name: "Banana & Walnut Loaf",
    price: 4.99,
    category: "Bakery",
    image: "https://images.unsplash.com/photo-1639399517920-10ee1cf4fd31?w=500&auto=format&fit=crop",
    description: "Made with extra-ripe Fairtrade bananas for maximum natural sweetness, folded with toasted California walnuts and a hint of cinnamon. Dense, moist, and perfectly sliceable. Contains no refined sugar — sweetened entirely with date syrup. Exceptional toasted with salted butter.",
    location: { x: 34, y: 48, aisle: "F4", row: 4 }
  },
  {
    id: "72",
    name: "Rosemary & Sea Salt Focaccia",
    price: 3.49,
    category: "Bakery",
    image: "https://images.unsplash.com/photo-1574085733277-851d9d856a3a?w=500&auto=format&fit=crop",
    description: "Baked in our deck ovens with a cold-prove dough generously drizzled with Sicilian extra-virgin olive oil and topped with fresh rosemary and Maldon sea salt. Dimpled throughout for maximum crunch-to-chew. Ideal as a starter or sandwich base.",
    location: { x: 36, y: 48, aisle: "F4", row: 4 }
  },
  {
    id: "73",
    name: "Almond Frangipane Croissant",
    price: 3.29,
    category: "Bakery",
    image: "https://images.unsplash.com/photo-1486887396153-fa416526c108?w=500&auto=format&fit=crop",
    description: "A day-old croissant soaked in rum syrup, filled with smooth almond frangipane, and topped with flaked almonds before a second bake. Richly caramelised on the outside and custardy within. Perhaps the finest transformation a croissant can undergo.",
    location: { x: 34, y: 50, aisle: "F5", row: 5 }
  },
  {
    id: "74",
    name: "Triple Chocolate Brownies (6-pack)",
    price: 4.99,
    category: "Bakery",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop",
    description: "Dense, fudgy brownies made with Valrhona 66% dark chocolate and studded with milk and white chocolate chunks. Baked in small batches for a shiny, crinkled top and a gooey, molten centre. Cut into generous squares and individually wrapped for freshness.",
    location: { x: 36, y: 50, aisle: "F5", row: 5 }
  },
  {
    id: "75",
    name: "Three-Layer Carrot Cake (slice)",
    price: 3.79,
    category: "Bakery",
    image: "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=500&auto=format&fit=crop",
    description: "A generous slice of three-layer carrot cake made with freshly grated carrots, crushed pineapple, toasted pecans, and warming spices. Sandwiched and topped with a tangy cream cheese frosting. Perfectly balanced between sweet and sharp. A bakery bestseller every day.",
    location: { x: 34, y: 42, aisle: "F1", row: 1 }
  },
  {
    id: "76",
    name: "Rye & Seed Sandwich Loaf",
    price: 3.99,
    category: "Bakery",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop",
    description: "A Scandinavian-style rye bread enriched with pumpkin seeds, sunflower seeds, and linseeds. The dense crumb holds its structure beautifully for sandwiches and delivers a complex, slightly sour, nutty flavour. High in fibre and slow-release carbohydrates.",
    location: { x: 36, y: 42, aisle: "F1", row: 1 }
  },

  // ─── DAIRY & CHILLED (Aisle G) ──────────────────────────────────────────────

  {
    id: "77",
    name: "Organic Whole Milk 2L",
    price: 2.39,
    category: "Dairy & Chilled",
    image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500&auto=format&fit=crop",
    description: "From a Somerset cooperative of Organic Farmers & Growers certified farms where cows are pasture-grazed for at least 180 days per year. The unhomogenised whole milk retains a natural cream line and a rich, full flavour. Non-UHT and delivered fresh six days a week.",
    location: { x: 58, y: 42, aisle: "G1", row: 1 }
  },
  {
    id: "78",
    name: "Fage Total 0% Greek Yogurt 500g",
    price: 2.79,
    category: "Dairy & Chilled",
    image: "https://images.unsplash.com/photo-1755752916226-5ccb712e6596?w=500&auto=format&fit=crop",
    description: "The genuine article from Athens: strained through fine cheesecloth to produce a thick, creamy, protein-dense yoghurt with a clean, refreshing tang. 10g of protein per 100g with no added sugar or thickeners. Exceptional with honey and walnuts or as a base for tzatziki.",
    location: { x: 60, y: 42, aisle: "G1", row: 1 }
  },
  {
    id: "79",
    name: "Montgomery's Cheddar 350g",
    price: 6.99,
    category: "Dairy & Chilled",
    image: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=500&auto=format&fit=crop",
    description: "Handmade at Manor Farm in Somerset using raw cow's milk and animal rennet, aged for a minimum of 12 months in cloth binding. The result is complex and crystalline with a sharp, lingering finish and a savoury depth that supermarket cheddar simply cannot replicate.",
    location: { x: 58, y: 44, aisle: "G2", row: 2 }
  },
  {
    id: "80",
    name: "Burford Brown Free-Range Eggs (12)",
    price: 3.99,
    category: "Dairy & Chilled",
    image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=500&auto=format&fit=crop",
    description: "Laid by Burford Brown hens with access to outdoor pasture year-round. Renowned for their deep amber yolks and rich, creamy flavour — elevating everything from scrambled eggs to hollandaise and crème caramel. Welfare assured and Soil Association approved.",
    location: { x: 60, y: 44, aisle: "G2", row: 2 }
  },
  {
    id: "81",
    name: "Netherend Farm Salted Butter 250g",
    price: 2.49,
    category: "Dairy & Chilled",
    image: "https://images.unsplash.com/photo-1558642891-54be180ea339?w=500&auto=format&fit=crop",
    description: "Slow-churned from cultured Gloucestershire cream with Maldon sea salt folded in at the end. This butter has a clean lactic tang and richness that commercial brands cannot replicate. Exceptional spread on good bread, used to finish a sauce, or melted over asparagus.",
    location: { x: 58, y: 46, aisle: "G3", row: 3 }
  },
  {
    id: "82",
    name: "Laverstoke Park Buffalo Mozzarella 125g",
    price: 2.99,
    category: "Dairy & Chilled",
    image: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=500&auto=format&fit=crop",
    description: "Hand-stretched mozzarella from the biodynamic buffalo herd at Laverstoke Park Farm in Hampshire. Sold in whey for freshness, with a milky, creamy flavour and a delicate, springy texture. Outstanding on a caprese salad with heritage tomatoes and fresh basil.",
    location: { x: 60, y: 46, aisle: "G3", row: 3 }
  },
  {
    id: "83",
    name: "Loch Fyne Smoked Salmon 200g",
    price: 6.49,
    category: "Dairy & Chilled",
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500&auto=format&fit=crop",
    description: "Atlantic salmon slow-smoked over oak chips using a traditional Scottish cold-smoking method perfected over 40 years. The silky, hand-sliced fillets have a gentle smokiness that never overwhelms the clean flavour of the fish. Fully traceable from sea to shelf.",
    location: { x: 58, y: 48, aisle: "G4", row: 4 }
  },
  {
    id: "84",
    name: "Freshly Squeezed Orange Juice 1L",
    price: 3.29,
    category: "Dairy & Chilled",
    image: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=500&auto=format&fit=crop",
    description: "Squeezed from hand-picked Valencia and Navel oranges within 24 hours of harvest. No concentrates, no added sugar, and no high-temperature pasteurisation. A vivid, fresh flavour far closer to squeezing your own. Refrigerate and consume within 5 days of opening.",
    location: { x: 60, y: 48, aisle: "G4", row: 4 }
  },
  {
    id: "85",
    name: "Oatly Barista Edition Oat Drink 1L",
    price: 1.99,
    category: "Dairy & Chilled",
    image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop",
    description: "Engineered for frothing and steaming, Oatly Barista uses a unique enzyme process to produce a creamy, stable foam indistinguishable from dairy in a flat white or cappuccino. Contains added B12 and D2. The choice of leading independent coffee shops worldwide.",
    location: { x: 58, y: 50, aisle: "G5", row: 5 }
  },
  {
    id: "86",
    name: "Baron Bigod Raw Milk Brie (250g)",
    price: 8.99,
    category: "Dairy & Chilled",
    image: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=500&auto=format&fit=crop",
    description: "The only traditional raw-milk Brie made in England, handmade by Jonny Crickmore at Fen Farm in Suffolk. The velvet white rind conceals a golden, oozing interior with complex, mushroomy, grassy flavours. Serve at room temperature and let it flow like liquid gold.",
    location: { x: 60, y: 50, aisle: "G5", row: 5 }
  },
  {
    id: "87",
    name: "Yeo Valley Organic Natural Yogurt 450g",
    price: 1.89,
    category: "Dairy & Chilled",
    image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500&auto=format&fit=crop",
    description: "Made from milk produced on Yeo Valley's own organic Somerset farms where cows graze on herb-rich pasture. Live cultures and slow fermentation create a smooth, gently tangy yoghurt with a thick, set texture and no added thickeners or sweeteners.",
    location: { x: 58, y: 42, aisle: "G1", row: 1 }
  },
  {
    id: "88",
    name: "Rodda's Cornish Clotted Cream 227g",
    price: 2.49,
    category: "Dairy & Chilled",
    image: "https://images.unsplash.com/photo-1558642891-54be180ea339?w=500&auto=format&fit=crop",
    description: "A classic Cornish clotted cream made by slow-heating full-cream milk until a rich golden crust forms. At 55% fat, it has a thick, spoonable consistency and an indulgent, sweet flavour. The only accompaniment for a proper cream tea scone. Protected Geographical Indication.",
    location: { x: 60, y: 42, aisle: "G1", row: 1 }
  },

  // ─── PHARMACY (Aisle H) ─────────────────────────────────────────────────────

  {
    id: "89",
    name: "Vitamin C 1000mg with Rosehip (90 tabs)",
    price: 12.99,
    category: "Pharmacy",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop",
    description: "High-potency vitamin C formulated with natural rosehip extract providing bioflavonoids to enhance absorption. Supports immune function, collagen formation, and reduces oxidative stress. Timed-release formula for steady delivery throughout the day. Vegan, gluten-free, and free from artificial colours.",
    location: { x: 82, y: 42, aisle: "H1", row: 1 }
  },
  {
    id: "90",
    name: "Ibuprofen 400mg (24 tablets)",
    price: 4.99,
    category: "Pharmacy",
    image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=500&auto=format&fit=crop",
    description: "Film-coated ibuprofen 400mg tablets providing fast, targeted relief for headaches, dental pain, period pain, back pain, and fever. Starts working within 30 minutes and provides up to 6 hours of relief. Suitable for adults and children over 12. Always read the leaflet.",
    location: { x: 84, y: 42, aisle: "H1", row: 1 }
  },
  {
    id: "91",
    name: "Centrum Advance Multivitamin (60 tabs)",
    price: 9.99,
    category: "Pharmacy",
    image: "https://images.unsplash.com/photo-1640958898466-b4dd00872fc8?w=500&auto=format&fit=crop",
    description: "A complete daily multivitamin containing 24 micronutrients including vitamins A, C, D, E, K, B-complex, zinc, selenium, and magnesium. Formulated to fill the nutritional gaps in modern diets. One tablet per day with food. Suitable for adults over 18.",
    location: { x: 82, y: 44, aisle: "H2", row: 2 }
  },
  {
    id: "92",
    name: "La Roche-Posay SPF 50+ Sunscreen 100ml",
    price: 19.99,
    category: "Pharmacy",
    image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=500&auto=format&fit=crop",
    description: "Dermatologist-recommended broad-spectrum SPF 50+ sunscreen designed for sensitive skin. The ultra-light, non-greasy formula absorbs instantly and contains the Anthelios XL advanced filter system. Water-resistant for 80 minutes. Fragrance-free and paraben-free.",
    location: { x: 84, y: 44, aisle: "H2", row: 2 }
  },
  {
    id: "93",
    name: "Braun ThermoScan 7 Ear Thermometer",
    price: 59.99,
    category: "Pharmacy",
    image: "https://images.unsplash.com/photo-1576671081837-49000212a370?w=500&auto=format&fit=crop",
    description: "The world's #1 doctor-recommended home thermometer. Pre-Warmed Tip technology ensures clinically accurate readings in two seconds. The Age Precision feature adjusts normal temperature ranges for infants, children, and adults. Includes 21 single-use lens filters.",
    location: { x: 82, y: 46, aisle: "H3", row: 3 }
  },
  {
    id: "94",
    name: "Omron M3 Blood Pressure Monitor",
    price: 44.99,
    category: "Pharmacy",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop",
    description: "A clinically validated upper-arm blood pressure monitor storing up to 60 readings with date and time for two users. The Comfort Cuff reduces inflation discomfort. The Irregular Heartbeat Detection feature flags readings that indicate irregular cardiac rhythm for GP review.",
    location: { x: 84, y: 46, aisle: "H3", row: 3 }
  },
  {
    id: "95",
    name: "Omega-3 Fish Oil 1000mg (90 caps)",
    price: 11.99,
    category: "Pharmacy",
    image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=500&auto=format&fit=crop",
    description: "High-purity omega-3 from sustainably sourced anchovies and sardines, providing 300mg of combined EPA and DHA per capsule. Supports cardiovascular health, brain function, and joint mobility. Molecularly distilled to remove heavy metals. Enteric-coated to prevent fish aftertaste.",
    location: { x: 82, y: 48, aisle: "H4", row: 4 }
  },
  {
    id: "96",
    name: "Cetirizine Hayfever Relief 10mg (30 tabs)",
    price: 3.99,
    category: "Pharmacy",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop",
    description: "24-hour non-drowsy antihistamine containing cetirizine hydrochloride 10mg for fast relief from hayfever, pet allergies, dust mite allergy, and urticaria. Relieves sneezing, runny nose, itchy eyes, and skin reactions. One tablet daily. Clinically proven. Suitable from age 6.",
    location: { x: 84, y: 48, aisle: "H4", row: 4 }
  },
  {
    id: "97",
    name: "CeraVe Moisturising Lotion 473ml",
    price: 14.99,
    category: "Pharmacy",
    image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=500&auto=format&fit=crop",
    description: "Developed with dermatologists, this lightweight daily moisturiser contains three essential ceramides to restore and maintain the skin's protective barrier. Hyaluronic acid draws moisture in while MVE technology releases it gradually. Fragrance-free, non-comedogenic, and safe for sensitive skin.",
    location: { x: 82, y: 50, aisle: "H5", row: 5 }
  },
  {
    id: "98",
    name: "Solgar Melatonin Sleep Aid 1mg (60 tabs)",
    price: 8.99,
    category: "Pharmacy",
    image: "https://images.unsplash.com/photo-1574043948184-144f2ef80fe3?w=500&auto=format&fit=crop",
    description: "A low-dose 1mg melatonin supplement to support natural sleep onset — particularly useful for jet lag and shift work. The slow-dissolve sublingual tablet format allows faster absorption than standard tablets. Vegan, kosher, and free from gluten, wheat, and dairy.",
    location: { x: 84, y: 50, aisle: "H5", row: 5 }
  },
  {
    id: "99",
    name: "Garden of Life Raw Probiotic (30 caps)",
    price: 24.99,
    category: "Pharmacy",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop",
    description: "100 billion CFU and 34 probiotic strains including Lactobacillus acidophilus and Bifidobacterium lactis, preserved in RAW whole-food nutrients for superior potency. Supports gut microbiome health and immune function. Refrigerate after opening. Suitable for vegetarians.",
    location: { x: 82, y: 42, aisle: "H1", row: 1 }
  },
  {
    id: "100",
    name: "70% IPA Hand Sanitiser Pump 500ml",
    price: 4.49,
    category: "Pharmacy",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop",
    description: "A 70% isopropyl alcohol gel that kills 99.9% of bacteria and most viruses in 30 seconds without soap or water. The added moisturiser complex with aloe vera and vitamin E prevents the dryness associated with repeated use. Pump dispenser for easy one-handed application.",
    location: { x: 84, y: 42, aisle: "H1", row: 1 }
  },
  {
    id: "101",
    name: "Voltarol 1.16% Diclofenac Pain Relief Gel 100g",
    price: 8.99,
    category: "Pharmacy",
    image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=500&auto=format&fit=crop",
    description: "An anti-inflammatory gel containing diclofenac sodium that targets pain at the source. Applied directly over muscles and joints, it reduces pain from sports injuries, arthritis, and back pain without the gastrointestinal side effects of oral NSAIDs. Fast-absorbing and non-greasy.",
    location: { x: 82, y: 44, aisle: "H2", row: 2 }
  },
  {
    id: "102",
    name: "Floradix Liquid Iron Formula 500ml",
    price: 16.99,
    category: "Pharmacy",
    image: "https://images.unsplash.com/photo-1621958180351-126bb5062e57?w=500&auto=format&fit=crop",
    description: "A liquid iron supplement with easily absorbed ferrous gluconate combined with vitamins B2, B6, B12, and C to support red blood cell formation and reduce tiredness and fatigue. A pleasant, fruity flavour with no alcohol, artificial preservatives, or colourings. Suitable for vegetarians.",
    location: { x: 84, y: 44, aisle: "H2", row: 2 }
  }
];

/**
 * Interleaves products across categories in a round-robin fashion.
 * e.g. [Electronics, Clothing, Sports, Electronics, Clothing, Sports, ...]
 * This ensures mixed-category display rather than grouped-by-category ordering.
 */
function interleaveByCategory(products: Product[]): Product[] {
  const buckets = new Map<string, Product[]>();

  for (const product of products) {
    if (!buckets.has(product.category)) {
      buckets.set(product.category, []);
    }
    buckets.get(product.category)!.push(product);
  }

  const queues = Array.from(buckets.values());
  const result: Product[] = [];

  let i = 0;
  while (result.length < products.length) {
    const queue = queues[i % queues.length];
    if (queue.length > 0) {
      result.push(queue.shift()!);
    }
    i++;
    // Once all queues are exhausted, stop
    if (queues.every(q => q.length === 0)) break;
  }

  return result;
}

const INIT_DB: Database = {
  products: interleaveByCategory(DEFAULT_PRODUCTS),
  sessions: {},
  alerts: []
};

const DB_PATH = path.join(process.cwd(), 'db.json');

let memoryDb: Database = structuredClone(INIT_DB);

const useFileDb = process.env.NODE_ENV !== 'production';

async function ensureFileDb() {
  if (!fs.existsSync(DB_PATH)) {
    await fs.promises.writeFile(DB_PATH, JSON.stringify(INIT_DB, null, 2));
  }
}

export async function getDb(): Promise<Database> {
  if (useFileDb) {
    await ensureFileDb();
    const data = await fs.promises.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
  }

  return memoryDb;
}

export async function saveDb(db: Database): Promise<void> {
  if (useFileDb) {
    await fs.promises.writeFile(DB_PATH, JSON.stringify(db, null, 2));
    return;
  }

  memoryDb = db;
}
