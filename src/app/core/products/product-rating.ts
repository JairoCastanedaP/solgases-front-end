/** Valoración auténtica de un producto: promedio de 0 a 5 y número de reseñas reales. */
export interface ProductRating {
  readonly average: number;
  readonly count: number;
}

export interface RatingView {
  /** Cinco estrellas de texto, decorativas: `label` es su equivalente accesible. */
  readonly stars: string;
  readonly label: string;
}

/**
 * Punto único de configuración de las valoraciones, por `id` de producto. Está vacío porque Solgases
 * aún no tiene reseñas: añade aquí solo datos reales, nunca valores de ejemplo.
 */
export const AUTHENTIC_RATINGS: Readonly<Record<string, ProductRating>> = {};

const MAX_STARS = 5;

export function ratingView(rating?: ProductRating): RatingView {
  if (!rating || rating.count <= 0) {
    return { stars: '☆'.repeat(MAX_STARS), label: 'Sin calificaciones' };
  }
  const filled = Math.min(MAX_STARS, Math.max(0, Math.round(rating.average)));
  const average = rating.average.toLocaleString('es-CO', { maximumFractionDigits: 1 });
  const reviews = rating.count === 1 ? '1 reseña' : `${rating.count} reseñas`;
  return {
    stars: '★'.repeat(filled) + '☆'.repeat(MAX_STARS - filled),
    label: `${average} de ${MAX_STARS} (${reviews})`,
  };
}

export function productRatingView(productId: string): RatingView {
  return ratingView(AUTHENTIC_RATINGS[productId]);
}
