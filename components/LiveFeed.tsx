'use client';

import { useEffect, useState, useRef } from 'react';
import { PollinationsImage } from '@/lib/types';
import ImageCard from './ImageCard';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';

interface LiveFeedProps {
  feedUrl: string;
}

export default function LiveFeed({ feedUrl }: LiveFeedProps) {
  const [images, setImages] = useState<PollinationsImage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isError, setIsError] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Connect to SSE stream
    const connect = () => {
      try {
        const eventSource = new EventSource(feedUrl);
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
          setIsConnected(true);
          setIsError(false);
          console.log('Connected to Pollinations.ai feed');
        };

        eventSource.onmessage = (event) => {
          try {
            const imageData = JSON.parse(event.data);
            if (imageData && imageData.imageURL) {
              setImages((prev) => {
                // Keep only last 50 images to prevent memory issues
                const newImages = [imageData, ...prev];
                return newImages.slice(0, 50);
              });
            }
          } catch (e) {
            console.error('Error parsing SSE data', e);
          }
        };

        eventSource.onerror = (err) => {
          console.error('SSE Error:', err);
          setIsConnected(false);
          setIsError(true);
          eventSource.close();
          
          // Retry connection after 5 seconds
          setTimeout(connect, 5000);
        };
      } catch (e) {
        console.error('Failed to create EventSource', e);
        setIsError(true);
      }
    };

    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [feedUrl]);

  const handleSaveImage = async (image: PollinationsImage) => {
    try {
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

      const data = await response.json();
      console.log('Image saved successfully:', data);
      alert('Image saved to gallery!');
    } catch (error) {
      console.error('Error saving image:', error);
      alert('Failed to save image. Check console for details.');
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          {isConnected ? (
            <Wifi className="text-green-500 w-5 h-5 animate-pulse" />
          ) : (
            <WifiOff className="text-red-500 w-5 h-5" />
          )}
          Real-time Stream
        </h2>
        <span className="text-xs text-gray-500 font-mono">
          {isConnected ? 'Receiving data...' : isError ? 'Connection lost. Retrying...' : 'Connecting...'}
        </span>
      </div>

      {images.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
          <p>Waiting for incoming images...</p>
        </div>
      )}

      <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
        {images.map((img, index) => (
          // Use index as part of key because seed/url might duplicate in stream
          <ImageCard 
            key={`${img.seed}-${index}`} 
            data={img} 
            type="live" 
            onSave={handleSaveImage}
          />
        ))}
      </div>
    </div>
  );
}