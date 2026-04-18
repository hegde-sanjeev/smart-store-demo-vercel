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

const DEFAULT_PRODUCTS: Product[] = [
    {
      "id": "1",
      "name": "Nike Air Zoom Pegasus",
      "price": 120,
      "category": "Shoes",
      "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
      "description": "Responsive training shoes for running.",
      "location": {
        "x": 20,
        "y": 30,
        "aisle": "A1"
      }
    },
    {
      "id": "2",
      "name": "Under Armour Sport T-Shirt",
      "price": 25,
      "category": "Apparel",
      "image": "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500",
      "description": "Breathable activewear shirt.",
      "location": {
        "x": 50,
        "y": 70,
        "aisle": "A3"
      }
    },
    {
      "id": "3",
      "name": "Apple Watch Series 9",
      "price": 399,
      "category": "Electronics",
      "image": "https://images.unsplash.com/photo-1434493789847-2f02b0c1664e?w=500",
      "description": "Advanced health and fitness tracking.",
      "location": {
        "x": 80,
        "y": 20,
        "aisle": "E1"
      }
    },
    {
      "id": "4",
      "name": "Yeti Rambler 20oz Tumbler",
      "price": 35,
      "category": "Accessories",
      "image": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500",
      "description": "Keeps drinks hot or cold for hours.",
      "location": {
        "x": 40,
        "y": 80,
        "aisle": "A2"
      }
    },
    {
      "id": "5",
      "name": "Bose Heart Rate Monitor",
      "price": 268,
      "category": "Electronics",
      "image": "https://images.unsplash.com/photo-1434493789847-2f02b0c1664e?w=500",
      "description": "Engineered for the elite athlete. Experience the best in electronics.",
      "location": {
        "x": 53,
        "y": 39,
        "aisle": "A3"
      }
    },
    {
      "id": "6",
      "name": "Gatorade Tumbler",
      "price": 26,
      "category": "Accessories",
      "image": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500",
      "description": "Stay cool and dry all day long. Experience the best in accessories.",
      "location": {
        "x": 59,
        "y": 38,
        "aisle": "E3"
      }
    },
    {
      "id": "7",
      "name": "Oakley Cap",
      "price": 28,
      "category": "Accessories",
      "image": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500",
      "description": "Stay cool and dry all day long. Experience the best in accessories.",
      "location": {
        "x": 46,
        "y": 7,
        "aisle": "B1"
      }
    },
    {
      "id": "8",
      "name": "Lululemon Leggings",
      "price": 56,
      "category": "Apparel",
      "image": "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500",
      "description": "Sleek design with advanced technology. Experience the best in apparel.",
      "location": {
        "x": 66,
        "y": 18,
        "aisle": "C2"
      }
    },
    {
      "id": "9",
      "name": "Asics Walking Shoes",
      "price": 112,
      "category": "Shoes",
      "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
      "description": "Built to withstand the toughest workouts. Experience the best in shoes.",
      "location": {
        "x": 43,
        "y": 56,
        "aisle": "E2"
      }
    },
    {
      "id": "10",
      "name": "Garmin Fitness Tracker",
      "price": 55,
      "category": "Electronics",
      "image": "https://images.unsplash.com/photo-1434493789847-2f02b0c1664e?w=500",
      "description": "Built to withstand the toughest workouts. Experience the best in electronics.",
      "location": {
        "x": 73,
        "y": 88,
        "aisle": "D4"
      }
    },
    {
      "id": "11",
      "name": "Sony Portable Speaker",
      "price": 306,
      "category": "Electronics",
      "image": "https://images.unsplash.com/photo-1434493789847-2f02b0c1664e?w=500",
      "description": "Designed for ultimate comfort and durability. Experience the best in electronics.",
      "location": {
        "x": 36,
        "y": 50,
        "aisle": "B3"
      }
    },
    {
      "id": "12",
      "name": "Apple Headphones",
      "price": 93,
      "category": "Electronics",
      "image": "https://images.unsplash.com/photo-1434493789847-2f02b0c1664e?w=500",
      "description": "Designed for ultimate comfort and durability. Experience the best in electronics.",
      "location": {
        "x": 67,
        "y": 26,
        "aisle": "E2"
      }
    },
    {
      "id": "13",
      "name": "Nike Trail Runners",
      "price": 107,
      "category": "Shoes",
      "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
      "description": "Stay cool and dry all day long. Experience the best in shoes.",
      "location": {
        "x": 45,
        "y": 67,
        "aisle": "D2"
      }
    },
    {
      "id": "14",
      "name": "JBL Headphones",
      "price": 86,
      "category": "Electronics",
      "image": "https://images.unsplash.com/photo-1434493789847-2f02b0c1664e?w=500",
      "description": "Engineered for the elite athlete. Experience the best in electronics.",
      "location": {
        "x": 82,
        "y": 64,
        "aisle": "D5"
      }
    },
    {
      "id": "15",
      "name": "Reebok Trail Runners",
      "price": 44,
      "category": "Shoes",
      "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
      "description": "Perfect for your everyday competitive needs. Experience the best in shoes.",
      "location": {
        "x": 21,
        "y": 58,
        "aisle": "A4"
      }
    },
    {
      "id": "16",
      "name": "HydroFlask Tumbler",
      "price": 52,
      "category": "Accessories",
      "image": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500",
      "description": "Built to withstand the toughest workouts. Experience the best in accessories.",
      "location": {
        "x": 87,
        "y": 35,
        "aisle": "C4"
      }
    },
    {
      "id": "17",
      "name": "Yeti Socks",
      "price": 79,
      "category": "Accessories",
      "image": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500",
      "description": "Designed for ultimate comfort and durability. Experience the best in accessories.",
      "location": {
        "x": 31,
        "y": 87,
        "aisle": "A5"
      }
    },
    {
      "id": "18",
      "name": "Garmin Heart Rate Monitor",
      "price": 51,
      "category": "Electronics",
      "image": "https://images.unsplash.com/photo-1434493789847-2f02b0c1664e?w=500",
      "description": "Perfect for your everyday competitive needs. Experience the best in electronics.",
      "location": {
        "x": 46,
        "y": 94,
        "aisle": "C3"
      }
    },
    {
      "id": "19",
      "name": "Nike Shorts",
      "price": 107,
      "category": "Apparel",
      "image": "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500",
      "description": "Perfect for your everyday competitive needs. Experience the best in apparel.",
      "location": {
        "x": 54,
        "y": 8,
        "aisle": "C3"
      }
    },
    {
      "id": "20",
      "name": "Apple Fitness Tracker",
      "price": 243,
      "category": "Electronics",
      "image": "https://images.unsplash.com/photo-1434493789847-2f02b0c1664e?w=500",
      "description": "Sleek design with advanced technology. Experience the best in electronics.",
      "location": {
        "x": 50,
        "y": 23,
        "aisle": "E2"
      }
    },
    {
      "id": "21",
      "name": "Patagonia Hoodie",
      "price": 82,
      "category": "Apparel",
      "image": "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500",
      "description": "Lightweight and highly responsive. Experience the best in apparel.",
      "location": {
        "x": 76,
        "y": 32,
        "aisle": "C2"
      }
    },
    {
      "id": "22",
      "name": "HydroFlask Yoga Mat",
      "price": 93,
      "category": "Accessories",
      "image": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500",
      "description": "Sleek design with advanced technology. Experience the best in accessories.",
      "location": {
        "x": 72,
        "y": 56,
        "aisle": "C1"
      }
    },
    {
      "id": "23",
      "name": "The North Face Leggings",
      "price": 108,
      "category": "Apparel",
      "image": "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500",
      "description": "Premium quality and high performance. Experience the best in apparel.",
      "location": {
        "x": 65,
        "y": 64,
        "aisle": "B1"
      }
    },
    {
      "id": "24",
      "name": "New Balance Trail Runners",
      "price": 59,
      "category": "Shoes",
      "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
      "description": "Lightweight and highly responsive. Experience the best in shoes.",
      "location": {
        "x": 17,
        "y": 74,
        "aisle": "D1"
      }
    },
    {
      "id": "25",
      "name": "Columbia Hoodie",
      "price": 20,
      "category": "Apparel",
      "image": "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500",
      "description": "Sleek design with advanced technology. Experience the best in apparel.",
      "location": {
        "x": 91,
        "y": 83,
        "aisle": "C4"
      }
    },
    {
      "id": "26",
      "name": "Brooks Lifestyle Sneakers",
      "price": 34,
      "category": "Shoes",
      "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
      "description": "Stay cool and dry all day long. Experience the best in shoes.",
      "location": {
        "x": 22,
        "y": 84,
        "aisle": "A2"
      }
    },
    {
      "id": "27",
      "name": "New Balance Walking Shoes",
      "price": 92,
      "category": "Shoes",
      "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
      "description": "Built to withstand the toughest workouts. Experience the best in shoes.",
      "location": {
        "x": 46,
        "y": 38,
        "aisle": "A4"
      }
    },
    {
      "id": "28",
      "name": "Nike Tank Top",
      "price": 21,
      "category": "Apparel",
      "image": "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500",
      "description": "Lightweight and highly responsive. Experience the best in apparel.",
      "location": {
        "x": 16,
        "y": 65,
        "aisle": "D5"
      }
    },
    {
      "id": "29",
      "name": "Bose Earbuds",
      "price": 53,
      "category": "Electronics",
      "image": "https://images.unsplash.com/photo-1434493789847-2f02b0c1664e?w=500",
      "description": "Lightweight and highly responsive. Experience the best in electronics.",
      "location": {
        "x": 7,
        "y": 24,
        "aisle": "C3"
      }
    },
    {
      "id": "30",
      "name": "Nike Running Shoes",
      "price": 106,
      "category": "Shoes",
      "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
      "description": "Stay cool and dry all day long. Experience the best in shoes.",
      "location": {
        "x": 22,
        "y": 26,
        "aisle": "E4"
      }
    },
    {
      "id": "31",
      "name": "Oakley Socks",
      "price": 93,
      "category": "Accessories",
      "image": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500",
      "description": "Perfect for your everyday competitive needs. Experience the best in accessories.",
      "location": {
        "x": 75,
        "y": 45,
        "aisle": "E4"
      }
    },
    {
      "id": "32",
      "name": "Gymshark Leggings",
      "price": 41,
      "category": "Apparel",
      "image": "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500",
      "description": "Designed for ultimate comfort and durability. Experience the best in apparel.",
      "location": {
        "x": 67,
        "y": 85,
        "aisle": "D2"
      }
    },
    {
      "id": "33",
      "name": "JBL Portable Speaker",
      "price": 309,
      "category": "Electronics",
      "image": "https://images.unsplash.com/photo-1434493789847-2f02b0c1664e?w=500",
      "description": "Perfect for your everyday competitive needs. Experience the best in electronics.",
      "location": {
        "x": 22,
        "y": 41,
        "aisle": "E5"
      }
    },
    {
      "id": "34",
      "name": "Asics Training Shoes",
      "price": 63,
      "category": "Shoes",
      "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
      "description": "Sleek design with advanced technology. Experience the best in shoes.",
      "location": {
        "x": 83,
        "y": 27,
        "aisle": "E4"
      }
    },
    {
      "id": "35",
      "name": "Under Armour Tank Top",
      "price": 76,
      "category": "Apparel",
      "image": "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500",
      "description": "Designed for ultimate comfort and durability. Experience the best in apparel.",
      "location": {
        "x": 12,
        "y": 94,
        "aisle": "E5"
      }
    },
    {
      "id": "36",
      "name": "CamelBak Sunglasses",
      "price": 31,
      "category": "Accessories",
      "image": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500",
      "description": "Engineered for the elite athlete. Experience the best in accessories.",
      "location": {
        "x": 69,
        "y": 8,
        "aisle": "D3"
      }
    },
    {
      "id": "37",
      "name": "Beats Smartwatch",
      "price": 70,
      "category": "Electronics",
      "image": "https://images.unsplash.com/photo-1434493789847-2f02b0c1664e?w=500",
      "description": "Built to withstand the toughest workouts. Experience the best in electronics.",
      "location": {
        "x": 38,
        "y": 20,
        "aisle": "B3"
      }
    },
    {
      "id": "38",
      "name": "Nike Gym Bag",
      "price": 60,
      "category": "Accessories",
      "image": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500",
      "description": "Engineered for the elite athlete. Experience the best in accessories.",
      "location": {
        "x": 21,
        "y": 25,
        "aisle": "A4"
      }
    },
    {
      "id": "39",
      "name": "Champion Sweatpants",
      "price": 103,
      "category": "Apparel",
      "image": "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500",
      "description": "Stay cool and dry all day long. Experience the best in apparel.",
      "location": {
        "x": 26,
        "y": 39,
        "aisle": "C1"
      }
    },
    {
      "id": "40",
      "name": "Patagonia Jacket",
      "price": 84,
      "category": "Apparel",
      "image": "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500",
      "description": "Designed for ultimate comfort and durability. Experience the best in apparel.",
      "location": {
        "x": 30,
        "y": 86,
        "aisle": "E1"
      }
    },
    {
      "id": "41",
      "name": "Fitbit Heart Rate Monitor",
      "price": 178,
      "category": "Electronics",
      "image": "https://images.unsplash.com/photo-1434493789847-2f02b0c1664e?w=500",
      "description": "Sleek design with advanced technology. Experience the best in electronics.",
      "location": {
        "x": 44,
        "y": 82,
        "aisle": "E3"
      }
    },
    {
      "id": "42",
      "name": "Under Armour Leggings",
      "price": 48,
      "category": "Apparel",
      "image": "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500",
      "description": "Perfect for your everyday competitive needs. Experience the best in apparel.",
      "location": {
        "x": 94,
        "y": 76,
        "aisle": "D5"
      }
    },
    {
      "id": "43",
      "name": "The North Face Tank Top",
      "price": 30,
      "category": "Apparel",
      "image": "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500",
      "description": "Stay cool and dry all day long. Experience the best in apparel.",
      "location": {
        "x": 75,
        "y": 16,
        "aisle": "E4"
      }
    },
    {
      "id": "44",
      "name": "Gatorade Water Bottle",
      "price": 84,
      "category": "Accessories",
      "image": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500",
      "description": "Stay cool and dry all day long. Experience the best in accessories.",
      "location": {
        "x": 86,
        "y": 94,
        "aisle": "E4"
      }
    },
    {
      "id": "45",
      "name": "Nike Cleats",
      "price": 115,
      "category": "Shoes",
      "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
      "description": "Premium quality and high performance. Experience the best in shoes.",
      "location": {
        "x": 67,
        "y": 54,
        "aisle": "C3"
      }
    },
    {
      "id": "46",
      "name": "Puma Cleats",
      "price": 21,
      "category": "Shoes",
      "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
      "description": "Sleek design with advanced technology. Experience the best in shoes.",
      "location": {
        "x": 62,
        "y": 49,
        "aisle": "D4"
      }
    },
    {
      "id": "47",
      "name": "Under Armour Lifestyle Sneakers",
      "price": 88,
      "category": "Shoes",
      "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
      "description": "Built to withstand the toughest workouts. Experience the best in shoes.",
      "location": {
        "x": 7,
        "y": 9,
        "aisle": "E5"
      }
    },
    {
      "id": "48",
      "name": "Nike Tank Top",
      "price": 31,
      "category": "Apparel",
      "image": "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500",
      "description": "Premium quality and high performance. Experience the best in apparel.",
      "location": {
        "x": 80,
        "y": 28,
        "aisle": "A1"
      }
    },
    {
      "id": "49",
      "name": "Champion Sweatpants",
      "price": 70,
      "category": "Apparel",
      "image": "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500",
      "description": "Sleek design with advanced technology. Experience the best in apparel.",
      "location": {
        "x": 74,
        "y": 30,
        "aisle": "C3"
      }
    },
    {
      "id": "50",
      "name": "Nike Cleats",
      "price": 77,
      "category": "Shoes",
      "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
      "description": "Sleek design with advanced technology. Experience the best in shoes.",
      "location": {
        "x": 61,
        "y": 45,
        "aisle": "B4"
      }
    },
    {
      "id": "51",
      "name": "Adidas Lifestyle Sneakers",
      "price": 78,
      "category": "Shoes",
      "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
      "description": "Built to withstand the toughest workouts. Experience the best in shoes.",
      "location": {
        "x": 17,
        "y": 75,
        "aisle": "B5"
      }
    },
    {
      "id": "52",
      "name": "HydroFlask Cap",
      "price": 63,
      "category": "Accessories",
      "image": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500",
      "description": "Lightweight and highly responsive. Experience the best in accessories.",
      "location": {
        "x": 71,
        "y": 39,
        "aisle": "A3"
      }
    },
    {
      "id": "53",
      "name": "Under Armour Cleats",
      "price": 84,
      "category": "Shoes",
      "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
      "description": "Built to withstand the toughest workouts. Experience the best in shoes.",
      "location": {
        "x": 89,
        "y": 43,
        "aisle": "E2"
      }
    },
    {
      "id": "54",
      "name": "Nike Training Shoes",
      "price": 37,
      "category": "Shoes",
      "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
      "description": "Lightweight and highly responsive. Experience the best in shoes.",
      "location": {
        "x": 13,
        "y": 74,
        "aisle": "C5"
      }
    },
    {
      "id": "55",
      "name": "Samsung Heart Rate Monitor",
      "price": 150,
      "category": "Electronics",
      "image": "https://images.unsplash.com/photo-1434493789847-2f02b0c1664e?w=500",
      "description": "Lightweight and highly responsive. Experience the best in electronics.",
      "location": {
        "x": 75,
        "y": 64,
        "aisle": "E1"
      }
    },
    {
      "id": "56",
      "name": "Nike Gym Bag",
      "price": 75,
      "category": "Accessories",
      "image": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500",
      "description": "Premium quality and high performance. Experience the best in accessories.",
      "location": {
        "x": 35,
        "y": 24,
        "aisle": "C2"
      }
    },
    {
      "id": "57",
      "name": "Under Armour Hoodie",
      "price": 101,
      "category": "Apparel",
      "image": "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500",
      "description": "Stay cool and dry all day long. Experience the best in apparel.",
      "location": {
        "x": 37,
        "y": 79,
        "aisle": "E4"
      }
    },
    {
      "id": "58",
      "name": "Apple Smartwatch",
      "price": 319,
      "category": "Electronics",
      "image": "https://images.unsplash.com/photo-1434493789847-2f02b0c1664e?w=500",
      "description": "Premium quality and high performance. Experience the best in electronics.",
      "location": {
        "x": 27,
        "y": 18,
        "aisle": "A3"
      }
    },
    {
      "id": "59",
      "name": "Columbia T-Shirt",
      "price": 30,
      "category": "Apparel",
      "image": "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500",
      "description": "Designed for ultimate comfort and durability. Experience the best in apparel.",
      "location": {
        "x": 6,
        "y": 81,
        "aisle": "C2"
      }
    },
    {
      "id": "60",
      "name": "Fitbit Heart Rate Monitor",
      "price": 265,
      "category": "Electronics",
      "image": "https://images.unsplash.com/photo-1434493789847-2f02b0c1664e?w=500",
      "description": "Premium quality and high performance. Experience the best in electronics.",
      "location": {
        "x": 60,
        "y": 10,
        "aisle": "C5"
      }
    },
    {
      "id": "61",
      "name": "JanSport Backpack",
      "price": 114,
      "category": "Accessories",
      "image": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500",
      "description": "Lightweight and highly responsive. Experience the best in accessories.",
      "location": {
        "x": 11,
        "y": 24,
        "aisle": "C3"
      }
    },
    {
      "id": "62",
      "name": "Brooks Basketball Sneakers",
      "price": 73,
      "category": "Shoes",
      "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
      "description": "Built to withstand the toughest workouts. Experience the best in shoes.",
      "location": {
        "x": 61,
        "y": 29,
        "aisle": "E1"
      }
    },
    {
      "id": "63",
      "name": "Under Armour Running Shoes",
      "price": 64,
      "category": "Shoes",
      "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
      "description": "Premium quality and high performance. Experience the best in shoes.",
      "location": {
        "x": 70,
        "y": 45,
        "aisle": "E3"
      }
    },
    {
      "id": "64",
      "name": "Under Armour T-Shirt",
      "price": 53,
      "category": "Apparel",
      "image": "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500",
      "description": "Stay cool and dry all day long. Experience the best in apparel.",
      "location": {
        "x": 47,
        "y": 67,
        "aisle": "E3"
      }
    },
    {
      "id": "65",
      "name": "Nike Yoga Mat",
      "price": 21,
      "category": "Accessories",
      "image": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500",
      "description": "Premium quality and high performance. Experience the best in accessories.",
      "location": {
        "x": 65,
        "y": 83,
        "aisle": "E1"
      }
    },
    {
      "id": "66",
      "name": "Patagonia Hoodie",
      "price": 72,
      "category": "Apparel",
      "image": "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500",
      "description": "Stay cool and dry all day long. Experience the best in apparel.",
      "location": {
        "x": 24,
        "y": 57,
        "aisle": "B2"
      }
    },
    {
      "id": "67",
      "name": "Herschel Gym Bag",
      "price": 106,
      "category": "Accessories",
      "image": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500",
      "description": "Premium quality and high performance. Experience the best in accessories.",
      "location": {
        "x": 60,
        "y": 56,
        "aisle": "A2"
      }
    },
    {
      "id": "68",
      "name": "Under Armour Sweatpants",
      "price": 40,
      "category": "Apparel",
      "image": "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500",
      "description": "Stay cool and dry all day long. Experience the best in apparel.",
      "location": {
        "x": 82,
        "y": 5,
        "aisle": "B1"
      }
    },
    {
      "id": "69",
      "name": "Apple Smartwatch",
      "price": 259,
      "category": "Electronics",
      "image": "https://images.unsplash.com/photo-1434493789847-2f02b0c1664e?w=500",
      "description": "Sleek design with advanced technology. Experience the best in electronics.",
      "location": {
        "x": 66,
        "y": 19,
        "aisle": "C5"
      }
    },
    {
      "id": "70",
      "name": "Apple Heart Rate Monitor",
      "price": 142,
      "category": "Electronics",
      "image": "https://images.unsplash.com/photo-1434493789847-2f02b0c1664e?w=500",
      "description": "Perfect for your everyday competitive needs. Experience the best in electronics.",
      "location": {
        "x": 44,
        "y": 50,
        "aisle": "C1"
      }
    },
    {
      "id": "71",
      "name": "Puma Trail Runners",
      "price": 57,
      "category": "Shoes",
      "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
      "description": "Perfect for your everyday competitive needs. Experience the best in shoes.",
      "location": {
        "x": 21,
        "y": 66,
        "aisle": "C4"
      }
    },
    {
      "id": "72",
      "name": "Nike Yoga Mat",
      "price": 66,
      "category": "Accessories",
      "image": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500",
      "description": "Premium quality and high performance. Experience the best in accessories.",
      "location": {
        "x": 41,
        "y": 63,
        "aisle": "A1"
      }
    },
    {
      "id": "73",
      "name": "Reebok Basketball Sneakers",
      "price": 22,
      "category": "Shoes",
      "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
      "description": "Engineered for the elite athlete. Experience the best in shoes.",
      "location": {
        "x": 93,
        "y": 58,
        "aisle": "E4"
      }
    },
    {
      "id": "74",
      "name": "Samsung Earbuds",
      "price": 56,
      "category": "Electronics",
      "image": "https://images.unsplash.com/photo-1434493789847-2f02b0c1664e?w=500",
      "description": "Designed for ultimate comfort and durability. Experience the best in electronics.",
      "location": {
        "x": 16,
        "y": 22,
        "aisle": "D4"
      }
    },
    {
      "id": "75",
      "name": "Under Armour Training Shoes",
      "price": 81,
      "category": "Shoes",
      "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
      "description": "Perfect for your everyday competitive needs. Experience the best in shoes.",
      "location": {
        "x": 28,
        "y": 23,
        "aisle": "B3"
      }
    },
    {
      "id": "76",
      "name": "Patagonia Leggings",
      "price": 38,
      "category": "Apparel",
      "image": "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500",
      "description": "Sleek design with advanced technology. Experience the best in apparel.",
      "location": {
        "x": 82,
        "y": 16,
        "aisle": "A5"
      }
    },
    {
      "id": "77",
      "name": "JBL Heart Rate Monitor",
      "price": 35,
      "category": "Electronics",
      "image": "https://images.unsplash.com/photo-1434493789847-2f02b0c1664e?w=500",
      "description": "Stay cool and dry all day long. Experience the best in electronics.",
      "location": {
        "x": 84,
        "y": 29,
        "aisle": "A4"
      }
    },
    {
      "id": "78",
      "name": "Puma Training Shoes",
      "price": 103,
      "category": "Shoes",
      "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
      "description": "Designed for ultimate comfort and durability. Experience the best in shoes.",
      "location": {
        "x": 30,
        "y": 40,
        "aisle": "D5"
      }
    },
    {
      "id": "79",
      "name": "Patagonia Leggings",
      "price": 50,
      "category": "Apparel",
      "image": "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500",
      "description": "Built to withstand the toughest workouts. Experience the best in apparel.",
      "location": {
        "x": 44,
        "y": 69,
        "aisle": "A2"
      }
    },
    {
      "id": "80",
      "name": "HydroFlask Cap",
      "price": 77,
      "category": "Accessories",
      "image": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500",
      "description": "Engineered for the elite athlete. Experience the best in accessories.",
      "location": {
        "x": 75,
        "y": 73,
        "aisle": "C1"
      }
    },
    {
      "id": "81",
      "name": "JBL Smartwatch",
      "price": 216,
      "category": "Electronics",
      "image": "https://images.unsplash.com/photo-1434493789847-2f02b0c1664e?w=500",
      "description": "Premium quality and high performance. Experience the best in electronics.",
      "location": {
        "x": 75,
        "y": 40,
        "aisle": "B2"
      }
    },
    {
      "id": "82",
      "name": "Reebok Training Shoes",
      "price": 31,
      "category": "Shoes",
      "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
      "description": "Stay cool and dry all day long. Experience the best in shoes.",
      "location": {
        "x": 25,
        "y": 64,
        "aisle": "C3"
      }
    },
    {
      "id": "83",
      "name": "Lululemon Windbreaker",
      "price": 95,
      "category": "Apparel",
      "image": "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500",
      "description": "Built to withstand the toughest workouts. Experience the best in apparel.",
      "location": {
        "x": 59,
        "y": 54,
        "aisle": "A3"
      }
    },
    {
      "id": "84",
      "name": "Patagonia Tank Top",
      "price": 77,
      "category": "Apparel",
      "image": "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500",
      "description": "Built to withstand the toughest workouts. Experience the best in apparel.",
      "location": {
        "x": 68,
        "y": 82,
        "aisle": "C2"
      }
    },
    {
      "id": "85",
      "name": "Nike Socks",
      "price": 115,
      "category": "Accessories",
      "image": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500",
      "description": "Perfect for your everyday competitive needs. Experience the best in accessories.",
      "location": {
        "x": 9,
        "y": 38,
        "aisle": "C2"
      }
    },
    {
      "id": "86",
      "name": "Adidas Running Shoes",
      "price": 58,
      "category": "Shoes",
      "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
      "description": "Engineered for the elite athlete. Experience the best in shoes.",
      "location": {
        "x": 26,
        "y": 66,
        "aisle": "D3"
      }
    },
    {
      "id": "87",
      "name": "Lululemon T-Shirt",
      "price": 89,
      "category": "Apparel",
      "image": "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500",
      "description": "Lightweight and highly responsive. Experience the best in apparel.",
      "location": {
        "x": 44,
        "y": 31,
        "aisle": "B2"
      }
    },
    {
      "id": "88",
      "name": "Bose Headphones",
      "price": 245,
      "category": "Electronics",
      "image": "https://images.unsplash.com/photo-1434493789847-2f02b0c1664e?w=500",
      "description": "Premium quality and high performance. Experience the best in electronics.",
      "location": {
        "x": 41,
        "y": 49,
        "aisle": "C2"
      }
    },
    {
      "id": "89",
      "name": "Apple Headphones",
      "price": 136,
      "category": "Electronics",
      "image": "https://images.unsplash.com/photo-1434493789847-2f02b0c1664e?w=500",
      "description": "Engineered for the elite athlete. Experience the best in electronics.",
      "location": {
        "x": 94,
        "y": 41,
        "aisle": "B4"
      }
    },
    {
      "id": "90",
      "name": "Fitbit Earbuds",
      "price": 286,
      "category": "Electronics",
      "image": "https://images.unsplash.com/photo-1434493789847-2f02b0c1664e?w=500",
      "description": "Engineered for the elite athlete. Experience the best in electronics.",
      "location": {
        "x": 6,
        "y": 83,
        "aisle": "C3"
      }
    },
    {
      "id": "91",
      "name": "Herschel Cap",
      "price": 21,
      "category": "Accessories",
      "image": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500",
      "description": "Premium quality and high performance. Experience the best in accessories.",
      "location": {
        "x": 41,
        "y": 34,
        "aisle": "B4"
      }
    },
    {
      "id": "92",
      "name": "Beats Fitness Tracker",
      "price": 26,
      "category": "Electronics",
      "image": "https://images.unsplash.com/photo-1434493789847-2f02b0c1664e?w=500",
      "description": "Premium quality and high performance. Experience the best in electronics.",
      "location": {
        "x": 70,
        "y": 41,
        "aisle": "A3"
      }
    },
    {
      "id": "93",
      "name": "CamelBak Socks",
      "price": 57,
      "category": "Accessories",
      "image": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500",
      "description": "Stay cool and dry all day long. Experience the best in accessories.",
      "location": {
        "x": 46,
        "y": 87,
        "aisle": "D2"
      }
    },
    {
      "id": "94",
      "name": "Brooks Walking Shoes",
      "price": 74,
      "category": "Shoes",
      "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
      "description": "Perfect for your everyday competitive needs. Experience the best in shoes.",
      "location": {
        "x": 58,
        "y": 46,
        "aisle": "E4"
      }
    },
    {
      "id": "95",
      "name": "Fitbit Portable Speaker",
      "price": 187,
      "category": "Electronics",
      "image": "https://images.unsplash.com/photo-1434493789847-2f02b0c1664e?w=500",
      "description": "Premium quality and high performance. Experience the best in electronics.",
      "location": {
        "x": 44,
        "y": 31,
        "aisle": "D4"
      }
    },
    {
      "id": "96",
      "name": "The North Face Sweatpants",
      "price": 113,
      "category": "Apparel",
      "image": "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500",
      "description": "Stay cool and dry all day long. Experience the best in apparel.",
      "location": {
        "x": 53,
        "y": 23,
        "aisle": "C2"
      }
    },
    {
      "id": "97",
      "name": "Beats Portable Speaker",
      "price": 302,
      "category": "Electronics",
      "image": "https://images.unsplash.com/photo-1434493789847-2f02b0c1664e?w=500",
      "description": "Lightweight and highly responsive. Experience the best in electronics.",
      "location": {
        "x": 18,
        "y": 70,
        "aisle": "A2"
      }
    },
    {
      "id": "98",
      "name": "JBL Heart Rate Monitor",
      "price": 175,
      "category": "Electronics",
      "image": "https://images.unsplash.com/photo-1434493789847-2f02b0c1664e?w=500",
      "description": "Stay cool and dry all day long. Experience the best in electronics.",
      "location": {
        "x": 5,
        "y": 26,
        "aisle": "D5"
      }
    },
    {
      "id": "99",
      "name": "Puma Basketball Sneakers",
      "price": 43,
      "category": "Shoes",
      "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
      "description": "Sleek design with advanced technology. Experience the best in shoes.",
      "location": {
        "x": 42,
        "y": 65,
        "aisle": "A5"
      }
    },
    {
      "id": "100",
      "name": "Under Armour Shorts",
      "price": 98,
      "category": "Apparel",
      "image": "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500",
      "description": "Premium quality and high performance. Experience the best in apparel.",
      "location": {
        "x": 19,
        "y": 90,
        "aisle": "B4"
      }
    },
    {
      "id": "101",
      "name": "Columbia Sweatpants",
      "price": 117,
      "category": "Apparel",
      "image": "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500",
      "description": "Engineered for the elite athlete. Experience the best in apparel.",
      "location": {
        "x": 53,
        "y": 57,
        "aisle": "D5"
      }
    },
    {
      "id": "102",
      "name": "Apple Heart Rate Monitor",
      "price": 277,
      "category": "Electronics",
      "image": "https://images.unsplash.com/photo-1434493789847-2f02b0c1664e?w=500",
      "description": "Perfect for your everyday competitive needs. Experience the best in electronics.",
      "location": {
        "x": 55,
        "y": 14,
        "aisle": "E3"
      }
    },
    {
      "id": "103",
      "name": "Puma Trail Runners",
      "price": 29,
      "category": "Shoes",
      "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
      "description": "Designed for ultimate comfort and durability. Experience the best in shoes.",
      "location": {
        "x": 19,
        "y": 79,
        "aisle": "D5"
      }
    },
    {
      "id": "104",
      "name": "Apple Smartwatch",
      "price": 90,
      "category": "Electronics",
      "image": "https://images.unsplash.com/photo-1434493789847-2f02b0c1664e?w=500",
      "description": "Sleek design with advanced technology. Experience the best in electronics.",
      "location": {
        "x": 46,
        "y": 71,
        "aisle": "B3"
      }
    },
    {
      "id": "105",
      "name": "Columbia Shorts",
      "price": 49,
      "category": "Apparel",
      "image": "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500",
      "description": "Sleek design with advanced technology. Experience the best in apparel.",
      "location": {
        "x": 44,
        "y": 93,
        "aisle": "E3"
      }
    },
    {
      "id": "106",
      "name": "JBL Heart Rate Monitor",
      "price": 79,
      "category": "Electronics",
      "image": "https://images.unsplash.com/photo-1434493789847-2f02b0c1664e?w=500",
      "description": "Sleek design with advanced technology. Experience the best in electronics.",
      "location": {
        "x": 30,
        "y": 35,
        "aisle": "D5"
      }
    },
    {
      "id": "107",
      "name": "Champion Hoodie",
      "price": 56,
      "category": "Apparel",
      "image": "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500",
      "description": "Lightweight and highly responsive. Experience the best in apparel.",
      "location": {
        "x": 57,
        "y": 12,
        "aisle": "E4"
      }
    },
    {
      "id": "108",
      "name": "Lululemon Windbreaker",
      "price": 58,
      "category": "Apparel",
      "image": "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500",
      "description": "Stay cool and dry all day long. Experience the best in apparel.",
      "location": {
        "x": 17,
        "y": 60,
        "aisle": "E2"
      }
    },
    {
      "id": "109",
      "name": "Yeti Water Bottle",
      "price": 114,
      "category": "Accessories",
      "image": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500",
      "description": "Engineered for the elite athlete. Experience the best in accessories.",
      "location": {
        "x": 87,
        "y": 87,
        "aisle": "D4"
      }
    },
    {
      "id": "110",
      "name": "CamelBak Socks",
      "price": 96,
      "category": "Accessories",
      "image": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500",
      "description": "Engineered for the elite athlete. Experience the best in accessories.",
      "location": {
        "x": 58,
        "y": 27,
        "aisle": "B2"
      }
    },
    {
      "id": "111",
      "name": "HydroFlask Sunglasses",
      "price": 65,
      "category": "Accessories",
      "image": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500",
      "description": "Built to withstand the toughest workouts. Experience the best in accessories.",
      "location": {
        "x": 6,
        "y": 23,
        "aisle": "C3"
      }
    },
    {
      "id": "112",
      "name": "Garmin Headphones",
      "price": 198,
      "category": "Electronics",
      "image": "https://images.unsplash.com/photo-1434493789847-2f02b0c1664e?w=500",
      "description": "Engineered for the elite athlete. Experience the best in electronics.",
      "location": {
        "x": 85,
        "y": 33,
        "aisle": "A5"
      }
    },
    {
      "id": "113",
      "name": "The North Face T-Shirt",
      "price": 116,
      "category": "Apparel",
      "image": "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500",
      "description": "Lightweight and highly responsive. Experience the best in apparel.",
      "location": {
        "x": 47,
        "y": 51,
        "aisle": "D2"
      }
    },
    {
      "id": "114",
      "name": "New Balance Lifestyle Sneakers",
      "price": 51,
      "category": "Shoes",
      "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
      "description": "Premium quality and high performance. Experience the best in shoes.",
      "location": {
        "x": 80,
        "y": 29,
        "aisle": "C5"
      }
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
