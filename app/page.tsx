import { cosmic } from '@/lib/cosmic';
import { Settings, ImagePost, Tag } from '@/lib/types';
import PageClient from '@/components/PageClient';

async function getData() {
    // Helper functions to handle Cosmic SDK promises correctly with try/catch
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

export default async function Page() {
  const data = await getData();
  // Pass bucket slug from server environment to client component
  const bucketSlug = process.env.COSMIC_BUCKET_SLUG || '';

  return (
    <PageClient 
      settings={data.settings} 
      images={data.images} 
      tags={data.tags} 
      bucketSlug={bucketSlug}
    />
  );
}