export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string; // In a real app, this might be Markdown or HTML
  coverImage: string;
  date: string;
  readTime: string;
  category: string;
  tags: string[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    slug: 'how-to-animate-travel-route-web',
    title: 'How to Create Cinematic Travel Route Animations on the Web (No After Effects)',
    excerpt: 'Learn how to visualize your road trips and flights using MapMotion. Import GPX files, set camera angles, and export 4K video in minutes.',
    content: `
      <h2>Why switch from After Effects to Web-based Map Animation?</h2>
      <p>For years, creating high-quality map animations meant mastering Adobe After Effects and expensive plugins like GeoLayers. While powerful, this workflow is overkill for most travel vloggers and content creators.</p>
      
      <h3>The Rise of Browser-Based Tools</h3>
      <p>MapMotion brings the power of 3D terrain visualization directly to your browser. With WebGL technology, we can now render millions of elevation points and satellite imagery instantly.</p>
      
      <h2>Step 1: Importing Your Route Data</h2>
      <p>Most fitness apps (Strava, Garmin) and Google Maps allow you to export GPX or KML files. in MapMotion, simply drag and drop these files to visualize your exact path on a 3D globe.</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074&auto=format&fit=crop',
    date: 'Nov 28, 2024',
    readTime: '5 min read',
    category: 'Tutorial',
    tags: ['GPX', 'Travel Vlog', 'Tutorial'],
  },
  {
    id: '2',
    slug: 'geolayers-alternative-comparison',
    title: 'Top 5 GeoLayers Alternatives for Map Animation in 2024',
    excerpt: 'A comprehensive comparison of map animation tools. Why MapMotion is the best free alternative to GeoLayers 3 for creating map videos.',
    content: '...',
    coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop',
    date: 'Nov 25, 2024',
    readTime: '8 min read',
    category: 'Comparison',
    tags: ['GeoLayers', 'Review', 'Tools'],
  },
  {
    id: '3',
    slug: 'visualizing-data-on-3d-globe',
    title: 'Storytelling with Data: Visualizing Global Trends on a 3D Globe',
    excerpt: 'Turn boring spreadsheets into engaging 3D data visualizations. Perfect for newsrooms, documentaries, and educational content.',
    content: '...',
    coverImage: 'https://images.unsplash.com/photo-1516937941348-c09645f8b249?q=80&w=3266&auto=format&fit=crop',
    date: 'Nov 20, 2024',
    readTime: '6 min read',
    category: 'Data Viz',
    tags: ['Data Visualization', 'Journalism', '3D Maps'],
  }
];
