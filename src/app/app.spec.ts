import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter, Router, withInMemoryScrolling } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { App } from './app';
import { routes } from './app.routes';
import { CATALOG_SHORTCUTS, NAV_ITEMS } from './core/navigation';
import { PRODUCT_CATALOG } from './core/products/product-catalog';
import { PUBLIC_PAGES } from './core/seo/public-pages';
import { SITE_INFO } from './core/site-info';

describe('App', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes, withInMemoryScrolling())],
    });
  });

  it('renderiza encabezado, menú y pie con los datos de contacto', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('.logo')?.textContent).toContain('Solgases');
    expect(el.querySelectorAll('.menu__link').length).toBe(6);
    expect(el.querySelector('.main-footer')?.textContent).toContain('solgases@gmail.com');
    expect(el.querySelector('.main-header')?.textContent).toContain('(608) 772 86 66');
    expect(el.querySelectorAll('app-floating-contact').length).toBe(1);
  });

  it('no hay accesos ni rutas de cuenta de usuario', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.textContent).not.toMatch(/Iniciar sesión|Crear cuenta|Próximamente/);
    expect(el.querySelector('.account')).toBeNull();
    expect(el.querySelectorAll('.menu__link').length).toBe(6);
    const paths = routes.map((r) => r.path);
    for (const path of ['login', 'iniciar-sesion', 'registro', 'crear-cuenta', 'cuenta']) {
      expect(paths).not.toContain(path);
    }
  });

  describe('pie de página', () => {
    const footer = async () => {
      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();
      return (fixture.nativeElement as HTMLElement).querySelector('.main-footer')!;
    };

    it('enlaza cada página del menú y cada categoría del catálogo', async () => {
      const hrefs = Array.from((await footer()).querySelectorAll('a')).map((a) =>
        a.getAttribute('href'),
      );

      for (const { path } of NAV_ITEMS) {
        expect(hrefs, path).toContain(path);
      }
      for (const { id } of PRODUCT_CATALOG.categories) {
        expect(hrefs, id).toContain(`/productos?categoria=${id}`);
      }
    });

    it('los atajos coinciden con las categorías del JSON', () => {
      expect(CATALOG_SHORTCUTS).toEqual(
        PRODUCT_CATALOG.categories.map(({ id, name }) => ({ id, label: name })),
      );
    });

    it('todo enlace tiene destino y texto, y el contacto usa los datos del sitio', async () => {
      const el = await footer();

      for (const link of Array.from(el.querySelectorAll('a'))) {
        expect(link.getAttribute('href'), link.textContent!).toBeTruthy();
        expect(link.textContent?.trim()).toBeTruthy();
      }
      expect(el.querySelector('a[href^="mailto:"]')?.getAttribute('href')).toBe(
        `mailto:${SITE_INFO.email}`,
      );
      expect(el.textContent).toContain(SITE_INFO.phone);
      expect(el.textContent).toContain(SITE_INFO.address);
      expect(el.textContent).toContain(SITE_INFO.copyright);
    });

    it('muestra los cuatro logos de public/icons y Nequi, sin enlaces', async () => {
      const section = (await footer()).querySelector('[aria-labelledby="pie-pagos"]')!;
      const images = Array.from(section.querySelectorAll('img'));

      expect(section.querySelector('h2')?.textContent).toBe('Medios de pago');
      expect(images.map((i) => i.getAttribute('src'))).toEqual([
        'icons/Bre-B.webp',
        'icons/BANCOLOMBIA.webp',
        'icons/Davivienda.webp',
        'icons/money-cash-icon-png.webp',
      ]);
      expect(images.map((i) => i.getAttribute('alt'))).toEqual([
        'Logo de Bre-B',
        'Logo de Bancolombia',
        'Logo de Daviplata',
        'Fajo de billetes: pago en efectivo',
      ]);
      for (const image of images) {
        expect(image.getAttribute('width')).toMatch(/^\d+$/);
        expect(image.getAttribute('height')).toMatch(/^\d+$/);
      }
      expect(section.querySelector('li:not(:has(img))')?.textContent?.trim()).toBe('Nequi');
      expect(section.querySelector('a')).toBeNull();
    });

    it('el año del copyright es el actual, sin build de por medio', async () => {
      vi.useFakeTimers({ toFake: ['Date'] });
      try {
        for (const year of [2031, 2032]) {
          vi.setSystemTime(new Date(year, 5, 15));
          const el = await footer();
          expect(el.querySelector('.copy')!.textContent!.replace(/\s+/g, ' ').trim()).toBe(
            `${year} | Todos los derechos reservados`,
          );
        }
      } finally {
        vi.useRealTimers();
      }
    });
  });

  const pages: [path: string, banner: string, title: string][] = [
    ['/', 'Su mejor opción en Seguridad Industrial en Sogamoso, Boyacá', PUBLIC_PAGES.home.title],
    ['/nosotros', '', PUBLIC_PAGES.nosotros.title],
    ['/productos', 'Nuestros Productos', PUBLIC_PAGES.productos.title],
    ['/servicios', 'Nuestros Servicios', PUBLIC_PAGES.servicios.title],
    ['/bioseguridad', 'Bioseguridad', PUBLIC_PAGES.bioseguridad.title],
    ['/contacto', 'Dejanos un mensaje', PUBLIC_PAGES.contacto.title],
  ];

  for (const [path, banner, title] of pages) {
    it(`muestra la página ${path} con su banner, título y un único <h1>`, async () => {
      const harness = await RouterTestingHarness.create(path);
      const page = harness.routeNativeElement as HTMLElement;
      const app = harness.fixture.nativeElement as HTMLElement;

      expect(page.querySelector('.banner__content')?.textContent?.trim()).toBe(banner);
      expect(page.querySelector('main.main')).not.toBeNull();
      expect(TestBed.inject(Title).getTitle()).toBe(title);
      expect(app.querySelectorAll('h1').length).toBe(1);
    });

    it(`en ${path} prioriza la imagen del banner y difiere el resto`, async () => {
      const harness = await RouterTestingHarness.create(path);
      const images = Array.from(
        (harness.routeNativeElement as HTMLElement).querySelectorAll('img'),
      );
      const [banner, ...rest] = images;

      expect(banner.classList).toContain('banner__img');
      expect(banner.getAttribute('fetchpriority')).toBe('high');
      expect(banner.getAttribute('loading')).toBe('eager');
      expect(banner.getAttribute('srcset')).toMatch(/\.webp 640w/);
      for (const img of [banner, ...rest]) {
        expect(img.getAttribute('width'), img.src).toMatch(/^\d+$/);
        expect(img.getAttribute('height'), img.src).toMatch(/^\d+$/);
      }
      for (const img of rest) {
        expect(img.getAttribute('loading'), img.src).toBe('lazy');
        // Solo el banner (con texto superpuesto) es decorativo.
        expect(img.getAttribute('alt')?.trim(), img.src).toBeTruthy();
      }
    });
  }

  it('cuenta los productos y servicios migrados por página', async () => {
    const counts: Record<string, number> = {
      '/': 32,
      '/productos': 94,
      '/servicios': 18,
      '/bioseguridad': 20,
    };
    const harness = await RouterTestingHarness.create();
    for (const [path, expected] of Object.entries(counts)) {
      await harness.navigateByUrl(path);
      const el = harness.routeNativeElement as HTMLElement;
      expect(el.querySelectorAll('.today-special .column').length, path).toBe(expected);
    }
  });

  it('redirige las URLs .html del sitio anterior', async () => {
    const harness = await RouterTestingHarness.create();
    const router = TestBed.inject(Router);

    await harness.navigateByUrl('/productos.html');
    expect(router.url).toBe('/productos');

    await harness.navigateByUrl('/index.html');
    expect(router.url).toBe('/');

    await harness.navigateByUrl('/galeria.html');
    expect(router.url).toBe('/');
  });
});
