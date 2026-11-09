import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { Router, TitleStrategy, provideRouter, withInMemoryScrolling } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import { findServiceBySlug } from '../../core/site-services/site-service-catalog';
import { SERVICE_NOT_FOUND_SEO, buildServiceSeo } from '../../core/site-services/site-service-seo';
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

describe('ServicioDetallePage', () => {
  afterEach(() => {
    TestBed.inject(DOCUMENT)
      .head.querySelectorAll('meta[name], meta[property]')
      .forEach((e) => e.remove());
  });

  it('muestra el nombre como único <h1>, las migas de pan y el enlace a Servicios', async () => {
    setup();
    const page = await open('/servicios/recarga-extintor-co2');

    expect(page.querySelectorAll('h1').length).toBe(1);
    expect(text(page.querySelector('h1'))).toBe('Recarga de extintor de CO2');
    expect(page.querySelector('main.main')).not.toBeNull();

    const crumbs = page.querySelector('nav[aria-label="Migas de pan"]')!;
    expect(Array.from(crumbs.querySelectorAll('li')).map(text)).toEqual([
      'Inicio',
      'Servicios',
      'Recarga de extintor de CO2',
    ]);
    expect(crumbs.querySelector('[aria-current="page"]')).not.toBeNull();
    const back = page.querySelector('.product-detail__back')!;
    expect(back.getAttribute('href')).toBe('/servicios');
    expect(text(back)).toBe('Volver a Servicios');
  });

  it('muestra la imagen principal con dimensiones, prioridad y texto alternativo', async () => {
    setup();
    const service = findServiceBySlug('recarga-acumulador')!;
    const page = await open('/servicios/recarga-acumulador');
    const img = page.querySelector<HTMLImageElement>('.product-detail__img')!;

    expect(img.getAttribute('alt')).toBe(service.image.alt);
    expect(img.getAttribute('src')).toMatch(/\.webp$/);
    expect(img.getAttribute('width')).toMatch(/^\d+$/);
    expect(img.getAttribute('height')).toMatch(/^\d+$/);
    expect(img.getAttribute('fetchpriority')).toBe('high');
  });

  it('muestra descripción y detalles, sin precio ni aviso de demostración', async () => {
    setup();
    const service = findServiceBySlug('reparacion-regulador-oxigeno')!;
    const page = await open('/servicios/reparacion-regulador-oxigeno');
    const info = page.querySelector('.product-detail__info')!;

    expect(info.textContent).toContain(service.description);
    expect(Array.from(info.querySelectorAll('h2')).map(text)).toEqual(['Descripción', 'Detalles']);
    expect(Array.from(info.querySelectorAll('dd')).map(text)).toEqual(
      service.details.map((d) => d.value),
    );
    expect(page.querySelector('.product-detail__price')).toBeNull();
    expect(page.querySelector('.product-detail__notice')).toBeNull();
  });

  it('destaca "Domicilio gratis" con su condición donde los datos lo indican', async () => {
    setup();
    const info = (await open('/servicios/llenado-argon')).querySelector('.product-detail__info')!;

    expect(info.querySelector('.free-delivery__tag')?.textContent).toBe('Domicilio gratis');
    expect(text(info.querySelector('.free-delivery__condition'))).toBe(
      'Sujeto a cobertura y condiciones del servicio. Confirma con nosotros si aplica para tu ubicación y servicio antes de solicitarlo.',
    );
  });

  it('un servicio sin la oferta confirmada en los datos no muestra el aviso', async () => {
    setup();
    const page = await open('/servicios/recarga-extintor-co2');

    expect(page.querySelector('app-free-delivery')).toBeNull();
    expect(page.textContent).not.toContain('Domicilio gratis');
  });

  it('muestra las notas y la galería solo en los servicios que las tienen', async () => {
    setup();
    const page = await open('/servicios/llenado-nitrogeno');
    const service = findServiceBySlug('llenado-nitrogeno')!;
    const info = page.querySelector('.product-detail__info')!;

    expect(info.textContent).toContain(service.notes![0]);
    const images = info.querySelectorAll('.product-detail__gallery img');
    expect(images.length).toBe(1);
    expect(images[0].getAttribute('alt')).toBe(service.gallery![0].alt);
    expect(images[0].getAttribute('loading')).toBe('lazy');
  });

  it('con el número pendiente, el botón de WhatsApp sigue desactivado y lo explica', async () => {
    setup();
    const page = await open('/servicios/alquiler-cilindros');
    const button = page.querySelector<HTMLButtonElement>('button.product-detail__whatsapp')!;

    expect(page.querySelector('a.product-detail__whatsapp')).toBeNull();
    expect(button.getAttribute('aria-disabled')).toBe('true');
    expect(button.hasAttribute('disabled')).toBe(false);
    expect(
      page.querySelector(`#${button.getAttribute('aria-describedby')}`)?.textContent,
    ).toContain('Número de WhatsApp pendiente de configurar');
    expect(page.querySelector('a[href="/contacto"]')).not.toBeNull();
  });

  it('con número configurado, enlaza a WhatsApp con un mensaje sobre el servicio', async () => {
    setup({ phone: '573001234567', message: 'Hola' });
    const page = await open('/servicios/alquiler-cilindros');
    const link = page.querySelector('a.product-detail__whatsapp')!;

    expect(page.querySelector('button.product-detail__whatsapp')).toBeNull();
    expect(link.getAttribute('href')).toBe(
      `https://wa.me/573001234567?text=${encodeURIComponent(
        'Hola, quisiera consultar sobre el servicio: Alquiler de Cilindros.',
      )}`,
    );
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('aplica el título y la descripción propios del servicio', async () => {
    setup();
    const seo = buildServiceSeo(findServiceBySlug('llenado-argon')!);
    await open('/servicios/llenado-argon');

    expect(TestBed.inject(Title).getTitle()).toBe(seo.title);
    const meta = TestBed.inject(Meta);
    expect(meta.getTag('name="description"')?.content).toBe(seo.description);
    expect(meta.getTag('name="robots"')).toBeNull();
  });

  it('con un slug inexistente, informa, ofrece volver y pide no indexar', async () => {
    setup();
    const page = await open('/servicios/no-existe');

    expect(TestBed.inject(Router).url).toBe('/servicios/no-existe');
    expect(text(page.querySelector('h1'))).toBe('Servicio no encontrado');
    const alert = page.querySelector('[role="alert"]')!;
    expect(alert.textContent).toContain('no existe');
    expect(alert.querySelector('a')?.getAttribute('href')).toBe('/servicios');
    expect(TestBed.inject(Title).getTitle()).toBe(SERVICE_NOT_FOUND_SEO.title);
    expect(TestBed.inject(Meta).getTag('name="robots"')?.content).toBe('noindex');
  });
});

describe('Navegación de las tarjetas de servicios al detalle', () => {
  it('en /servicios, cada tarjeta es un enlace nativo a un servicio existente', async () => {
    setup();
    const page = await open('/servicios');
    const links = Array.from(page.querySelectorAll<HTMLAnchorElement>('a.today-special__link'));

    expect(links.length).toBe(18);
    expect(page.querySelectorAll('.today-special .column').length).toBe(18);
    for (const link of links) {
      const href = link.getAttribute('href')!;
      expect(findServiceBySlug(href.replace('/servicios/', '')), href).toBeDefined();
      expect(link.getAttribute('aria-label')).toMatch(/^Ver detalle de /);
    }
  });

  it('en el inicio, las tarjetas de servicios enlazan a su detalle', async () => {
    setup();
    const page = await open('/');

    expect(page.querySelectorAll('a.today-special__link[href^="/servicios/"]').length).toBe(12);
  });

  it('al hacer clic en una tarjeta navega al detalle del servicio', async () => {
    setup();
    const harness = await RouterTestingHarness.create('/servicios');
    const page = harness.routeNativeElement as HTMLElement;

    page.querySelector<HTMLAnchorElement>('a[href="/servicios/alquiler-cilindros"]')!.click();
    await harness.fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/servicios/alquiler-cilindros');
    const detail = harness.routeNativeElement as HTMLElement;
    expect(text(detail.querySelector('h1'))).toBe('Alquiler de Cilindros');
  });
});
