'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LiveFeed from '@/components/LiveFeed';
import Gallery from '@/components/Gallery';
import CosmicBadge from '@/components/CosmicBadge';
import { Settings, ImagePost, Tag } from '@/lib/types';

interface PageClientProps {
  settings: Settings;
  images: ImagePost[];
  tags: Tag[];
  bucketSlug: string;
}

export default function PageClient({ settings, images, tags, bucketSlug }: PageClientProps) {
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
      <CosmicBadge bucketSlug={bucketSlug} />
    </div>
  );
}