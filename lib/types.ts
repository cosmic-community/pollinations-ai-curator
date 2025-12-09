export interface Tag {
  id: string;
  slug: string;
  title: string;
  metadata: {
    name: string;
    description?: string;
    color?: string;
    usage_count?: number;
  };
}

export interface ImagePost {
  id: string;
  slug: string;
  title: string;
  metadata: {
    image_url: string;
    prompt: string;
    seed?: number;
    status?: 'Active' | 'Featured' | 'Archived';
    tags?: Tag[]; // Array of tag objects
    created_at?: string;
    thumbnail?: {
      url: string;
      imgix_url?: string;
    };
  };
}

export interface Settings {
  metadata: {
    image_shelf: string;
    description?: string;
    feed_url: string;
    images_per_page?: number;
    feed_update_interval?: number;
    enable_auto_tagging?: boolean;
  };
}

export interface PollinationsImage {
  imageURL: string;
  prompt: string;
  seed: number;
}