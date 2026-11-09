import { PRODUCT_CATALOG } from './product-catalog';
import { AUTHENTIC_RATINGS, productRatingView, ratingView } from './product-rating';

describe('Valoraciones de producto', () => {
  it('no hay valoraciones inventadas: cada producto dice "Sin calificaciones"', () => {
    expect(Object.keys(AUTHENTIC_RATINGS)).toEqual([]);
    for (const { id } of PRODUCT_CATALOG.products) {
      expect(productRatingView(id)).toEqual({ stars: '☆☆☆☆☆', label: 'Sin calificaciones' });
    }
  });

  it('un producto sin reseñas no muestra estrellas calificadas', () => {
    expect(ratingView({ average: 5, count: 0 }).label).toBe('Sin calificaciones');
  });

  it('queda preparado para valoraciones auténticas', () => {
    expect(ratingView({ average: 4.5, count: 12 })).toEqual({
      stars: '★★★★★',
      label: '4,5 de 5 (12 reseñas)',
    });
    expect(ratingView({ average: 3.2, count: 1 })).toEqual({
      stars: '★★★☆☆',
      label: '3,2 de 5 (1 reseña)',
    });
  });
});
