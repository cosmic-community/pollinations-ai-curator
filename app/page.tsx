import { cosmic } from '@/lib/cosmic';
import { Settings, ImagePost, Tag } from '@/lib/types';
import MainView from './MainView'; // We'll create this client component inline or separate
import { Suspense } from 'react';

// Separate Client Component for state management
import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LiveFeed from '@/components/LiveFeed';
import Gallery from '@/components/Gallery';
import CosmicBadge from '@/components/CosmicBadge';

async function getData() {
  try {
    // Fetch settings
    const settingsPromise = cosmic.objects
      .findOne({ type: 'settings', slug: 'app-settings' })
      .props('metadata')
      .depth(1)
      .catch(() => ({ object: { metadata: { 
        feed_url: 'https://image.pollinations.ai/feed',
        image_shelf: 'Pollinations Curator' 
      } } }));

    // Fetch images
    const imagesPromise = cosmic.objects
      .find({ type: 'images' })
      .props('id,slug,title,metadata')
      .depth(1)
      .sort('-created_at')
      .limit(50)
      .catch(() => ({ objects: [] }));

    // Fetch tags
    const tagsPromise = cosmic.objects
      .find({ type: 'tags' })
      .props('id,slug,title,metadata')
      .depth(1)
      .catch(() => ({ objects: [] }));

    const [settingsRes, imagesRes, tagsRes] = await Promise.all([
      settingsPromise,
      imagesPromise,
      tagsPromise
    ]);

    return {
      settings: settingsRes.object as Settings,
      images: (imagesRes.objects || []) as ImagePost[],
      tags: (tagsRes.objects || []) as Tag[],
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      settings: { metadata: { feed_url: 'https://image.pollinations.ai/feed', image_shelf: 'Error Loading' } } as Settings,
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
                Click "Save" on any image to curate it into your personal gallery.
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