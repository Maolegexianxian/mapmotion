import { Map, Route, Building2, Calendar, BarChart3, Megaphone, type LucideIcon } from 'lucide-react';

export interface TemplateAuthor {
  name: string;
  avatar: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail: string;
  duration: string;
  views: number;
  featured: boolean;
  isPro: boolean;
  author: TemplateAuthor;
  tags: string[];
  rating: number;
  downloads: string;
  resolution: string;
  fps: number;
}

export interface TemplateCategory {
  id: string;
  icon: LucideIcon;
  label: string;
}

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  { id: 'all', icon: Map, label: 'All' },
  { id: 'route', icon: Route, label: 'Routes' },
  { id: 'city', icon: Building2, label: 'City Guides' },
  { id: 'event', icon: Calendar, label: 'Events' },
  { id: 'data', icon: BarChart3, label: 'Data Viz' },
  { id: 'brand', icon: Megaphone, label: 'Branding' },
];

export const TEMPLATES: Template[] = [
  { 
    id: '1', 
    name: 'Global Travel Route', 
    description: 'Cinematic world map travel route animation. Perfect for travel vlogs, featuring automatic camera following, city labels, and 4K export quality.',
    category: 'route', 
    thumbnail: '',
    duration: '30s',
    views: 2340,
    featured: true,
    isPro: true,
    author: { name: 'Alex Creator', avatar: 'https://i.pravatar.cc/150?u=1' },
    tags: ['Cinematic', 'Travel', 'Vlog', 'Route Animation', 'World Map'],
    rating: 4.9,
    downloads: '12.5k',
    resolution: '4K',
    fps: 60,
  },
  { 
    id: '2', 
    name: 'Road Trip Log', 
    description: 'Dynamic road trip tracker with waypoints and stop-overs. Import your GPX or KML files to visualize driving routes on realistic 3D terrain.',
    category: 'route', 
    thumbnail: 'bg-gradient-to-br from-purple-900 to-pink-900',
    duration: '20s',
    views: 1856,
    featured: false,
    isPro: true,
    author: { name: 'Sarah Tech', avatar: 'https://i.pravatar.cc/150?u=2' },
    tags: ['Cyberpunk', 'Neon', 'Dark', 'GPX Import', 'Road Trip'],
    rating: 4.8,
    downloads: '8.2k',
    resolution: '4K',
    fps: 60,
  },
  { 
    id: '3', 
    name: 'City Panorama', 
    description: 'Stunning 3D city flyover template. Features orbiting camera movements around landmarks and skyscrapers. Ideal for real estate and city guides.',
    category: 'city', 
    thumbnail: 'bg-gradient-to-br from-slate-200 to-white',
    duration: '45s',
    views: 3102,
    featured: true,
    isPro: false,
    author: { name: 'Biz Motion', avatar: 'https://i.pravatar.cc/150?u=3' },
    tags: ['Minimal', 'Business', 'Clean', 'Real Estate', '3D Buildings'],
    rating: 4.7,
    downloads: '25k+',
    resolution: '1080p',
    fps: 30,
  },
  { 
    id: '4', 
    name: 'Historical Event Tracker', 
    description: 'Vintage style map for historical documentaries. Timeline-driven event markers with textured paper map effects and classic typography.',
    category: 'event', 
    thumbnail: 'bg-gradient-to-br from-amber-900/40 to-orange-900/40',
    duration: '60s',
    views: 987,
    featured: false,
    isPro: true,
    author: { name: 'History Lab', avatar: 'https://i.pravatar.cc/150?u=4' },
    tags: ['Vintage', 'Texture', 'Paper', 'Documentary', 'History'],
    rating: 4.9,
    downloads: '5.3k',
    resolution: '4K',
    fps: 24,
  },
  { 
    id: '5', 
    name: 'Sales Heatmap', 
    description: 'Professional data visualization template. Display regional sales data, heatmaps, and density plots on a 3D globe. Supports CSV data import.',
    category: 'data', 
    thumbnail: 'bg-gradient-to-br from-emerald-900 to-teal-900',
    duration: '25s',
    views: 2156,
    featured: true,
    isPro: true,
    author: { name: 'Geo Master', avatar: 'https://i.pravatar.cc/150?u=5' },
    tags: ['3D', 'Satellite', 'Nature', 'Data Viz', 'Heatmap'],
    rating: 5.0,
    downloads: '3.1k',
    resolution: '4K',
    fps: 60,
  },
  { 
    id: '6', 
    name: 'Logistics Network', 
    description: 'Supply chain and logistics network visualization. Animate connection lines between hubs and distribution centers. Great for corporate presentations.',
    category: 'data', 
    thumbnail: 'bg-gradient-to-br from-blue-800 to-indigo-900',
    duration: '35s',
    views: 1423,
    featured: false,
    isPro: false,
    author: { name: 'News Pack', avatar: 'https://i.pravatar.cc/150?u=6' },
    tags: ['Broadcast', 'News', 'Data', 'Logistics', 'Supply Chain'],
    rating: 4.6,
    downloads: '15k',
    resolution: '1080p',
    fps: 60,
  },
  { 
    id: '7', 
    name: 'Store Locations', 
    description: 'Retail store locator animation. Highlight multiple brand locations across a country or region with custom pin markers and popups.',
    category: 'brand', 
    thumbnail: 'bg-gradient-to-br from-blue-900 to-slate-900',
    duration: '40s',
    views: 1789,
    featured: false,
    isPro: true,
    author: { name: 'Alex Creator', avatar: 'https://i.pravatar.cc/150?u=1' },
    tags: ['Cinematic', 'Travel', 'Vlog', 'Retail', 'Brand'],
    rating: 4.9,
    downloads: '12.5k',
    resolution: '4K',
    fps: 60,
  },
  { 
    id: '8', 
    name: 'Airline Network', 
    description: 'Flight path visualization for airlines and travel agencies. Show connecting flights and hubs on a dark mode 3D globe with neon path effects.',
    category: 'route', 
    thumbnail: 'bg-gradient-to-br from-purple-900 to-pink-900',
    duration: '50s',
    views: 2567,
    featured: true,
    isPro: true,
    author: { name: 'Sarah Tech', avatar: 'https://i.pravatar.cc/150?u=2' },
    tags: ['Cyberpunk', 'Neon', 'Dark', 'Aviation', 'Flight Path'],
    rating: 4.8,
    downloads: '8.2k',
    resolution: '4K',
    fps: 60,
  },
];
