import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface BlogPost {
  slug: string;
  title: string;
  publishedAt: string;
  excerpt?: string;
  category?: string;
  tags?: string[];
  featured: boolean;
  author: string;
  readTime: string;
  featureImage?: string;
  source?: string;
  linkedinUrl?: string;
  externalUrl?: string;
}

interface Manifest {
  posts: BlogPost[];
  categories: string[];
  tags: string[];
  categoryCounts: Record<string, number>;
  tagCounts: Record<string, number>;
  totalPosts: number;
  lastGenerated: string;
}

// Category-based Unsplash search terms and image collections
const categoryImageMap: Record<string, string[]> = {
  'AI & Automation': [
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=2000&q=80', // AI/Tech
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=2000&q=80', // AI patterns
    'https://images.unsplash.com/photo-1635322966219-b75ed372eb01?w=2000&q=80', // Neural network
    'https://images.unsplash.com/photo-1655720033654-a4239dd42d10?w=2000&q=80', // Code/AI
    'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=2000&q=80', // Abstract tech
  ],
  'Leadership': [
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=2000&q=80', // Team collaboration
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=2000&q=80', // Leadership meeting
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=2000&q=80', // Strategy
    'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=2000&q=80', // Team work
    'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=2000&q=80', // Direction
  ],
  'Commerce': [
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=2000&q=80', // Commerce/business
    'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=2000&q=80', // Online shopping
    'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=2000&q=80', // Strategy/planning
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=2000&q=80', // Analytics
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=2000&q=80', // Data
  ],
  'Reflections': [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=2000&q=80', // Contemplation
    'https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=2000&q=80', // Reflection
    'https://images.unsplash.com/photo-1502139214982-d0ad755818d8?w=2000&q=80', // Introspection
    'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=2000&q=80', // Mirror/reflection
    'https://images.unsplash.com/photo-1542435503-956c469947f6?w=2000&q=80', // Thinking
  ],
  'Meta': [
    'https://images.unsplash.com/photo-1455849318743-b2233052fcff?w=2000&q=80', // Writing
    'https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?w=2000&q=80', // Notebook
    'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=2000&q=80', // Desk work
    'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=2000&q=80', // Ideas
    'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=2000&q=80', // Creative process
  ],
  'Philosophy': [
    'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=2000&q=80', // Abstract thought
    'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=2000&q=80', // Contemplative
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=2000&q=80', // Mountain/perspective
    'https://images.unsplash.com/photo-1501139083538-0139583c060f?w=2000&q=80', // Minimal/zen
    'https://images.unsplash.com/photo-1508615070457-7baeba4003ab?w=2000&q=80', // Philosophy/thought
  ],
  'Consulting': [
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=2000&q=80', // Business strategy
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=2000&q=80', // Consulting work
    'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=2000&q=80', // Professional
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=2000&q=80', // Office work
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=2000&q=80', // Teamwork
  ],
  'Field Notes': [
    'https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?w=2000&q=80', // Notes/journal
    'https://images.unsplash.com/photo-1517842645767-c639042777db?w=2000&q=80', // Field work
    'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=2000&q=80', // Notebook
    'https://images.unsplash.com/photo-1455849318743-b2233052fcff?w=2000&q=80', // Writing
    'https://images.unsplash.com/photo-1502139214982-d0ad755818d8?w=2000&q=80', // Documentation
  ],
  'Insights': [
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=2000&q=80', // Data/insights
    'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=2000&q=80', // Analysis
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=2000&q=80', // Charts
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=2000&q=80', // Analytics
    'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=2000&q=80', // Vision
  ],
};

// Default fallback images for posts without category
const defaultImages = [
  'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=2000&q=80', // Tech abstract
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=2000&q=80', // Tech blue
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=2000&q=80', // Digital
];

function getRandomImage(category: string | undefined): string {
  if (!category || !categoryImageMap[category]) {
    return defaultImages[Math.floor(Math.random() * defaultImages.length)];
  }
  
  const images = categoryImageMap[category];
  return images[Math.floor(Math.random() * images.length)];
}

async function addFeatureImages() {
  const manifestPath = path.join(__dirname, '../src/data/blog-manifest.json');
  
  // Read the manifest
  const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
  const manifest: Manifest = JSON.parse(manifestContent);
  
  let updatedCount = 0;
  
  // Process each post
  manifest.posts.forEach((post) => {
    if (!post.featureImage) {
      post.featureImage = getRandomImage(post.category);
      updatedCount++;
      console.log(`✓ Added image to: ${post.slug} (${post.category || 'no category'})`);
    }
  });
  
  // Update lastGenerated timestamp
  manifest.lastGenerated = new Date().toISOString();
  
  // Write back to file
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
  
  console.log(`\n✅ Updated ${updatedCount} posts with feature images`);
  console.log(`📝 Total posts: ${manifest.posts.length}`);
  console.log(`🖼️  Posts with images: ${manifest.posts.filter(p => p.featureImage).length}`);
}

// Run the script
addFeatureImages().catch(console.error);