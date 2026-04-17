import path from 'path';
import fs from 'fs';

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
  location: { x: number; y: number; aisle: string };
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

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Nike Air Zoom Pegasus',
    price: 120,
    category: 'Shoes',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
    description: 'Responsive training shoes for running.',
    location: { x: 20, y: 30, aisle: 'A1' }
  },
  {
    id: '2',
    name: 'Under Armour Sport T-Shirt',
    price: 25,
    category: 'Apparel',
    image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500',
    description: 'Breathable activewear shirt.',
    location: { x: 50, y: 70, aisle: 'A3' }
  },
  {
    id: '3',
    name: 'Apple Watch Series 9',
    price: 399,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1434493789847-2f02b0c1664e?w=500',
    description: 'Advanced health and fitness tracking.',
    location: { x: 80, y: 20, aisle: 'E1' }
  },
  {
    id: '4',
    name: 'Yeti Rambler 20oz Tumbler',
    price: 35,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500',
    description: 'Keeps drinks hot or cold for hours.',
    location: { x: 40, y: 80, aisle: 'A2' }
  }
];

const INIT_DB: Database = {
  products: DEFAULT_PRODUCTS,
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
