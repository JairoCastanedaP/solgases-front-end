import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Meta } from '@angular/platform-browser';
import { TitleStrategy, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import { PUBLIC_PAGES } from './public-pages';
import { SITE_URL_TOKEN, SeoTitleStrategy } from './seo-title-strategy';

function setup(siteUrl: string | null) {
  TestBed.configureTestingModule({
    providers: [
      provideRouter(routes),
      { provide: TitleStrategy, useClass: SeoTitleStrategy },
      { provide: SITE_URL_TOKEN, useValue: siteUrl },
    ],
  });
  const meta = TestBed.inject(Meta);
  const doc = TestBed.inject(DOCUMENT);
  return {
    content: (selector: string) => meta.getTag(selector)?.content ?? null,
    canonical: () => doc.head.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? null,
  };
}

const pages = Object.values(PUBLIC_PAGES);

describe('SeoTitleStrategy', () => {
  afterEach(() => {
    // Las etiquetas viven en el <head> real del entorno de pruebas: se limpian entre casos.
    const head = TestBed.inject(DOCUMENT).head;
    head
      .querySelectorAll('meta[name], meta[property], link[rel="canonical"]')
      .forEach((e) => e.remove());
  });

  for (const page of pages) {
    it(`aplica descripción, Open Graph y Twitter en /${page.path}`, async () => {
      const { content } = setup(null);
      await RouterTestingHarness.create(`/${page.path}`);

      expect(content('name="description"')).toBe(page.description);
      expect(content('property="og:title"')).toBe(page.title);
      expect(content('property="og:description"')).toBe(page.description);
      expect(content('property="og:type"')).toBe('website');
      expect(content('name="twitter:title"')).toBe(page.title);
      expect(content('name="twitter:description"')).toBe(page.description);
    });
  }

  it('sin dominio confirmado no publica URL absolutas (canónica, og:url, og:image)', async () => {
    const { content, canonical } = setup(null);
    await RouterTestingHarness.create('/productos');

    expect(canonical()).toBeNull();
    expect(content('property="og:url"')).toBeNull();
    expect(content('property="og:image"')).toBeNull();
    expect(content('name="twitter:image"')).toBeNull();
    expect(content('name="twitter:card"')).toBe('summary');
  });

  it('con dominio genera canónica e imagen absolutas y las actualiza al navegar', async () => {
    const { content, canonical } = setup('https://example.test');
    const harness = await RouterTestingHarness.create('/productos');

    expect(canonical()).toBe('https://example.test/productos');
    expect(content('property="og:url"')).toBe('https://example.test/productos');
    expect(content('property="og:image"')).toBe(
      `https://example.test/${PUBLIC_PAGES.productos.image}`,
    );
    expect(content('name="twitter:card"')).toBe('summary_large_image');

    await harness.navigateByUrl('/');
    expect(canonical()).toBe('https://example.test/');
    expect(content('name="description"')).toBe(PUBLIC_PAGES.home.description);
    expect(document.head.querySelectorAll('link[rel="canonical"]').length).toBe(1);
  });
});

describe('PUBLIC_PAGES', () => {
  it('tiene títulos y descripciones únicos y de longitud razonable', () => {
    expect(new Set(pages.map((p) => p.title)).size).toBe(pages.length);
    expect(new Set(pages.map((p) => p.description)).size).toBe(pages.length);
    for (const p of pages) {
      expect(p.title.length, p.title).toBeLessThanOrEqual(60);
      expect(p.description.length, p.description).toBeGreaterThanOrEqual(70);
      expect(p.description.length, p.description).toBeLessThanOrEqual(160);
      expect(p.image, p.path).toMatch(/^img\/og\/.+\.jpg$/);
    }
  });
});
