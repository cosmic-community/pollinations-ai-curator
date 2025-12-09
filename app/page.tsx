import { cosmic } from '@/lib/cosmic';
import { Settings, ImagePost, Tag } from '@/lib/types';
import { Suspense } from 'react';

// Separate Client Component for state management
import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LiveFeed from '@/components/LiveFeed';
import Gallery from '@/components/Gallery';
import CosmicBadge from '@/components/CosmicBadge';

async function getData() {
  // Helper functions to handle Cosmic SDK promises correctly with try/catch
  // instead of chaining .catch() which TS complains about
  const getSettings = async () => {
    try {
      const data = await cosmic.objects
        .findOne({ type: 'settings', slug: 'app-settings' })
        .props('metadata')
        .depth(1);
      return data;
    } catch (error) {
      // Default settings if fetch fails
      return { 
        object: { 
          metadata: { 
            feed_url: 'https://image.pollinations.ai/feed',
            image_shelf: 'Pollinations Curator',
            images_per_page: 12,
            feed_update_interval: 30,
            enable_auto_tagging: true,
            description: 'Explore beautiful AI-generated images'
          } 
        } 
      };
    }
  };

  const getImages = async () => {
    try {
      const data = await cosmic.objects
        .find({ type: 'images' })
        .props('id,slug,title,metadata')
        .depth(1)
        .sort('-created_at')
        .limit(50);
      return data;
    } catch (error) {
      return { objects: [] };
    }
  };

  const getTags = async () => {
    try {
      const data = await cosmic.objects
        .find({ type: 'tags' })
        .props('id,slug,title,metadata')
        .depth(1);
      return data;
    } catch (error) {
      return { objects: [] };
    }
  };

  try {
    const [settingsRes, imagesRes, tagsRes] = await Promise.all([
      getSettings(),
      getImages(),
      getTags()
    ]);

    return {
      settings: settingsRes.object as Settings,
      images: (imagesRes.objects || []) as ImagePost[],
      tags: (tagsRes.objects || []) as Tag[],
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    // Fallback data
    return {
      settings: { 
        metadata: { 
          feed_url: 'https://image.pollinations.ai/feed', 
          image_shelf: 'Error Loading',
          description: 'Failed to load settings',
          images_per_page: 12
        } 
      } as Settings,
      images: [],
      tags: [],
    };
  }
}

// Client wrapper component
function PageClient({ settings, images, tags }: { settings: Settings, images: ImagePost[], tags: Tag[] }) {
  const [activeTab, setActiveTab] = useState<'live' | 'gallery'>('live');

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header settings={settings} activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {activeTab === 'live' ? (
          <div className="animate-fade-in">
            <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-lg text-sm text-primary-foreground/80">
              <p>
                <strong>💡 Tip:</strong> You are viewing a live stream of images being generated right now by users on Pollinations.ai. 
                Click &quot;Save&quot; on any image to curate it into your personal gallery.
              </p>
            </div>
            <LiveFeed feedUrl={settings.metadata.feed_url} />
          </div>
        ) : (
          <div className="animate-fade-in">
             <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Curated Gallery</h2>
                <p className="text-gray-400">Your collection of saved AI masterpieces.</p>
             </div>
            <Gallery initialImages={images} tags={tags} />
          </div>
        )}
      </main>

      <Footer />
      <CosmicBadge bucketSlug={process.env.COSMIC_BUCKET_SLUG || ''} />
    </div>
  );
}

export default async function Page() {
  const data = await getData();

  return (
    <PageClient 
      settings={data.settings} 
      images={data.images} 
      tags={data.tags} 
    />
  );
}