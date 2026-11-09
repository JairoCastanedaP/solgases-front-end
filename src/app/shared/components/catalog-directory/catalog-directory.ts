import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Params, RouterLink } from '@angular/router';

export interface DirectoryLink {
  readonly label: string;
  readonly path: string;
  readonly queryParams?: Params;
}

export interface DirectoryGroup {
  readonly title: string;
  readonly links: readonly DirectoryLink[];
}

/** Sección de enlaces al final de Productos y Servicios; cada página aporta sus datos reales. */
@Component({
  selector: 'app-catalog-directory',
  imports: [RouterLink],
  template: `
    <section class="directory" aria-labelledby="encuentra-todo">
      <div class="container">
        <h2 id="encuentra-todo" class="group__title">Encuentra todo en Solgases</h2>
        <div class="directory__grid">
          @for (group of groups(); track group.title) {
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
  readonly groups = input.required<readonly DirectoryGroup[]>();
}
