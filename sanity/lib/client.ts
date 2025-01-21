import { createClient } from 'next-sanity';
import { apiVersion, dataset, projectId } from '../env';
import imageUrlBuilder from '@sanity/image-url'; // Import the image URL builder
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';// Type for the source

// Create the Sanity client instance
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true, // Set to false if statically generating pages, using ISR or tag-based revalidation
});

// Create the URL builder for images
const builder = imageUrlBuilder(client);

// urlFor function to generate image URLs
export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}
