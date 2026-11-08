import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { findServiceBySlug } from '../../core/site-services/site-service-catalog';
import { WHATSAPP_CONFIG_TOKEN, buildWhatsAppUrl } from '../../core/whatsapp.config';
import { ContactButton } from '../../shared/components/contact-button/contact-button';
import { PageBanner } from '../../shared/components/page-banner/page-banner';
import { OptimizedImagePipe } from '../../shared/images/optimized-image';

/**
 * Detalle de un servicio de `site-services.json`, o aviso si el `slug` de la URL no existe.
 * Comparte la hoja de estilos del detalle de producto para mantener el mismo diseño.
 */
@Component({
  selector: 'app-servicio-detalle-page',
  imports: [ContactButton, NgOptimizedImage, OptimizedImagePipe, PageBanner, RouterLink],
  templateUrl: './servicio-detalle.html',
  styleUrl: '../producto-detalle/producto-detalle.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicioDetallePage {
  private readonly whatsApp = inject(WHATSAPP_CONFIG_TOKEN);
  private readonly slug = toSignal(
    inject(ActivatedRoute).paramMap.pipe(map((params) => params.get('slug'))),
    { requireSync: true },
  );

  protected readonly banner = 'img/extintores.jpg';
  protected readonly service = computed(() => findServiceBySlug(this.slug()));
  /** Igual que el botón flotante: `null` mientras el número esté pendiente de configurar. */
  protected readonly whatsAppUrl = computed(() =>
    buildWhatsAppUrl({
      phone: this.whatsApp.phone,
      message: `Hola, quisiera consultar sobre el servicio: ${this.service()?.name}.`,
    }),
  );
}
