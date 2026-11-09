import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  inject,
  linkedSignal,
  signal,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { SEARCH_MAX_LENGTH } from '../../core/catalog-text';
import { SERVICES_SUMMARY } from '../../core/site-info';
import {
  EMPTY_SERVICE_QUERY,
  SERVICE_SORT_OPTIONS,
  SERVICE_TOTAL,
  SERVICE_TYPES,
  ServiceQuery,
  isServiceQueryActive,
  parseServiceQuery,
  searchServices,
  toServiceParams,
} from '../../core/site-services/site-service-search';
import { CatalogDirectory } from '../../shared/components/catalog-directory/catalog-directory';
import { CatalogGrid } from '../../shared/components/catalog-grid/catalog-grid';
import { ContactButton } from '../../shared/components/contact-button/contact-button';
import { IntroSection } from '../../shared/components/intro-section/intro-section';
import { PageBanner } from '../../shared/components/page-banner/page-banner';
import { SERVICES_DIRECTORY } from './servicios.data';

/** Espera tras la última tecla antes de escribir en la URL y anunciar el resultado. */
const SEARCH_DEBOUNCE_MS = 250;

/**
 * Catálogo de servicios, con la misma composición y hoja de estilos que Productos. La URL es la
 * fuente del estado: se puede compartir y sobrevive al volver desde un detalle.
 */
@Component({
  selector: 'app-servicios-page',
  imports: [PageBanner, IntroSection, ContactButton, CatalogDirectory, CatalogGrid],
  templateUrl: './servicios.html',
  styleUrl: '../productos/productos.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiciosPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly params = toSignal(this.route.queryParamMap, { requireSync: true });
  private readonly searchInput = viewChild.required<ElementRef<HTMLInputElement>>('searchInput');
  private readonly filtersToggle =
    viewChild.required<ElementRef<HTMLButtonElement>>('filtersToggle');
  private searchTimer?: ReturnType<typeof setTimeout>;

  protected readonly summary = SERVICES_SUMMARY;
  protected readonly directory = SERVICES_DIRECTORY;
  protected readonly types = SERVICE_TYPES;
  protected readonly sortOptions = SERVICE_SORT_OPTIONS;
  protected readonly searchMaxLength = SEARCH_MAX_LENGTH;

  /** Solo afecta a móvil y tablet: en escritorio el panel es la columna lateral, siempre visible. */
  protected readonly filtersOpen = signal(false);
  protected readonly query = computed(() => parseServiceQuery(this.params()));
  /** Lo escrito en el campo, que se adelanta a la URL mientras dura la espera. */
  protected readonly searchText = linkedSignal(() => this.query().q);
  protected readonly results = computed(() => searchServices(this.query()));
  protected readonly canClear = computed(() =>
    isServiceQueryActive({ ...this.query(), q: this.searchText() }),
  );
  protected readonly status = computed(() => {
    const { total } = this.results();
    if (total === 0) {
      return `Sin resultados: 0 de ${SERVICE_TOTAL} servicios`;
    }
    return total === SERVICE_TOTAL
      ? `Mostrando los ${SERVICE_TOTAL} servicios`
      : `Mostrando ${total} de ${SERVICE_TOTAL} servicios`;
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.searchTimer));
  }

  protected onSearchInput(value: string): void {
    this.searchText.set(value);
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.update({}), SEARCH_DEBOUNCE_MS);
  }

  protected toggleFilters(): void {
    this.filtersOpen.update((open) => !open);
  }

  /** El botón que se pulsó queda oculto con el panel: el foco vuelve al que lo abrió. */
  protected closeFilters(): void {
    this.filtersOpen.set(false);
    this.filtersToggle().nativeElement.focus();
  }

  /** El botón puede desactivarse o desaparecer: el foco pasa al buscador para no perderse. */
  protected clear(): void {
    this.searchText.set('');
    this.update(EMPTY_SERVICE_QUERY);
    this.searchInput().nativeElement.focus();
  }

  protected onSortChange(sort: string): void {
    this.update({ sort: sort as ServiceQuery['sort'] });
  }

  /** Enter aplica lo escrito sin esperar. También se llama al tocar un filtro: incluye el texto. */
  protected update(changes: Partial<ServiceQuery>): void {
    clearTimeout(this.searchTimer);
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: toServiceParams({ ...this.query(), q: this.searchText(), ...changes }),
      // Igual que en Productos: "Atrás" vuelve del detalle a la lista, no a cada tecla.
      replaceUrl: true,
      scroll: 'manual',
    });
  }
}
