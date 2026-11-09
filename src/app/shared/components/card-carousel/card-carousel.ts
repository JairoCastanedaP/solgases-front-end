import { NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { OptimizedImagePipe } from '../../images/optimized-image';
import { CatalogItem } from '../../models/catalog-item';
import { CarouselMotion, CarouselView } from './carousel-motion';

/** Margen para que termine la inercia de un gesto antes de reanudar el movimiento. */
const TOUCH_RESUME_MS = 1500;

/**
 * Carrusel horizontal de tarjetas enlazadas. El HTML prerenderizado es una lista desplazable que
 * funciona sin JavaScript; el movimiento y los botones aparecen al hidratarse. Ver `CarouselMotion`.
 */
@Component({
  selector: 'app-card-carousel',
  imports: [NgOptimizedImage, OptimizedImagePipe, RouterLink],
  templateUrl: './card-carousel.html',
  styleUrl: './card-carousel.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardCarousel {
  readonly heading = input.required<string>();
  readonly items = input.required<readonly CatalogItem[]>();

  private readonly track = viewChild.required<ElementRef<HTMLElement>>('track');
  private motion?: CarouselMotion;
  private touchTimer?: ReturnType<typeof setTimeout>;

  protected readonly headingId = computed(
    () => `carrusel-${this.heading().toLowerCase().replace(/\s+/g, '-')}`,
  );
  protected readonly ready = signal(false);
  protected readonly reducedMotion = signal(false);
  protected readonly userPaused = signal(false);
  private readonly hovered = signal(false);
  private readonly focused = signal(false);
  /** Estado visible en el DOM: lo usan las pruebas y describe qué hace el carrusel en cada momento. */
  protected readonly motionState = computed(() => {
    if (!this.ready()) {
      return 'static';
    }
    if (this.reducedMotion()) {
      return 'reduced';
    }
    return this.userPaused() || this.hovered() || this.focused() ? 'paused' : 'running';
  });

  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => this.start());
  }

  protected advance(): void {
    this.motion?.move(1);
  }

  protected retreat(): void {
    this.motion?.move(-1);
  }

  protected togglePause(): void {
    this.userPaused.update((paused) => !paused);
    this.setPause('user', this.userPaused());
  }

  protected onPointerEnter(event: PointerEvent): void {
    if (event.pointerType !== 'touch') {
      this.hovered.set(true);
      this.setPause('hover', true);
    }
  }

  protected onPointerLeave(event: PointerEvent): void {
    if (event.pointerType !== 'touch') {
      this.hovered.set(false);
      this.setPause('hover', false);
    }
  }

  /** Solo el foco de teclado: tras un clic en un botón, salir con el puntero debe reanudar. */
  protected onFocusIn(event: FocusEvent): void {
    const target = event.target as HTMLElement;
    if (target.matches(':focus-visible')) {
      this.focused.set(true);
      this.setPause('focus', true);
      // El navegador deja cortada una tarjeta que ya es visible en parte.
      target
        .closest('li')
        ?.scrollIntoView?.({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
    }
  }

  protected onFocusOut(event: FocusEvent, section: HTMLElement): void {
    if (!section.contains(event.relatedTarget as Node | null)) {
      this.focused.set(false);
      this.setPause('focus', false);
    }
  }

  private setPause(reason: string, paused: boolean): void {
    if (paused) {
      this.motion?.pause(reason);
    } else {
      this.motion?.resume(reason);
    }
  }

  private start(): void {
    const track = this.track().nativeElement;
    const motion = new CarouselMotion(this.createView(track));
    this.motion = motion;
    this.ready.set(true);

    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const applyPreference = () => {
      const reduced = media?.matches ?? false;
      motion.reducedMotion = reduced;
      this.reducedMotion.set(reduced);
    };
    applyPreference();
    media?.addEventListener('change', applyPreference);

    const onTouchStart = () => {
      clearTimeout(this.touchTimer);
      motion.pause('touch');
      motion.release();
    };
    const onTouchEnd = () => {
      this.touchTimer = setTimeout(() => motion.resume('touch'), TOUCH_RESUME_MS);
    };
    track.addEventListener('touchstart', onTouchStart, { passive: true });
    track.addEventListener('touchend', onTouchEnd, { passive: true });
    track.addEventListener('touchcancel', onTouchEnd, { passive: true });

    // Fuera de la pantalla no hay nada que animar.
    const observer =
      typeof IntersectionObserver === 'undefined'
        ? undefined
        : new IntersectionObserver(([entry]) => {
            this.setPause('offscreen', !entry.isIntersecting);
          });
    observer?.observe(track);

    let frame = requestAnimationFrame(function loop(this: void, time: number) {
      motion.tick(previous === undefined ? 0 : time - previous);
      previous = time;
      frame = requestAnimationFrame(loop);
    });
    let previous: number | undefined;

    this.destroyRef.onDestroy(() => {
      cancelAnimationFrame(frame);
      clearTimeout(this.touchTimer);
      observer?.disconnect();
      media?.removeEventListener('change', applyPreference);
      track.removeEventListener('touchstart', onTouchStart);
      track.removeEventListener('touchend', onTouchEnd);
      track.removeEventListener('touchcancel', onTouchEnd);
    });
  }

  private createView(track: HTMLElement): CarouselView {
    const slides = () => Array.from(track.children) as HTMLElement[];
    return {
      get count() {
        return track.children.length;
      },
      get stepWidth() {
        const [first] = slides();
        return first
          ? first.getBoundingClientRect().width +
              parseFloat(getComputedStyle(track).columnGap || '0')
          : 0;
      },
      get viewportWidth() {
        return track.clientWidth;
      },
      get scrollLeft() {
        return track.scrollLeft;
      },
      set scrollLeft(value: number) {
        track.scrollLeft = value;
      },
      // Estilos directos: Angular no los toca al actualizar la vista, así la posición se conserva.
      setFirstCard(index: number) {
        const all = slides();
        all.forEach((slide, i) => {
          slide.style.order = String((i - index + all.length) % all.length);
        });
      },
    };
  }
}
