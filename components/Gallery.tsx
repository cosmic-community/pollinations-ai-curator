'use client';

import { useState } from 'react';
import { ImagePost, Tag } from '@/lib/types';
import ImageCard from './ImageCard';
import FilterBar from './FilterBar';
import { Loader2 } from 'lucide-react';

interface GalleryProps {
  initialImages: ImagePost[];
  tags: Tag[];
}

export default function Gallery({ initialImages, tags }: GalleryProps) {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  
  // Filter images based on selected tag
  // Note: For large datasets, this should be server-side filtering.
  // Given the context, client-side filtering of the initial fetch is acceptable for a demo,
  // but ideally we'd re-fetch from API with tag query.
  const filteredImages = activeTag
    ? initialImages.filter(img => 
        img.metadata.tags?.some(tag => tag.slug === activeTag)
      )
    : initialImages;

  return (
    <div className="w-full">
      <FilterBar 
        tags={tags} 
        activeTag={activeTag} 
        onSelectTag={setActiveTag} 
      />

      {filteredImages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500 bg-card/50 rounded-xl border border-dashed border-border">
          <p>No images found in this category.</p>
          <button 
            onClick={() => setActiveTag(null)}
            className="mt-4 text-primary hover:underline text-sm"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
          {filteredImages.map((post) => (
            <ImageCard 
              key={post.id} 
              data={post} 
              type="stored" 
            />
          ))}
        </div>
      )}
    </div>
  );
}