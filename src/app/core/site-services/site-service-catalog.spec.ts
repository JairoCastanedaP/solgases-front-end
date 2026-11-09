import { optimizedImage } from '../../shared/images/optimized-image';
import {
  SITE_SERVICE_CATALOG,
  featuredServiceCards,
  findServiceBySlug,
  serviceCards,
} from './site-service-catalog';
import { SERVICE_NOT_FOUND_SEO, buildServiceSeo } from './site-service-seo';

const { services, featured } = SITE_SERVICE_CATALOG;

describe('Catálogo de servicios (site-services.json)', () => {
  it('conserva los 18 servicios del sitio, con sus nombres y su orden', () => {
    expect(services.map((s) => s.name)).toEqual([
      'Llenado de Nitrógeno(N)',
      'Llenado Oxígeno(O) Industrial',
      'Recarga de extintor de 5 libras',
      'Reparación regulador Oxígeno',
      'Recarga de extintor de 10 libras',
      'Recarga de Acumulador',
      'Reparación regulador Acetileno',
      'Recarga de extintor Agua a Presión',
      'Llenado de Acetileno',
      'Recarga de extintor de 20 libras',
      'Revisión Equipos de soldar',
      'Llenado de Argón(Ar)',
      'Recarga de extintor satelite',
      'Recarga de extintor de CO2',
      'Recarga de extintor de Solkaflam',
      'Recarga de extintor Tipo K',
      'Llenado de Mezcla(Ar+Co2)',
      'Alquiler de Cilindros',
    ]);
  });

  it('tiene id y slug únicos, y slugs válidos para una URL', () => {
    expect(new Set(services.map((s) => s.id)).size).toBe(services.length);
    expect(new Set(services.map((s) => s.slug)).size).toBe(services.length);
    for (const { slug } of services) {
      expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it('cada imagen tiene versión optimizada y texto alternativo propio', () => {
    for (const { slug, image, gallery } of services) {
      for (const { src, alt } of [image, ...(gallery ?? [])]) {
        expect(() => optimizedImage(src), slug).not.toThrow();
        expect(alt.trim().length, src).toBeGreaterThan(10);
      }
    }
  });

  it('cada servicio tiene resumen, descripción y detalles', () => {
    for (const { slug, summary, description, details } of services) {
      expect(description, slug).toContain(summary);
      expect(details[0]?.label, slug).toBe('Tipo de servicio');
    }
  });

  it('no incluye precios, garantías ni otros datos sin respaldo en el sitio', () => {
    for (const service of services) {
      const { image, gallery, notes, ...texts } = service;
      expect(Object.keys(service), service.slug).not.toContain('price');
      expect(JSON.stringify(texts), service.slug).not.toMatch(
        /\$|COP|precio|garant|certific|horas|minutos|ficticio/i,
      );
    }
  });

  it('las notas conservan la condición de domicilio del sitio original', () => {
    const delivery =
      'Para el transporte de tanques o gran cantidad de mercancía ofrecemos el domicilio sin ningún costo adicional siempre y cuando sea dentro del municipio';
    const withNotes = services.filter((s) => s.notes);

    expect(withNotes.map((s) => s.slug)).toEqual([
      'llenado-nitrogeno',
      'llenado-oxigeno-industrial',
      'llenado-acetileno',
      'llenado-argon',
      'llenado-mezcla-argon-co2',
      'alquiler-cilindros',
    ]);
    for (const { notes } of withNotes) {
      expect(notes).toEqual([delivery]);
    }
  });

  it('construye las tarjetas con enlace y conserva los destacados del inicio', () => {
    expect(serviceCards().length).toBe(18);
    expect(serviceCards()[0]).toMatchObject({
      title: 'Llenado de Nitrógeno(N)',
      link: '/servicios/llenado-nitrogeno',
    });

    const cards = featuredServiceCards();
    expect(cards.length).toBe(12);
    expect(featured.filter((id) => !findServiceBySlug(id))).toEqual([]);
    // La repetición ya existía en el inicio original y se conserva.
    expect(cards.filter((c) => c.title === 'Recarga de extintor de 5 libras').length).toBe(2);
  });

  it('busca por slug', () => {
    expect(findServiceBySlug('alquiler-cilindros')?.name).toBe('Alquiler de Cilindros');
    expect(findServiceBySlug('no-existe')).toBeUndefined();
    expect(findServiceBySlug(null)).toBeUndefined();
  });

  it('genera título y descripción SEO únicos y de longitud razonable', () => {
    const seo = services.map(buildServiceSeo);
    expect(new Set(seo.map((s) => s.title)).size).toBe(services.length);
    expect(new Set(seo.map((s) => s.description)).size).toBe(services.length);
    for (const { title, description, path } of seo) {
      expect(path).toMatch(/^servicios\/[a-z0-9-]+$/);
      expect(title.length, title).toBeLessThanOrEqual(60);
      expect(description.length, description).toBeGreaterThanOrEqual(70);
      expect(description.length, description).toBeLessThanOrEqual(160);
    }
    expect(SERVICE_NOT_FOUND_SEO.noindex).toBe(true);
  });
});
