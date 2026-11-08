import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { Router, TitleStrategy, provideRouter, withInMemoryScrolling } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import { PRODUCT_CATALOG, findProductBySlug } from '../../core/products/product-catalog';
import { PRODUCT_NOT_FOUND_SEO, buildProductSeo } from '../../core/products/product-seo';
import { SeoTitleStrategy } from '../../core/seo/seo-title-strategy';
import { WHATSAPP_CONFIG_TOKEN, WhatsAppConfig } from '../../core/whatsapp.config';

const text = (element: Element | null | undefined) =>
  element?.textContent?.replace(/\s+/g, ' ').trim();

function setup(whatsApp: WhatsAppConfig = { phone: null, message: 'Hola' }) {
  TestBed.configureTestingModule({
    providers: [
      provideRouter(routes, withInMemoryScrolling()),
      { provide: TitleStrategy, useClass: SeoTitleStrategy },
      { provide: WHATSAPP_CONFIG_TOKEN, useValue: whatsApp },
    ],
  });
}

async function open(url: string): Promise<HTMLElement> {
  const harness = await RouterTestingHarness.create(url);
  return harness.routeNativeElement as HTMLElement;
}

describe('ProductoDetallePage', () => {
  afterEach(() => {
    TestBed.inject(DOCUMENT)
      .head.querySelectorAll('meta[name], meta[property]')
      .forEach((e) => e.remove());
  });

  it('muestra el nombre como único <h1>, las migas de pan y el enlace a su categoría', async () => {
    setup();
    const page = await open('/productos/guante-kodiak');

    expect(page.querySelectorAll('h1').length).toBe(1);
    expect(text(page.querySelector('h1'))).toBe('Guante Kodiak');
    expect(page.querySelector('main.main')).not.toBeNull();

    const crumbs = page.querySelector('nav[aria-label="Migas de pan"]')!;
    expect(Array.from(crumbs.querySelectorAll('li')).map(text)).toEqual([
      'Inicio',
      'Productos',
      'Guantes',
      'Guante Kodiak',
    ]);
    expect(crumbs.querySelector('[aria-current="page"]')?.textContent).toBe('Guante Kodiak');
    expect(crumbs.querySelector('a[href="/productos#guantes"]')).not.toBeNull();
    expect(page.querySelector('.product-detail__back')?.getAttribute('href')).toBe(
      '/productos#guantes',
    );
  });

  it('las categorías con página propia enlazan a ella, sin pasar por Productos', async () => {
    setup();
    const page = await open('/productos/alcohol');

    expect(Array.from(page.querySelectorAll('.breadcrumbs li')).map(text)).toEqual([
      'Inicio',
      'Bioseguridad',
      'Alcohol',
    ]);
    expect(page.querySelector('.product-detail__back')?.getAttribute('href')).toBe('/bioseguridad');
  });

  it('muestra la imagen principal con dimensiones, prioridad y texto alternativo', async () => {
    setup();
    const product = findProductBySlug('cono')!;
    const page = await open('/productos/cono');
    const img = page.querySelector<HTMLImageElement>('.product-detail__img')!;

    expect(img.getAttribute('alt')).toBe(product.image.alt);
    expect(img.getAttribute('src')).toMatch(/\.webp$/);
    expect(img.getAttribute('width')).toMatch(/^\d+$/);
    expect(img.getAttribute('height')).toMatch(/^\d+$/);
    expect(img.getAttribute('fetchpriority')).toBe('high');
  });

  it('tras cargar en el cliente, marca el precio como ficticio, con su unidad y el aviso visible', async () => {
    setup();
    const page = await open('/productos/guante-kodiak');
    const price = text(page.querySelector('.product-detail__price'));

    expect(price).toContain('Precio ficticio de demostración:');
    expect(price?.replace(/\s/g, ' ')).toContain('$ 30.000 COP');
    expect(price).toContain('por par');
    const notice = page.querySelector('.product-detail__notice')!;
    expect(notice.textContent).toBe(PRODUCT_CATALOG.notice);
    expect(page.querySelector('.product-detail__price .visually-hidden')).toBeNull();
  });

  it('muestra descripción, características, especificaciones y recomendaciones', async () => {
    setup();
    const product = findProductBySlug('respirador-3m-7501')!;
    const page = await open('/productos/respirador-3m-7501');
    const info = page.querySelector('.product-detail__info')!;

    expect(info.textContent).toContain(product.description);
    expect(Array.from(info.querySelectorAll('h2')).map(text)).toEqual([
      'Descripción',
      'Características',
      'Especificaciones',
      'Recomendaciones',
    ]);
    for (const value of [...product.features, ...product.recommendations]) {
      expect(info.textContent).toContain(value);
    }
    const specs = Array.from(info.querySelectorAll('dt')).map(text);
    expect(specs).toEqual(product.specifications.map((s) => s.label));
    expect(info.textContent).toContain('7501');
  });

  it('solo muestra la galería si existe, con carga diferida y texto alternativo', async () => {
    setup();
    const page = await open('/productos/cono');
    expect(page.querySelector('.product-detail__gallery')).toBeNull();
    TestBed.resetTestingModule();

    setup();
    const withGallery = await open('/productos/visor-guadanar');
    const images = withGallery.querySelectorAll('.product-detail__gallery img');
    expect(images.length).toBe(1);
    expect(images[0].getAttribute('loading')).toBe('lazy');
    expect(images[0].getAttribute('alt')).toBe(
      findProductBySlug('visor-guadanar')!.gallery![0].alt,
    );
  });

  it('con el número pendiente, el botón de WhatsApp sigue desactivado y lo explica', async () => {
    setup();
    const page = await open('/productos/cono');
    const button = page.querySelector<HTMLButtonElement>('button.product-detail__whatsapp')!;

    expect(page.querySelector('a.product-detail__whatsapp')).toBeNull();
    expect(button.getAttribute('aria-disabled')).toBe('true');
    expect(button.hasAttribute('disabled')).toBe(false);
    expect(
      page.querySelector(`#${button.getAttribute('aria-describedby')}`)?.textContent,
    ).toContain('Número de WhatsApp pendiente de configurar');
    expect(page.querySelector('a[href="/contacto"]')).not.toBeNull();
  });

  it('con número configurado, enlaza a WhatsApp con un mensaje sobre el producto', async () => {
    setup({ phone: '573001234567', message: 'Hola' });
    const page = await open('/productos/cono');
    const link = page.querySelector('a.product-detail__whatsapp')!;

    expect(page.querySelector('button.product-detail__whatsapp')).toBeNull();
    expect(link.getAttribute('href')).toBe(
      `https://wa.me/573001234567?text=${encodeURIComponent(
        'Hola, quisiera consultar sobre el producto: Cono.',
      )}`,
    );
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('aplica el título y la descripción propios del producto', async () => {
    setup();
    const seo = buildProductSeo(findProductBySlug('cono')!);
    await open('/productos/cono');

    expect(TestBed.inject(Title).getTitle()).toBe(seo.title);
    const meta = TestBed.inject(Meta);
    expect(meta.getTag('name="description"')?.content).toBe(seo.description);
    expect(meta.getTag('name="robots"')).toBeNull();
  });

  it('con un slug inexistente, informa, ofrece volver y pide no indexar', async () => {
    setup();
    const page = await open('/productos/no-existe');

    expect(TestBed.inject(Router).url).toBe('/productos/no-existe');
    expect(text(page.querySelector('h1'))).toBe('Producto no encontrado');
    const alert = page.querySelector('[role="alert"]')!;
    expect(alert.textContent).toContain('no existe');
    expect(alert.querySelector('a')?.getAttribute('href')).toBe('/productos');
    expect(page.querySelector('.product-detail__price')).toBeNull();
    expect(TestBed.inject(Title).getTitle()).toBe(PRODUCT_NOT_FOUND_SEO.title);
    expect(TestBed.inject(Meta).getTag('name="robots"')?.content).toBe('noindex');
  });

  it('al volver a un producto real se retira la indicación de no indexar', async () => {
    setup();
    const harness = await RouterTestingHarness.create('/productos/no-existe');
    await harness.navigateByUrl('/productos/cono');

    expect(TestBed.inject(Meta).getTag('name="robots"')).toBeNull();
    expect(text((harness.routeNativeElement as HTMLElement).querySelector('h1'))).toBe('Cono');
  });
});

describe('Navegación del catálogo al detalle', () => {
  for (const [path, count] of [
    ['/productos', 94],
    ['/bioseguridad', 20],
  ] as const) {
    it(`en ${path}, cada tarjeta es un enlace nativo a un producto existente`, async () => {
      setup();
      const page = await open(path);
      const links = Array.from(page.querySelectorAll<HTMLAnchorElement>('a.today-special__link'));

      expect(links.length).toBe(count);
      for (const link of links) {
        const href = link.getAttribute('href')!;
        expect(findProductBySlug(href.replace('/productos/', '')), href).toBeDefined();
        expect(link.getAttribute('aria-label')).toMatch(/^Ver detalle de /);
        expect(link.hasAttribute('target')).toBe(false);
      }
    });
  }

  it('en el inicio enlaza los 20 productos destacados', async () => {
    setup();
    const page = await open('/');

    expect(page.querySelectorAll('a.today-special__link[href^="/productos/"]').length).toBe(20);
    expect(page.querySelectorAll('.today-special .column').length).toBe(32);
  });

  it('al hacer clic en una tarjeta navega al detalle del producto', async () => {
    setup();
    const harness = await RouterTestingHarness.create('/productos');
    const page = harness.routeNativeElement as HTMLElement;

    page.querySelector<HTMLAnchorElement>('a[href="/productos/guante-kodiak"]')!.click();
    await harness.fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/productos/guante-kodiak');
    const detail = harness.routeNativeElement as HTMLElement;
    expect(text(detail.querySelector('h1'))).toBe('Guante Kodiak');
  });

  it('cada categoría del catálogo tiene el ancla a la que apunta su enlace de regreso', async () => {
    setup();
    const page = await open('/productos');

    for (const { fragment, name } of PRODUCT_CATALOG.categories) {
      if (fragment) {
        expect(text(page.querySelector(`[id="${fragment}"] h2`)), fragment).toBe(name);
      }
    }
  });
});
