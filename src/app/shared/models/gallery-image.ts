/** Imagen de galería; `size` corresponde a las clases gallery__img--big / --small. */
export interface GalleryImage {
  readonly src: string;
  readonly size: 'big' | 'small';
}
