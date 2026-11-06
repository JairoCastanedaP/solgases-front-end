/** Imagen de galería; `size` corresponde a las clases gallery__img--big / --small. */
export interface GalleryImage {
  readonly src: string;
  readonly size: 'big' | 'small';
  /** Descripción de la imagen (son fotos informativas, no decorativas). */
  readonly alt: string;
}
