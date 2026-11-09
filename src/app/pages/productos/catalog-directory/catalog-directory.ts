import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Params, RouterLink } from '@angular/router';
import { PRODUCT_CATALOG, toCatalogItems } from '../../../core/products/product-catalog';
import { BRAND_OPTIONS, CATEGORY_OPTIONS } from '../../../core/products/product-catalog-search';
import { featuredServiceCards } from '../../../core/site-services/site-service-catalog';
import { CatalogItem } from '../../../shared/models/catalog-item';

interface DirectoryLink {
  readonly label: string;
  readonly path: string;
  readonly queryParams?: Params;
}

interface DirectoryGroup {
  readonly title: string;
  readonly links: readonly DirectoryLink[];
}

/** Selección corta: la lista completa está a un enlace, al final de cada grupo. */
const FEATURED_LINKS = 8;

/** Sin repetidos: `featured` de los servicios incluye un `id` dos veces a propósito (ver README). */
function shortList(items: readonly CatalogItem[]): readonly DirectoryLink[] {
  const unique = new Map(items.map(({ title, link }) => [link!, title]));
  return [...unique].slice(0, FEATURED_LINKS).map(([path, label]) => ({ label, path }));
}

/** Solo categorías, marcas, productos y servicios que ya existen en los datos del sitio. */
const GROUPS: readonly DirectoryGroup[] = [
  {
    title: 'Categorías',
    links: CATEGORY_OPTIONS.map(({ value, label }) => ({
      label,
      path: '/productos',
      queryParams: { categoria: value },
    })),
  },
  {
    title: 'Marcas y líneas',
    links: BRAND_OPTIONS.map((brand) => ({
      label: brand,
      path: '/productos',
      queryParams: { marca: brand },
    })),
  },
  {
    title: 'Productos relevantes',
    links: [
      ...shortList(toCatalogItems(PRODUCT_CATALOG.featured)),
      { label: 'Ver todos los productos', path: '/productos' },
    ],
  },
  {
    title: 'Servicios',
    links: [
      ...shortList(featuredServiceCards()),
      { label: 'Ver todos los servicios', path: '/servicios' },
    ],
  },
];

/** Sección de enlaces al final de la página Productos. */
@Component({
  selector: 'app-catalog-directory',
  imports: [RouterLink],
  template: `
    <section class="directory" aria-labelledby="encuentra-todo">
      <div class="container">
        <h2 id="encuentra-todo" class="group__title">Encuentra todo en Solgases</h2>
        <div class="directory__grid">
          @for (group of groups; track group.title) {
            <div class="directory__group">
              <h3 class="directory__title">{{ group.title }}</h3>
              <ul class="directory__list">
                @for (link of group.links; track link.label) {
                  <li>
                    <a
                      class="directory__link"
                      [routerLink]="link.path"
                      [queryParams]="link.queryParams"
                      >{{ link.label }}</a
                    >
                  </li>
                }
              </ul>
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styles: `
    :host {
      display: block;
    }

    .directory {
      margin-top: 30px;
      padding: 10px 16px 24px;
      background: #f4f4f4;
    }

    .group__title {
      margin: 16px 0 20px;
    }

    .directory__grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 24px 16px;
    }

    .directory__title {
      margin-bottom: 8px;
      padding-bottom: 6px;
      border-bottom: 3px solid #de423a;
      font-size: 1em;
    }

    .directory__list {
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .directory__list li {
      padding-block: 5px;
      font-size: 0.9em;
      overflow-wrap: anywhere;
    }

    .directory__link {
      color: #222;
      text-decoration: none;
    }

    .directory__link:hover {
      text-decoration: underline;
    }

    .directory__link:focus-visible {
      outline: 3px solid #111;
      outline-offset: 2px;
    }

    @media screen and (min-width: 768px) {
      .directory__grid {
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 24px;
      }
    }

    @media screen and (min-width: 1024px) {
      .directory {
        padding-inline: 0;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogDirectory {
  protected readonly groups = GROUPS;
}
