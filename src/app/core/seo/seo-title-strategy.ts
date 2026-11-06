import { DOCUMENT, Injectable, InjectionToken, inject } from '@angular/core';
import { Meta, MetaDefinition, Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { PageSeo } from './public-pages';
import { SITE_URL } from './site-url';

/** Dominio público usado para URL absolutas (canónica, Open Graph). `null` = no confirmado. */
export const SITE_URL_TOKEN = new InjectionToken<string | null>('SITE_URL', {
  providedIn: 'root',
  factory: () => SITE_URL,
});

const SITE_NAME = 'Solgases';

/**
 * Además del título, aplica los metadatos de la página activa (route `data.seo`):
 * descripción, Open Graph, Twitter y URL canónica. Se ejecuta tanto en el
 * prerenderizado (el HTML generado ya incluye las etiquetas) como en el navegador
 * al navegar entre páginas.
 */
@Injectable()
export class SeoTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);
  private readonly siteUrl = inject(SITE_URL_TOKEN);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const seo = this.findSeo(snapshot.root);
    const title = this.buildTitle(snapshot) ?? seo?.title ?? SITE_NAME;
    this.title.setTitle(title);
    if (seo) {
      this.applyPageSeo(seo, title);
    }
  }

  private applyPageSeo(seo: PageSeo, title: string): void {
    const pageUrl = this.absoluteUrl(seo.path);
    const imageUrl = this.absoluteUrl(seo.image);

    this.setTag('name', 'description', seo.description);
    this.setTag('property', 'og:type', 'website');
    this.setTag('property', 'og:site_name', SITE_NAME);
    this.setTag('property', 'og:locale', 'es_CO');
    this.setTag('property', 'og:title', title);
    this.setTag('property', 'og:description', seo.description);
    this.setTag('name', 'twitter:title', title);
    this.setTag('name', 'twitter:description', seo.description);

    // Open Graph y Twitter exigen URL absolutas: sin dominio confirmado se omiten.
    this.setTag('property', 'og:url', pageUrl);
    this.setTag('property', 'og:image', imageUrl);
    this.setTag('property', 'og:image:width', imageUrl && '1200');
    this.setTag('property', 'og:image:height', imageUrl && '630');
    this.setTag('property', 'og:image:alt', imageUrl && seo.imageAlt);
    this.setTag('name', 'twitter:card', imageUrl ? 'summary_large_image' : 'summary');
    this.setTag('name', 'twitter:image', imageUrl);
    this.setCanonical(pageUrl);
  }

  private findSeo(route: ActivatedRouteSnapshot): PageSeo | undefined {
    let seo: PageSeo | undefined;
    for (let r: ActivatedRouteSnapshot | null = route; r; r = r.firstChild) {
      seo = (r.data['seo'] as PageSeo | undefined) ?? seo;
    }
    return seo;
  }

  private absoluteUrl(path: string): string | null {
    return this.siteUrl ? `${this.siteUrl}/${path}` : null;
  }

  /** Crea o actualiza una etiqueta <meta>; con `content` nulo la elimina. */
  private setTag(attr: 'name' | 'property', key: string, content: string | null): void {
    const selector = `${attr}="${key}"`;
    if (content === null) {
      this.meta.removeTag(selector);
      return;
    }
    this.meta.updateTag({ [attr]: key, content } as MetaDefinition, selector);
  }

  private setCanonical(url: string | null): void {
    const head = this.document.head;
    let link = head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!url) {
      link?.remove();
      return;
    }
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      head.appendChild(link);
    }
    link.setAttribute('href', url);
  }
}
