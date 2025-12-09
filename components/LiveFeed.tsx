'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2, Save, Pause, Play, RefreshCw, X } from 'lucide-react';
import { PollinationsImage } from '@/lib/types';

interface LiveFeedProps {
  feedUrl: string;
}

export default function LiveFeed({ feedUrl }: LiveFeedProps) {
  const [images, setImages] = useState<PollinationsImage[]>([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Maximum number of images to keep in the live feed buffer
  const MAX_BUFFER = 50;

  const connectToFeed = useCallback(() => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Close existing connection if any
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const eventSource = new EventSource(feedUrl);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        setIsLoading(false);
        setError(null);
        console.log('Connected to Pollinations feed');
      };

      eventSource.onmessage = (event) => {
        if (!isPlaying) return;

        try {
          const data = JSON.parse(event.data) as PollinationsImage;
          
          if (data && data.imageURL) {
            setImages((prev) => {
              // Add new image to the front and limit buffer size
              const newImages = [data, ...prev];
              return newImages.slice(0, MAX_BUFFER);
            });
          }
        } catch (err) {
          console.error('Error parsing feed data:', err);
        }
      };

      eventSource.onerror = (err) => {
        console.error('EventSource error:', err);
        setError('Connection lost. Retrying...');
        eventSource.close();
        
        // Attempt reconnect after delay
        setTimeout(() => {
          if (isPlaying) connectToFeed();
        }, 3000);
      };

    } catch (err) {
      console.error('Error connecting to feed:', err);
      setError('Failed to initiate connection');
      setIsLoading(false);
    }
  }, [feedUrl, isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      connectToFeed();
    } else {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      setIsLoading(false);
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [isPlaying, connectToFeed]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSaveImage = async (image: PollinationsImage) => {
    try {
      // Use imageURL as a unique ID for tracking saving state
      setSavingId(image.imageURL);
      
      const response = await fetch('/api/save-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(image),
      });

      if (!response.ok) {
        throw new Error('Failed to save image');
      }

      const result = await response.json();
      console.log('Image saved successfully:', result);
      
      // Could verify success with a toast notification here
      
    } catch (err) {
      console.error('Error saving image:', err);
      alert('Failed to save image. Please try again.');
    } finally {
      setSavingId(null);
    }
  };

  const clearFeed = () => {
    setImages([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card p-4 rounded-lg border border-border">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${isPlaying && !error ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <h3 className="font-medium">
            {error ? error : isPlaying ? 'Live Feed Active' : 'Feed Paused'}
          </h3>
          <span className="text-xs text-muted-foreground px-2 py-1 bg-secondary rounded-full">
            {images.length} in buffer
          </span>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={togglePlay}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              isPlaying 
                ? 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20' 
                : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
            }`}
          >
            {isPlaying ? <><Pause size={16} /> Pause</> : <><Play size={16} /> Resume</>}
          </button>
          
          <button
            onClick={clearFeed}
            className="flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors"
            title="Clear Buffer"
          >
            <X size={16} /> Clear
          </button>
        </div>
      </div>

      {isLoading && images.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Loader2 size={40} className="animate-spin mb-4 text-primary" />
          <p>Connecting to Pollinations AI stream...</p>
          <p className="text-sm mt-2 opacity-60">Waiting for first image generation</p>
        </div>
      )}

      {images.length === 0 && !isLoading && !error && (
        <div className="text-center py-20 text-muted-foreground border-2 border-dashed border-border rounded-xl">
          <p>No images in buffer. Click "Resume" to start receiving images.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {images.map((img, index) => (
          <div 
            key={`${img.imageURL}-${index}`} 
            className="group relative bg-card rounded-xl overflow-hidden shadow-lg border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-primary/10"
          >
            <div className="aspect-square relative overflow-hidden bg-secondary/30">
              <img 
                src={img.imageURL} 
                alt={img.prompt} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <button
                  onClick={() => handleSaveImage(img)}
                  disabled={savingId === img.imageURL}
                  className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition-colors ${
                    savingId === img.imageURL 
                      ? 'bg-primary/50 cursor-wait' 
                      : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                  }`}
                >
                  {savingId === img.imageURL ? (
                    <><RefreshCw size={16} className="animate-spin" /> Saving...</>
                  ) : (
                    <><Save size={16} /> Save to Gallery</>
                  )}
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <p className="text-sm line-clamp-2 text-card-foreground/90 group-hover:text-primary transition-colors">
                {img.prompt}
              </p>
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-mono bg-secondary/50 px-1.5 py-0.5 rounded">Seed: {img.seed}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}