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
import { PRODUCT_CATALOG } from '../../core/products/product-catalog';
import {
  BRAND_OPTIONS,
  CATALOG_SEARCH_MAX_LENGTH,
  CATALOG_TOTAL,
  CATEGORY_OPTIONS,
  CatalogQuery,
  EMPTY_CATALOG_QUERY,
  SORT_OPTIONS,
  categoryFromFragment,
  isCatalogQueryActive,
  parseCatalogQuery,
  searchCatalog,
  toCatalogParams,
} from '../../core/products/product-catalog-search';
import { IntroSection } from '../../shared/components/intro-section/intro-section';
import { PageBanner } from '../../shared/components/page-banner/page-banner';
import { CatalogDirectory } from './catalog-directory/catalog-directory';
import { CatalogGrid } from './catalog-grid/catalog-grid';

/** Espera tras la última tecla antes de escribir en la URL y anunciar el resultado. */
const SEARCH_DEBOUNCE_MS = 250;

/**
 * Catálogo con búsqueda, filtros y orden. La URL es la fuente del estado: se puede compartir y, al
 * volver desde un detalle con "Atrás" (sin datos en memoria), reconstruye la misma vista.
 */
@Component({
  selector: 'app-productos-page',
  imports: [PageBanner, IntroSection, CatalogDirectory, CatalogGrid],
  templateUrl: './productos.html',
  styleUrl: './productos.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductosPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly params = toSignal(this.route.queryParamMap, { requireSync: true });
  private readonly fragment = toSignal(this.route.fragment, {
    initialValue: this.route.snapshot.fragment,
  });
  private readonly searchInput = viewChild.required<ElementRef<HTMLInputElement>>('searchInput');
  private readonly filtersToggle =
    viewChild.required<ElementRef<HTMLButtonElement>>('filtersToggle');
  private searchTimer?: ReturnType<typeof setTimeout>;

  protected readonly notice = PRODUCT_CATALOG.notice;
  protected readonly categoryOptions = CATEGORY_OPTIONS;
  protected readonly brandOptions = BRAND_OPTIONS;
  protected readonly sortOptions = SORT_OPTIONS;
  protected readonly searchMaxLength = CATALOG_SEARCH_MAX_LENGTH;

  /** Solo afecta a móvil y tablet: en escritorio el panel es la columna lateral, siempre visible. */
  protected readonly filtersOpen = signal(false);
  protected readonly query = computed(() => {
    const query = parseCatalogQuery(this.params());
    return query.category
      ? query
      : { ...query, category: categoryFromFragment(this.fragment() ?? null) };
  });
  /** Lo escrito en el campo, que se adelanta a la URL mientras dura la espera. */
  protected readonly searchText = linkedSignal(() => this.query().q);
  protected readonly results = computed(() => searchCatalog(this.query()));
  protected readonly canClear = computed(() =>
    isCatalogQueryActive({ ...this.query(), q: this.searchText() }),
  );
  protected readonly activeFilters = computed(
    () => Number(Boolean(this.query().category)) + Number(Boolean(this.query().brand)),
  );
  protected readonly showsPrices = computed(() => this.query().sort.startsWith('precio'));
  protected readonly status = computed(() => {
    const { total } = this.results();
    if (total === 0) {
      return `Sin resultados: 0 de ${CATALOG_TOTAL} productos`;
    }
    return total === CATALOG_TOTAL
      ? `Mostrando los ${CATALOG_TOTAL} productos`
      : `Mostrando ${total} de ${CATALOG_TOTAL} productos`;
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.searchTimer));
  }

  protected onSearchInput(value: string): void {
    this.searchText.set(value);
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.update({}), SEARCH_DEBOUNCE_MS);
  }

  protected onCategoryChange(category: string): void {
    this.update({ category });
  }

  protected onBrandChange(brand: string): void {
    this.update({ brand });
  }

  protected onSortChange(sort: string): void {
    this.update({ sort: sort as CatalogQuery['sort'] });
  }

  protected toggleFilters(): void {
    this.filtersOpen.update((open) => !open);
  }

  /** El botón que se pulsó queda oculto con el panel: el foco vuelve al que lo abrió. */
  protected closeFilters(): void {
    this.filtersOpen.set(false);
    this.filtersToggle().nativeElement.focus();
  }

  /** El botón puede desaparecer o desactivarse: el foco pasa al buscador para no perderse. */
  protected clear(): void {
    this.searchText.set('');
    this.update(EMPTY_CATALOG_QUERY);
    this.searchInput().nativeElement.focus();
  }

  /** Enter aplica lo escrito sin esperar. También se llama al tocar un filtro: incluye el texto. */
  protected update(changes: Partial<CatalogQuery>): void {
    clearTimeout(this.searchTimer);
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: toCatalogParams({ ...this.query(), q: this.searchText(), ...changes }),
      // Filtrar no crea entradas de historial: "Atrás" vuelve del detalle al catálogo, no a cada
      // tecla. `manual` evita que el router suba al inicio de la página con cada cambio.
      replaceUrl: true,
      scroll: 'manual',
    });
  }
}
