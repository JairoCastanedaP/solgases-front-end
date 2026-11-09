import { ImageLoaderConfig } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import manifest from './optimized-images.json';

/**
 * Versión optimizada de una imagen de public/img (generada por `npm run optimize:images`).
 * `width`/`height` son las dimensiones reales del archivo servido; NgOptimizedImage las usa
 * para reservar el espacio y evitar saltos de layout.
 */
export interface OptimizedImage {
  /** Ruta del archivo; en banners contiene `{w}` y se resuelve con `bannerImageLoader`. */
  readonly src: string;
  readonly width: number;
  readonly height: number;
  /** Solo banners: anchos disponibles para el `srcset` responsivo. */
  readonly widths?: readonly number[];
}

const images: Readonly<Record<string, OptimizedImage>> = manifest;

export function optimizedImage(original: string): OptimizedImage {
  const image = images[original];
  if (!image) {
    throw new Error(
      `Imagen sin versión optimizada: ${original}. Ejecuta "npm run optimize:images".`,
    );
  }
  return image;
}

/**
 * Imagen de un solo tamaño para una tarjeta. Una foto registrada como banner tiene `{w}` en su ruta,
 * que solo resuelve `bannerImageLoader`: aquí se elige la variante para que el archivo exista.
 */
export function cardImage(original: string, preferredWidth = 640): OptimizedImage {
  const image = optimizedImage(original);
  if (!image.widths) {
    return image;
  }
  const width = image.widths.includes(preferredWidth) ? preferredWidth : image.widths[0];
  return {
    src: image.src.replace('{w}', String(width)),
    width,
    height: Math.round((image.height * width) / image.width),
  };
}

/** `ngSrcset` para un banner, p. ej. "640w, 1280w, 1920w". */
export function bannerSrcset(image: OptimizedImage): string {
  return (image.widths ?? [image.width]).map((w) => `${w}w`).join(', ');
}

/**
 * Loader de NgOptimizedImage para banners: elige la variante WebP según el ancho pedido.
 * Sin ancho (atributo `src` de respaldo) usa `loaderParams.fallbackWidth`, la variante mayor.
 */
export function bannerImageLoader({ src, width, loaderParams }: ImageLoaderConfig): string {
  const w = width ?? (loaderParams?.['fallbackWidth'] as number | undefined);
  if (!w) {
    throw new Error(`Falta el ancho para el banner ${src}`);
  }
  // encodeURI: algunos nombres tienen espacios, que en `srcset` separarían la URL del descriptor.
  return encodeURI(src.replace('{w}', String(w)));
}

@Pipe({ name: 'optimizedImage' })
export class OptimizedImagePipe implements PipeTransform {
  transform(original: string): OptimizedImage {
    return optimizedImage(original);
  }
}
