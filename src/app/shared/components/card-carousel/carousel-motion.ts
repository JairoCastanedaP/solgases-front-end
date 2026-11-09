/** Lo que el movimiento necesita de la página; en las pruebas se sustituye por un objeto simple. */
export interface CarouselView {
  readonly count: number;
  /** Ancho de una tarjeta más su separación. */
  readonly stepWidth: number;
  readonly viewportWidth: number;
  scrollLeft: number;
  /** Coloca la tarjeta `index` en primer lugar visual, conservando el orden circular. */
  setFirstCard(index: number): void;
}

/** `1`: las tarjetas se mueven hacia la derecha. Avanzar sigue esta dirección; `-1` la invierte. */
export const AUTO_DIRECTION = 1;
const SPEED_PX_PER_SECOND = 30;
/** Tiempo aproximado para acelerar o frenar: pausar o reanudar nunca da un salto. */
const RAMP_MS = 250;
const MANUAL_EASE_MS = 140;
const MAX_QUEUED_STEPS = 3;
/** Un fotograma tardío (pestaña en segundo plano) no debe convertirse en un salto. */
const MAX_FRAME_MS = 50;
/** Más que el redondeo del navegador: si `scrollLeft` difiere tanto, alguien más lo movió. */
const EXTERNAL_SCROLL_PX = 2;

/**
 * Carrusel continuo sin elementos duplicados: cuando una tarjeta sale por un extremo, pasa al otro
 * con la propiedad CSS `order` y `scrollLeft` se corrige en el mismo fotograma. Así no hay fin que
 * alcanzar, cada enlace existe una sola vez y el orden del DOM (teclado y lector) no cambia.
 */
export class CarouselMotion {
  private readonly pauses = new Set<string>();
  private position = 0;
  private velocity = 0;
  /** Distancia pendiente por los botones, en la misma dirección que `velocity`. */
  private queued = 0;
  private firstCard = 0;
  /** Último valor escrito, o `null` si en el fotograma anterior no se movió. */
  private written: number | null = null;

  reducedMotion = false;

  constructor(private readonly view: CarouselView) {}

  get running(): boolean {
    return !this.reducedMotion && this.pauses.size === 0;
  }

  pause(reason: string): void {
    this.pauses.add(reason);
  }

  resume(reason: string): void {
    this.pauses.delete(reason);
  }

  /** `1` avanza y `-1` retrocede una tarjeta; acumula pulsaciones seguidas sin perder ninguna. */
  move(direction: 1 | -1): void {
    const limit = this.view.stepWidth * MAX_QUEUED_STEPS;
    const queued = this.queued + direction * this.view.stepWidth;
    this.queued = Math.max(-limit, Math.min(limit, queued));
  }

  /** La persona toma el control con un gesto: el carrusel la sigue en vez de competir con ella. */
  release(): void {
    this.velocity = 0;
    this.queued = 0;
  }

  tick(elapsedMs: number): void {
    const { stepWidth, count, viewportWidth } = this.view;
    const maxEdge = count * stepWidth - viewportWidth - stepWidth;
    if (stepWidth <= 0 || maxEdge <= stepWidth) {
      return; // Sin anchura de sobra para dar la vuelta: todas las tarjetas ya caben a la vista.
    }

    // El foco de teclado, la rueda o un gesto movieron la lista: se les cede, nunca se les pisa.
    if (
      this.written !== null &&
      Math.abs(this.view.scrollLeft - this.written) > EXTERNAL_SCROLL_PX
    ) {
      this.release();
      this.written = null;
    }

    const elapsed = Math.min(elapsedMs, MAX_FRAME_MS);
    const target = this.running ? SPEED_PX_PER_SECOND : 0;
    this.velocity += (target - this.velocity) * Math.min(1, elapsed / RAMP_MS);
    if (target === 0 && this.velocity < 1) {
      this.velocity = 0;
    }

    const distance = (this.velocity * elapsed) / 1000 + this.takeQueued(elapsed);
    if (distance === 0) {
      // En reposo manda el gesto o el foco: se lee la posición en lugar de imponerla.
      this.position = this.view.scrollLeft;
      if (this.wrap(stepWidth, maxEdge)) {
        this.view.scrollLeft = this.position;
      }
      this.written = null;
      return;
    }
    if (this.written === null) {
      this.position = this.view.scrollLeft;
    }
    this.position -= AUTO_DIRECTION * distance;
    this.wrap(stepWidth, maxEdge);
    this.view.scrollLeft = this.position;
    this.written = this.position;
  }

  private takeQueued(elapsed: number): number {
    if (this.queued === 0) {
      return 0;
    }
    const share = this.reducedMotion ? 1 : Math.min(1, elapsed / MANUAL_EASE_MS);
    let taken = this.queued * share;
    if (Math.abs(this.queued - taken) < 0.5) {
      taken = this.queued;
    }
    this.queued -= taken;
    return taken;
  }

  /** Mantiene siempre al menos una tarjeta de margen a cada lado; indica si tuvo que corregir. */
  private wrap(stepWidth: number, maxEdge: number): boolean {
    const start = this.firstCard;
    const { count } = this.view;
    while (this.position < stepWidth) {
      this.firstCard = (this.firstCard - 1 + count) % count;
      this.position += stepWidth;
    }
    while (this.position > maxEdge) {
      this.firstCard = (this.firstCard + 1) % count;
      this.position -= stepWidth;
    }
    if (this.firstCard === start) {
      return false;
    }
    this.view.setFirstCard(this.firstCard);
    return true;
  }
}
