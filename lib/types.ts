// Interfaces matching the Cosmic Content Model

export interface CosmicObject {
    id: string;
    slug: string;
    title: string;
    type: string;
    metadata: Record<string, any>;
    created_at: string;
    modified_at: string;
}

export interface Tag extends CosmicObject {
    type: 'tags';
    metadata: {
      name: string;
      description?: string;
      color?: string;
      usage_count?: number;
    };
}

export type ImageStatus = 'Active' | 'Featured' | 'Archived';

export interface ImagePost extends CosmicObject {
    type: 'images';
    metadata: {
      image_url: string;
      thumbnail?: {
        url: string;
        imgix_url: string;
      };
      prompt?: string;
      tags?: Tag[];
      seed?: number;
      status?: ImageStatus;
      created_at?: string;
    };
}

export interface Settings extends CosmicObject {
    type: 'settings';
    metadata: {
      image_shelf: string;
      description?: string;
      feed_url: string;
      images_per_page?: number;
      feed_update_interval?: number;
      enable_auto_tagging?: boolean;
    };
}

// Pollinations.ai feed data structure
export interface PollinationsImage {
    imageURL: string;
    prompt: string;
    seed: number;
    width?: number;
    height?: number;
    model?: string;
    nologo?: boolean;
    nofeed?: boolean;
    safe?: boolean;
    enhance?: boolean;
    quality?: string;
    status?: string;
}