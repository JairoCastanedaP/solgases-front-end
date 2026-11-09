import { NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogCard } from '../../../core/products/product-catalog-search';
import { OptimizedImagePipe } from '../../../shared/images/optimized-image';

/** Espera con el puntero encima antes de abrir la vista rápida, para no abrirla al cruzar la lista. */
const QUICK_VIEW_DELAY_MS = 400;

/**
 * Cuadrícula de la página Productos, con marca, tipo, estrellas y vista rápida. Bioseguridad y
 * Servicios siguen usando `ProductGrid`, sin estos datos.
 *
 * La vista rápida es informativa: no atrapa el foco, se cierra al salir y con Escape, y solo existe
 * en el DOM mientras está abierta, así que no añade texto de demostración al HTML estático.
 * El `@for` sigue cada objeto: NgOptimizedImage no admite cambiar las dimensiones de una imagen ya
 * creada, así que una lista filtrada debe crear o mover tarjetas, no reutilizarlas por posición.
 */
@Component({
  selector: 'app-catalog-grid',
  imports: [NgOptimizedImage, OptimizedImagePipe, RouterLink],
  templateUrl: './catalog-grid.html',
  styleUrl: './catalog-grid.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'close()',
    '(document:click)': 'closeOutside($event)',
  },
})
export class CatalogGrid {
  readonly heading = input('');
  readonly items = input.required<readonly CatalogCard[]>();

  protected readonly openSlug = signal<string | null>(null);
  private timer?: ReturnType<typeof setTimeout>;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  /** En pantallas táctiles no hay "pasar el puntero": ahí está el botón Vista rápida. */
  protected onPointerEnter(event: PointerEvent, slug: string): void {
    if (event.pointerType === 'touch') {
      return;
    }
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.openSlug.set(slug), QUICK_VIEW_DELAY_MS);
  }

  protected onPointerLeave(event: PointerEvent): void {
    if (event.pointerType !== 'touch') {
      this.close();
    }
  }

  /** Solo con teclado: un clic ya habrá abierto la vista al pasar el puntero, o llevará al detalle. */
  protected onLinkFocus(event: FocusEvent, slug: string): void {
    if ((event.target as HTMLElement).matches(':focus-visible')) {
      clearTimeout(this.timer);
      this.openSlug.set(slug);
    }
  }

  protected onFocusOut(event: FocusEvent, card: HTMLElement): void {
    if (!card.contains(event.relatedTarget as Node | null)) {
      this.close();
    }
  }

  protected toggle(slug: string): void {
    clearTimeout(this.timer);
    this.openSlug.update((open) => (open === slug ? null : slug));
  }

  protected close(): void {
    clearTimeout(this.timer);
    this.openSlug.set(null);
  }

  protected closeOutside(event: Event): void {
    const card = (event.target as Element | null)?.closest?.('[data-slug]');
    if (card?.getAttribute('data-slug') !== this.openSlug()) {
      this.close();
    }
  }
}
