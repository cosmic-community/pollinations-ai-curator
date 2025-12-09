import { Settings } from '@/lib/types';
import { Sparkles, Radio } from 'lucide-react';

interface HeaderProps {
  settings: Settings;
  activeTab: 'live' | 'gallery';
  onTabChange: (tab: 'live' | 'gallery') => void;
}

export default function Header({ settings, activeTab, onTabChange }: HeaderProps) {
  const title = settings.metadata.image_shelf || 'Image Shelf';
  const description = settings.metadata.description || 'AI Image Viewer';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-accent" />
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            {title}
          </h1>
        </div>

        <nav className="flex items-center gap-1 bg-secondary/50 p-1 rounded-lg">
          <button
            onClick={() => onTabChange('live')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              activeTab === 'live'
                ? 'bg-primary text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Radio className={`h-4 w-4 ${activeTab === 'live' ? 'animate-pulse' : ''}`} />
            Live Feed
          </button>
          <button
            onClick={() => onTabChange('gallery')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              activeTab === 'gallery'
                ? 'bg-primary text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            Gallery
          </button>
        </nav>
      </div>
      
      {activeTab === 'live' && (
        <div className="bg-accent/10 border-b border-accent/20 px-4 py-2 text-center text-xs text-accent">
          <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
          Streaming live from Pollinations.ai
        </div>
      )}
    </header>
  );
}