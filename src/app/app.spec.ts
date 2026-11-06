import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter, Router, withInMemoryScrolling } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { App } from './app';
import { routes } from './app.routes';

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
  });

  const pages: [path: string, banner: string, title: string][] = [
    ['/', 'Su mejor opción en Seguridad Industrial en Sogamoso', 'Solgases'],
    ['/nosotros', '', 'Nosotros | Solgases'],
    ['/productos', 'Nuestros Productos', 'Productos | Solgases'],
    ['/servicios', 'Nuestros Servicios', 'Servicios | Solgases'],
    ['/bioseguridad', 'Bioseguridad', 'Bioseguridad | Solgases'],
    ['/contacto', 'Dejanos un mensaje', 'Contacto | Solgases'],
  ];

  for (const [path, banner, title] of pages) {
    it(`muestra la página ${path} con su banner y título`, async () => {
      const harness = await RouterTestingHarness.create(path);
      const el = harness.routeNativeElement as HTMLElement;

      expect(el.querySelector('.banner__content')?.textContent?.trim()).toBe(banner);
      expect(el.querySelector('main.main')).not.toBeNull();
      expect(TestBed.inject(Title).getTitle()).toBe(title);
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
