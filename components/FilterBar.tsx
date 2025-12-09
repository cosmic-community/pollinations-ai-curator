'use client';

import { Tag } from '@/lib/types';
import { Filter } from 'lucide-react';

interface FilterBarProps {
  tags: Tag[];
  activeTag: string | null;
  onSelectTag: (tagSlug: string | null) => void;
}

export default function FilterBar({ tags, activeTag, onSelectTag }: FilterBarProps) {
  if (!tags || tags.length === 0) return null;

  return (
    <div className="w-full overflow-x-auto pb-4 mb-6 scrollbar-hide">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-400 mr-2">
          <Filter className="w-4 h-4" />
          <span>Filters:</span>
        </div>
        
        <button
          onClick={() => onSelectTag(null)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap border ${
            activeTag === null
              ? 'bg-primary border-primary text-white'
              : 'bg-card border-border text-gray-400 hover:text-white hover:border-gray-500'
          }`}
        >
          All
        </button>

        {tags.map((tag) => (
          <button
            key={tag.id}
            onClick={() => onSelectTag(tag.slug)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap border flex items-center gap-1 ${
              activeTag === tag.slug
                ? 'text-white border-transparent'
                : 'bg-card border-border text-gray-400 hover:text-white hover:border-gray-500'
            }`}
            style={{
              backgroundColor: activeTag === tag.slug ? (tag.metadata.color || '#3b82f6') : undefined,
              borderColor: activeTag === tag.slug ? (tag.metadata.color || '#3b82f6') : undefined
            }}
          >
            {tag.title}
          </button>
        ))}
      </div>
    </div>
  );
}