import { NextResponse } from 'next/server';
import { cosmic } from '@/lib/cosmic';
import { PollinationsImage } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const imageData: PollinationsImage = await request.json();
    
    // Simple validation
    if (!imageData.imageURL || !imageData.prompt) {
      return NextResponse.json(
        { error: 'Invalid image data' },
        { status: 400 }
      );
    }

    // Attempt to auto-tag based on prompt words
    // Fetch all tags to compare
    let tagsToConnect: string[] = [];
    try {
      const { objects: allTags } = await cosmic.objects
        .find({ type: 'tags' })
        .props('id,slug,metadata.name')
        .limit(100);

      if (allTags) {
        // Simple keyword matching
        const promptLower = imageData.prompt.toLowerCase();
        tagsToConnect = allTags
          .filter((tag: any) => promptLower.includes(tag.metadata.name.toLowerCase()))
          .map((tag: any) => tag.id);
      }
    } catch (e) {
      console.log('Tag matching failed, proceeding without tags');
    }

    // Create the object in Cosmic
    const newImage = await cosmic.objects.insertOne({
      title: imageData.prompt.slice(0, 50) + (imageData.prompt.length > 50 ? '...' : ''),
      type: 'images',
      metadata: {
        image_url: imageData.imageURL,
        prompt: imageData.prompt,
        seed: imageData.seed,
        status: 'Active', // Default status matching CMS model
        tags: tagsToConnect,
        created_at: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      },
    });

    return NextResponse.json({ success: true, object: newImage });
  } catch (error) {
    console.error('Error saving to Cosmic:', error);
    return NextResponse.json(
      { error: 'Failed to save image to CMS' },
      { status: 500 }
    );
  }
}