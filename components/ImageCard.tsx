import { ImagePost, PollinationsImage } from '@/lib/types';
import { Download, Save, ExternalLink } from 'lucide-react';
import { useState } from 'react';

interface ImageCardProps {
  data: ImagePost | PollinationsImage;
  type: 'stored' | 'live';
  onSave?: (image: PollinationsImage) => void;
}

export default function ImageCard({ data, type, onSave }: ImageCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Normalize data access
  const imageUrl = type === 'stored' 
    ? (data as ImagePost).metadata.image_url 
    : (data as PollinationsImage).imageURL;
    
  const prompt = type === 'stored' 
    ? (data as ImagePost).metadata.prompt 
    : (data as PollinationsImage).prompt;

  // Use imgix params for optimization if it's a Cosmic stored image
  const displayUrl = type === 'stored' && (data as ImagePost).metadata.thumbnail?.imgix_url
    ? `${(data as ImagePost).metadata.thumbnail?.imgix_url}?w=600&h=600&fit=crop&auto=format`
    : imageUrl;

  const handleSave = async () => {
    if (type !== 'live' || !onSave) return;
    
    setIsSaving(true);
    try {
      await onSave(data as PollinationsImage);
    } catch (error) {
      console.error('Failed to save', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div 
      className="relative group rounded-xl overflow-hidden bg-card border border-border shadow-lg transition-all duration-300 hover:shadow-primary/20 hover:border-primary/50 animate-fade-in break-inside-avoid mb-4"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="aspect-auto w-full relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={displayUrl}
          alt={prompt || 'AI Generated Image'}
          className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <p className="text-white text-sm line-clamp-3 mb-3 font-medium">
              {prompt}
            </p>
            
            <div className="flex items-center justify-between gap-2">
              <div className="flex gap-2">
                {type === 'live' && onSave && (
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                      isSaving 
                        ? 'bg-green-600 text-white cursor-wait' 
                        : 'bg-primary hover:bg-primary/90 text-white'
                    }`}
                  >
                    <Save className="w-3 h-3" />
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                )}
                
                <a
                  href={imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-secondary hover:bg-secondary/80 text-white text-xs font-medium transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  Open
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Type Badge */}
      <div className="absolute top-2 right-2">
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
          type === 'live' 
            ? 'bg-red-500/80 text-white backdrop-blur-sm' 
            : 'bg-accent/80 text-white backdrop-blur-sm'
        }`}>
          {type === 'live' ? 'Live' : 'Saved'}
        </span>
      </div>
    </div>
  );
}