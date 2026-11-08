import { RenderMode, ServerRoutePrerenderWithParams } from '@angular/ssr';
import { routes } from '../../app.routes';
import { serverRoutes } from '../../app.routes.server';
import { PRODUCT_CATALOG } from '../products/product-catalog';
import { SITE_SERVICE_CATALOG } from '../site-services/site-service-catalog';
import { LEGACY_REDIRECTS, PUBLIC_PAGES } from './public-pages';
import { buildRobotsTxt, buildSitemapXml } from './seo-files';

const sitemapPaths = Object.values(PUBLIC_PAGES).map((p) => p.path);

describe('sitemap.xml y robots.txt', () => {
  it('cada URL del sitemap corresponde a una página real (no redirección) y prerenderizada', () => {
    for (const path of sitemapPaths) {
      const route = routes.find((r) => r.path === path);
      expect(route?.loadComponent, `/${path}`).toBeDefined();
      expect(route?.redirectTo, `/${path}`).toBeUndefined();
      const server = serverRoutes.find((r) => r.path === path);
      expect(server?.renderMode, `/${path}`).toBe(RenderMode.Prerender);
    }
  });

  it('el sitemap lista exactamente las páginas públicas, sin PHP ni rutas heredadas', () => {
    const xml = buildSitemapXml('https://example.test', sitemapPaths);
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

    expect(locs).toEqual([
      'https://example.test/',
      'https://example.test/nosotros',
      'https://example.test/productos',
      'https://example.test/servicios',
      'https://example.test/bioseguridad',
      'https://example.test/contacto',
    ]);
    expect(xml).not.toContain('php');
    for (const legacy of Object.keys(LEGACY_REDIRECTS)) {
      expect(xml).not.toContain(legacy);
    }
  });

  it('robots.txt bloquea el PHP y enlaza el sitemap solo si hay dominio', () => {
    expect(buildRobotsTxt(null)).toBe('User-agent: *\nDisallow: /php/\n');
    expect(buildRobotsTxt('https://example.test')).toContain(
      'Sitemap: https://example.test/sitemap.xml',
    );
  });

  it('prerenderiza el detalle de todos los productos del JSON', async () => {
    const server = serverRoutes.find((r) => r.path === 'productos/:slug');
    expect(server?.renderMode).toBe(RenderMode.Prerender);

    const params = await (server as ServerRoutePrerenderWithParams).getPrerenderParams();
    expect(params.map((p) => p['slug'])).toEqual(PRODUCT_CATALOG.products.map((p) => p.slug));
  });

  it('prerenderiza el detalle de todos los servicios del JSON', async () => {
    const server = serverRoutes.find((r) => r.path === 'servicios/:slug');
    expect(server?.renderMode).toBe(RenderMode.Prerender);

    const params = await (server as ServerRoutePrerenderWithParams).getPrerenderParams();
    expect(params.map((p) => p['slug'])).toEqual(SITE_SERVICE_CATALOG.services.map((s) => s.slug));
  });

  it('las rutas heredadas .html redirigen a páginas públicas existentes', () => {
    for (const [path, target] of Object.entries(LEGACY_REDIRECTS)) {
      expect(routes.find((r) => r.path === path)?.redirectTo).toBe(target);
      expect(sitemapPaths).toContain(target);
    }
  });
});
