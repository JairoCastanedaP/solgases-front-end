import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import { PRODUCT_CATALOG, findCategory, toCatalogItems } from '../../core/products/product-catalog';
import {
  SITE_SERVICE_CATALOG,
  featuredServiceCards,
} from '../../core/site-services/site-service-catalog';
import { servicesOfType } from '../../core/site-services/site-service-search';
import { HOME_GALLERY, HOME_PORTFOLIO } from './home.data';

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

describe('HomePage: portafolio', () => {
  const cards = (page: HTMLElement) => Array.from(page.querySelectorAll('.portfolio__card'));

  it('queda encima de "Te asesoramos", con cuatro tarjetas en el orden pedido', async () => {
    const page = await home();
    const section = page.querySelector('.portfolio')!;
    const collage = page.querySelector('app-image-gallery')!;

    expect(section.querySelector('h2')?.textContent).toBe('Portafolio de productos y soluciones');
    expect(
      section.compareDocumentPosition(collage) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(cards(page).map((c) => c.querySelector('h3')?.textContent)).toEqual([
      'Equipos contra incendio',
      'Venta de gases industriales',
      'Dotaciones',
      'Equipos de carretera',
    ]);
  });

  it('enlaza a filtros y páginas que existen, y cada filtro da resultados reales', async () => {
    const page = await home();
    const hrefs = cards(page).map((c) => c.getAttribute('href'));

    expect(hrefs).toEqual([
      '/servicios?tipo=Recarga%20de%20extintores',
      '/servicios?tipo=Llenado%20de%20gases',
      '/productos',
      '/productos?categoria=seguridad-vial',
    ]);
    expect(servicesOfType('Recarga de extintores').length).toBeGreaterThan(0);
    expect(servicesOfType('Llenado de gases').length).toBeGreaterThan(0);
    expect(findCategory('seguridad-vial')).toBeDefined();
  });

  it('las imágenes son del catálogo, con su texto alternativo', async () => {
    const page = await home();

    for (const { image } of HOME_PORTFOLIO) {
      const known = [
        ...PRODUCT_CATALOG.products.map((p) => p.image.src),
        ...SITE_SERVICE_CATALOG.services.map((s) => s.image.src),
      ];
      expect(known).toContain(image.src);
      expect(page.querySelector(`.portfolio img[alt="${image.alt}"]`), image.src).not.toBeNull();
    }
  });

  it('lo que describe cada tarjeta existe en los datos', () => {
    const names = (re: RegExp) => PRODUCT_CATALOG.products.filter((p) => re.test(p.name)).length;
    const services = (re: RegExp) =>
      SITE_SERVICE_CATALOG.services.filter((s) => re.test(s.name)).length;

    for (const [label, count] of [
      ['extintores', names(/extintor/i)],
      ['soportes', names(/soporte/i)],
      ['camisas', names(/camisa/i)],
      ['guantes', names(/guante/i)],
      ['botas', names(/botas/i)],
      ['conos', names(/cono/i)],
      ['señalización', names(/señal/i)],
      ['recarga', services(/recarga de extintor/i)],
    ] as const) {
      expect(count, label).toBeGreaterThan(0);
    }
    for (const gas of [/nitr/i, /ox[ií]geno/i, /acetileno/i, /arg[oó]n/i, /mezcla/i]) {
      expect(services(gas), gas.source).toBeGreaterThan(0);
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
    expect(Array.from(about.querySelectorAll('li')).map((li) => li.textContent)).toEqual([
      'Prevención de accidentes.',
      'Seguridad en el trabajo.',
      'Cumplimiento de las normas.',
      'Asesoría según tus necesidades.',
      'Elementos de protección personal, recarga de extintores y llenado de gases.',
    ]);
    expect(text).not.toMatch(/garant|certific|gratis|cobertura|horas|calificaci/i);
    expect(text.match(/\d+/g)).toBeNull();
    expect(about.querySelector('img')!.getAttribute('alt')).toContain('Sogamoso');
  });
});
