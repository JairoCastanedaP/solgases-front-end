import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter, Router, withInMemoryScrolling } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { App } from './app';
import { routes } from './app.routes';
import { PUBLIC_PAGES } from './core/seo/public-pages';

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
    expect(el.querySelector('.main-header')?.textContent).toContain('(038) 772 86 66');
    expect(el.querySelectorAll('app-whatsapp-button').length).toBe(1);
  });

  const pages: [path: string, banner: string, title: string][] = [
    ['/', 'Su mejor opción en Seguridad Industrial en Sogamoso', PUBLIC_PAGES.home.title],
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
      '/productos': 76,
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
