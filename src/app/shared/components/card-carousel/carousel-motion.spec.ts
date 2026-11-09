import { AUTO_DIRECTION, CarouselMotion, CarouselView } from './carousel-motion';

const FRAME = 16;

function fakeView(): CarouselView & { first: number } {
  return {
    count: 10,
    stepWidth: 100,
    viewportWidth: 300,
    scrollLeft: 0,
    first: 0,
    setFirstCard(index: number) {
      this.first = index;
    },
  };
}

function run(motion: CarouselMotion, frames: number) {
  for (let i = 0; i < frames; i++) {
    motion.tick(FRAME);
  }
}

describe('CarouselMotion', () => {
  it('avanza solo hacia la derecha: las tarjetas se mueven y scrollLeft disminuye', () => {
    const view = fakeView();
    const motion = new CarouselMotion(view);
    run(motion, 1);
    const start = view.scrollLeft;

    run(motion, 30);

    expect(AUTO_DIRECTION).toBe(1);
    expect(view.scrollLeft).toBeLessThan(start);
  });

  it('da la vuelta sin fin, sin saltos visibles y sin salir del margen', () => {
    const view = fakeView();
    const motion = new CarouselMotion(view);
    const firsts = new Set<number>();

    for (let i = 0; i < 6000; i++) {
      motion.tick(FRAME);
      firsts.add(view.first);
      expect(view.scrollLeft).toBeGreaterThanOrEqual(view.stepWidth);
      expect(view.scrollLeft).toBeLessThanOrEqual(600);
    }

    expect(firsts.size).toBe(view.count);
  });

  it('pausar frena de forma gradual, no de golpe, y luego queda quieto', () => {
    const view = fakeView();
    const motion = new CarouselMotion(view);
    run(motion, 60);
    const before = view.scrollLeft;

    motion.pause('hover');
    motion.tick(FRAME);
    const firstStep = before - view.scrollLeft;
    expect(firstStep).toBeGreaterThan(0);

    run(motion, 120);
    const stopped = view.scrollLeft;
    run(motion, 30);
    expect(view.scrollLeft).toBe(stopped);
  });

  it('solo reanuda cuando no queda ninguna pausa activa', () => {
    const motion = new CarouselMotion(fakeView());

    motion.pause('hover');
    motion.pause('focus');
    motion.resume('hover');
    expect(motion.running).toBe(false);

    motion.resume('focus');
    expect(motion.running).toBe(true);
  });

  it('los botones funcionan en pausa, también en el extremo, en ambos sentidos', () => {
    const view = fakeView();
    const motion = new CarouselMotion(view);
    motion.pause('hover');
    run(motion, 2);

    const position = () => (view.scrollLeft + view.first * view.stepWidth) % 1000;
    for (const direction of [1, -1] as const) {
      for (let i = 0; i < 25; i++) {
        const before = position();
        motion.move(direction);
        run(motion, 60);
        const moved = (before - position() + 1000) % 1000;
        expect(moved).toBeCloseTo(direction === 1 ? 100 : 900, 0);
      }
    }
  });

  it('con movimiento reducido no avanza solo y el botón mueve al instante', () => {
    const view = fakeView();
    const motion = new CarouselMotion(view);
    motion.reducedMotion = true;
    run(motion, 2);
    const still = view.scrollLeft;

    run(motion, 120);
    expect(view.scrollLeft).toBe(still);

    const position = () => view.scrollLeft + view.first * view.stepWidth;
    const before = position();
    motion.move(1);
    motion.tick(FRAME);
    expect(Math.abs(position() - before) % 1000).toBeCloseTo(100, 5);
  });

  it('un gesto táctil toma el control: lee la posición y no la impone', () => {
    const view = fakeView();
    const motion = new CarouselMotion(view);
    run(motion, 30);

    motion.pause('touch');
    motion.release();
    view.scrollLeft = 333;
    motion.tick(FRAME);

    expect(view.scrollLeft).toBe(333);
  });

  it('cede ante un desplazamiento externo, como el del foco de teclado, aunque aún frene', () => {
    const view = fakeView();
    const motion = new CarouselMotion(view);
    run(motion, 60);

    motion.pause('focus');
    motion.tick(FRAME);
    view.scrollLeft = 480;
    run(motion, 5);

    expect(view.scrollLeft).toBe(480);
  });

  it('un fotograma muy tardío no provoca un salto', () => {
    const view = fakeView();
    const motion = new CarouselMotion(view);
    run(motion, 60);
    const before = view.scrollLeft;

    motion.tick(60000);

    expect(Math.abs(before - view.scrollLeft)).toBeLessThan(5);
  });

  it('si todas las tarjetas caben a la vista, no se mueve', () => {
    const view = { ...fakeView(), count: 3 };
    const motion = new CarouselMotion(view);

    run(motion, 60);
    motion.move(1);
    run(motion, 60);

    expect(view.scrollLeft).toBe(0);
  });
});
