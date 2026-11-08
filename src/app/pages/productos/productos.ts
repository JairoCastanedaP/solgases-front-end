import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  inject,
  linkedSignal,
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
  isCatalogQueryActive,
  parseCatalogQuery,
  searchCatalog,
  toCatalogParams,
} from '../../core/products/product-catalog-search';
import { ContactButton } from '../../shared/components/contact-button/contact-button';
import { ImageGallery } from '../../shared/components/image-gallery/image-gallery';
import { IntroSection } from '../../shared/components/intro-section/intro-section';
import { PageBanner } from '../../shared/components/page-banner/page-banner';
import { ProductGrid } from '../../shared/components/product-grid/product-grid';
import { PRODUCT_GALLERY } from './productos.data';

/** Espera tras la última tecla antes de escribir en la URL y anunciar el resultado. */
const SEARCH_DEBOUNCE_MS = 250;

/**
 * Catálogo con búsqueda, filtros y orden. La URL es la fuente del estado: se puede compartir y, al
 * volver desde un detalle con "Atrás" (sin datos en memoria), reconstruye la misma vista.
 */
@Component({
  selector: 'app-productos-page',
  imports: [PageBanner, IntroSection, ImageGallery, ContactButton, ProductGrid],
  templateUrl: './productos.html',
  styleUrl: './productos.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductosPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly params = toSignal(this.route.queryParamMap, { requireSync: true });
  private readonly searchInput = viewChild.required<ElementRef<HTMLInputElement>>('searchInput');
  private searchTimer?: ReturnType<typeof setTimeout>;

  protected readonly gallery = PRODUCT_GALLERY;
  protected readonly notice = PRODUCT_CATALOG.notice;
  protected readonly categoryOptions = CATEGORY_OPTIONS;
  protected readonly brandOptions = BRAND_OPTIONS;
  protected readonly sortOptions = SORT_OPTIONS;
  protected readonly searchMaxLength = CATALOG_SEARCH_MAX_LENGTH;

  protected readonly query = computed(() => parseCatalogQuery(this.params()));
  /** Lo escrito en el campo, que se adelanta a la URL mientras dura la espera. */
  protected readonly searchText = linkedSignal(() => this.query().q);
  protected readonly results = computed(() => searchCatalog(this.query()));
  protected readonly canClear = computed(() =>
    isCatalogQueryActive({ ...this.query(), q: this.searchText() }),
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
