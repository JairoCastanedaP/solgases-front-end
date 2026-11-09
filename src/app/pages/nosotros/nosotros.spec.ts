import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import manifest from '../../shared/images/optimized-images.json';
import { BRAND_LOGO_COLUMNS, TEAM_HIGHLIGHTS, WHY_US } from './nosotros.data';

/** La variante debe coincidir con las que el manifiesto declara para esa foto. */
const isDeclaredVariant = (src: string) => {
  const { src: template, widths } = manifest['img/almacen.jpg'];
  return widths.some((w: number) => template.replace('{w}', String(w)) === src);
};

async function page() {
  TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
  const harness = await RouterTestingHarness.create('/nosotros');
  return harness.routeNativeElement as HTMLElement;
}

const FREE_DELIVERY_CONDITION =
  'Sujeto a cobertura y condiciones del servicio. Confirma con nosotros si aplica para tu ubicación y servicio antes de solicitarlo.';

describe('NosotrosPage: tarjetas', () => {
  const card = (el: HTMLElement, title: string) =>
    Array.from(el.querySelectorAll('.our-team__card')).find(
      (c) => c.querySelector('h3')?.textContent === title,
    )!;

  it('la imagen de Instalaciones apunta a un archivo real, sin la plantilla del banner', async () => {
    const img = card(await page(), 'Instalaciones').querySelector('img')!;

    expect(img.getAttribute('src')).toBe('img/webp/almacen-640.webp');
    expect(img.getAttribute('width')).toBe('640');
    expect(img.getAttribute('height')).toBe('514');
    expect(img.getAttribute('alt')).toBe('Interior del almacén de Solgases');
    expect(isDeclaredVariant('img/webp/almacen-640.webp')).toBe(true);
  });

  it('ninguna imagen de la página conserva la plantilla {w} en su atributo src', async () => {
    const el = await page();

    for (const img of Array.from(el.querySelectorAll('main img'))) {
      expect(img.getAttribute('src'), img.getAttribute('alt')!).not.toContain('{w}');
    }
  });

  it('muestra las tres tarjetas, con imagen, título y texto', async () => {
    const el = await page();

    for (const { title, text, imageAlt } of TEAM_HIGHLIGHTS) {
      const item = card(el, title);
      expect(item.querySelector('p')?.textContent, title).toBe(text);
      expect(item.querySelector('img')?.getAttribute('alt'), title).toBe(imageAlt);
    }
  });

  it('Domicilio destaca "Domicilio gratis" con su condición, sin reglas de cobertura', async () => {
    const domicilio = card(await page(), 'Domicilio');
    const text = domicilio.textContent!.replace(/\s+/g, ' ');

    expect(domicilio.querySelector('.free-delivery__tag')?.textContent).toBe('Domicilio gratis');
    expect(text).toContain(FREE_DELIVERY_CONDITION);
    expect(text).not.toMatch(/sin ningún costo|municipio/i);
  });

  it('solo Domicilio lleva el aviso', async () => {
    const el = await page();

    expect(el.querySelectorAll('app-free-delivery').length).toBe(1);
    expect(card(el, 'Instalaciones').querySelector('app-free-delivery')).toBeNull();
  });
});

describe('NosotrosPage: por qué contratar con nosotros', () => {
  it('queda encima de las marcas, con párrafo y lista de puntos', async () => {
    const el = await page();
    const section = el.querySelector('.why-us')!;

    expect(section.querySelector('h2')?.textContent).toBe('Por qué contratar con nosotros');
    expect(section.querySelector('p')?.textContent).toContain('más de dos décadas');
    expect(section.querySelectorAll('ul > li').length).toBe(WHY_US.points.length);
    expect(
      section.compareDocumentPosition(el.querySelector('.brands')!) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it('no inventa certificaciones, garantías, resultados, cobertura ni cifras', async () => {
    const text = (await page()).querySelector('.why-us')!.textContent!;

    expect(text).not.toMatch(/certific|garant|resultado|cobertura|gratis|\d/i);
  });
});

describe('NosotrosPage: marcas', () => {
  async function brands() {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    const harness = await RouterTestingHarness.create('/nosotros');
    return (harness.routeNativeElement as HTMLElement).querySelector('.brands')!;
  }

  it('muestra las 16 marcas del proyecto, cada logo una vez, con texto alternativo', async () => {
    const section = await brands();
    const logos = BRAND_LOGO_COLUMNS.flat();
    const images = Array.from(section.querySelectorAll('img'));

    expect(section.querySelector('h2')?.textContent).toBe('Manejamos las mejores marcas');
    expect(logos.length).toBe(16);
    expect(images.length).toBe(16);
    expect(images.map((i) => i.getAttribute('alt'))).toEqual(
      logos.map(({ name }) => `Logo de ${name}`),
    );
    expect(new Set(images.map((i) => i.getAttribute('src'))).size).toBe(16);
  });

  it('es una lista con el nombre visible, sin anunciarlo dos veces', async () => {
    const section = await brands();
    const logos = BRAND_LOGO_COLUMNS.flat();
    const names = Array.from(section.querySelectorAll('.brands__name'));

    expect(section.querySelectorAll('ul > li').length).toBe(16);
    expect(names.map((n) => n.textContent)).toEqual(logos.map(({ name }) => name));
    expect(names.every((n) => n.getAttribute('aria-hidden') === 'true')).toBe(true);
  });

  it('no tiene movimiento automático ni controles que operar', async () => {
    const section = await brands();

    expect(section.querySelector('button')).toBeNull();
  });
});
