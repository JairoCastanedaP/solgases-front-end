import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import { PRODUCT_CATALOG, toCatalogItems } from '../../core/products/product-catalog';
import { featuredServiceCards } from '../../core/site-services/site-service-catalog';
import { HOME_GALLERY } from './home.data';

const TITLE = 'Te asesoramos según tus necesidades y la normativa';

async function home() {
  TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
  const harness = await RouterTestingHarness.create('/');
  return harness.routeNativeElement as HTMLElement;
}

describe('HomePage: carruseles', () => {
  it('muestra productos y servicios relevantes en carruseles, sin cuadrículas', async () => {
    const page = await home();
    const carousels = Array.from(page.querySelectorAll('app-card-carousel'));

    expect(page.querySelector('app-product-grid')).toBeNull();
    expect(carousels.map((c) => c.querySelector('h2')?.textContent)).toEqual([
      'Productos Relevantes',
      'Servicios Relevantes',
    ]);
  });

  it('conserva cada enlace a su detalle, una sola vez y con su imagen', async () => {
    const page = await home();
    const [products, services] = Array.from(page.querySelectorAll('app-card-carousel'));
    const hrefs = (el: Element) =>
      Array.from(el.querySelectorAll('a')).map((a) => a.getAttribute('href'));

    expect(hrefs(products)).toEqual(
      toCatalogItems(PRODUCT_CATALOG.featured).map((item) => item.link),
    );
    expect(hrefs(services)).toEqual(featuredServiceCards().map((item) => item.link));
    for (const item of [...toCatalogItems(PRODUCT_CATALOG.featured), ...featuredServiceCards()]) {
      const card = page.querySelector(`a[href="${item.link}"]`)!;
      expect(card.querySelector('img')!.getAttribute('alt'), item.link).toBe(item.alt);
    }
  });
});

describe('HomePage: collage de asesoría', () => {
  it('aparece una sola vez, con su texto y todas sus imágenes', async () => {
    const page = await home();
    const titles = Array.from(page.querySelectorAll('h2')).filter(
      (h2) => h2.textContent?.trim() === TITLE,
    );

    expect(page.querySelectorAll('app-image-gallery').length).toBe(1);
    expect(titles.length).toBe(1);
    expect(page.querySelectorAll('.gallery__img').length).toBe(HOME_GALLERY.flat().length);
    for (const { alt } of HOME_GALLERY.flat()) {
      expect(page.querySelectorAll(`img[alt="${alt}"]`).length, alt).toBe(1);
    }
  });

  it('queda encima de los productos relevantes', async () => {
    const page = await home();
    const collage = page.querySelector('app-image-gallery')!;
    const products = page.querySelector('app-card-carousel')!;

    expect(products.querySelector('h2')?.textContent).toContain('Productos Relevantes');
    expect(
      collage.compareDocumentPosition(products) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it('no lleva botón de contacto encima, y el del texto de Sogamoso sigue', async () => {
    const page = await home();

    expect(page.querySelector('app-image-gallery a[href="/contacto"]')).toBeNull();
    expect(page.querySelectorAll('a[href="/contacto"]').length).toBe(1);
    expect(page.querySelector('.home-about a[href="/contacto"]')).not.toBeNull();
  });

  it('el texto de Sogamoso conserva su contenido, sin cifras ni premios nuevos', async () => {
    const about = (await home()).querySelector('.home-about')!;
    const text = about.textContent!.replace(/\s+/g, ' ');

    expect(about.querySelector('h3')!.textContent!.replace(/\s+/g, ' ').trim()).toBe(
      'Contamos con más de dos décadas de experiencia en seguridad Industrial en Sogamoso',
    );
    for (const goal of ['prevención de accidentes', 'seguridad en el trabajo', 'cumplimiento']) {
      expect(text).toContain(goal);
    }
    expect(text.match(/\d+/g)).toBeNull();
    expect(about.querySelector('img')!.getAttribute('alt')).toContain('Sogamoso');
  });
});
