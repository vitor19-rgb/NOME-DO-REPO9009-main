// Alteramos a importação para usar um caminho relativo (../app/lib/...)
// Isso evita conflitos de módulos no Turbopack do Next.js
import data from '../app/lib/placeholder-images.json';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

export const PlaceHolderImages: ImagePlaceholder[] = data.placeholderImages;