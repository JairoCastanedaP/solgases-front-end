import { NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import {
  PRODUCT_CATALOG,
  findCategory,
  findProductBySlug,
  formatPrice,
} from '../../core/products/product-catalog';
import { WHATSAPP_CONFIG_TOKEN, buildWhatsAppUrl } from '../../core/whatsapp.config';
import { ContactButton } from '../../shared/components/contact-button/contact-button';
import { PageBanner } from '../../shared/components/page-banner/page-banner';
import { OptimizedImagePipe } from '../../shared/images/optimized-image';

/** Detalle de un producto de `products.json`, o aviso si el `slug` de la URL no existe. */
@Component({
  selector: 'app-producto-detalle-page',
  imports: [ContactButton, NgOptimizedImage, OptimizedImagePipe, PageBanner, RouterLink],
  templateUrl: './producto-detalle.html',
  styleUrl: './producto-detalle.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductoDetallePage {
  private readonly whatsApp = inject(WHATSAPP_CONFIG_TOKEN);
  private readonly slug = toSignal(
    inject(ActivatedRoute).paramMap.pipe(map((params) => params.get('slug'))),
    { requireSync: true },
  );

  protected readonly banner = 'img/architecture-blur-bright-1329061 (1).jpg';
  protected readonly notice = PRODUCT_CATALOG.notice;
  protected readonly product = computed(() => findProductBySlug(this.slug()));
  protected readonly category = computed(() => {
    const product = this.product();
    return product && findCategory(product.categoryId);
  });
  /**
   * El precio es ficticio y no debe quedar en el HTML estático: el prerenderizado no ejecuta
   * `afterNextRender`, que además espera a la hidratación para no alterar el DOM recibido.
   */
  protected readonly showPrice = signal(false);
  protected readonly price = computed(() => {
    const product = this.product();
    return product && formatPrice(product.price);
  });
  /** Igual que el botón flotante: `null` mientras el número esté pendiente de configurar. */
  protected readonly whatsAppUrl = computed(() =>
    buildWhatsAppUrl({
      phone: this.whatsApp.phone,
      message: `Hola, quisiera consultar sobre el producto: ${this.product()?.name}.`,
    }),
  );

  constructor() {
    afterNextRender(() => this.showPrice.set(true));
  }
}
