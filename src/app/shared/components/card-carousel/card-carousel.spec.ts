import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CatalogItem } from '../../models/catalog-item';
import { CardCarousel } from './card-carousel';

const ITEMS: readonly CatalogItem[] = [
  { title: 'Cono', image: 'img/productos/cono.jpg', alt: 'Cono naranja', link: '/productos/cono' },
  { title: 'Casco', image: 'img/productos/cono.jpg', link: '/productos/casco' },
];

function mockReducedMotion(matches: boolean) {
  vi.stubGlobal('matchMedia', () => ({
    matches,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  }));
}

async function render() {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(CardCarousel);
  fixture.componentRef.setInput('heading', 'Productos Relevantes');
  fixture.componentRef.setInput('items', ITEMS);
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  const section = el.querySelector<HTMLElement>('section')!;
  return {
    el,
    section,
    state: () => section.getAttribute('data-motion'),
    settle: () => fixture.whenStable(),
  };
}

const pointer = (type: string, pointerType: string) =>
  Object.assign(new MouseEvent(type, { bubbles: false }), { pointerType });

describe('CardCarousel', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('tiene un enlace por tarjeta, sin copias, con su imagen y texto alternativo', async () => {
    const { el } = await render();
    const links = Array.from(el.querySelectorAll('a'));

    expect(links.map((a) => a.getAttribute('href'))).toEqual([
      '/productos/cono',
      '/productos/casco',
    ]);
    expect(el.querySelectorAll('li').length).toBe(ITEMS.length);
    expect(el.querySelectorAll('[aria-hidden="true"] a, [inert]').length).toBe(0);
    expect(el.querySelector('img')!.getAttribute('alt')).toBe('Cono naranja');
    expect(el.querySelectorAll('img')[1].getAttribute('alt')).toBe('Casco');
  });

  it('se presenta como carrusel con nombre y botones accesibles', async () => {
    const { section, el } = await render();
    const labelledBy = section.getAttribute('aria-labelledby')!;
    const names = Array.from(el.querySelectorAll('button')).map(
      (b) => b.getAttribute('aria-label') ?? b.textContent?.trim(),
    );

    expect(section.getAttribute('aria-roledescription')).toBe('carrusel');
    expect(el.querySelector(`[id="${labelledBy}"]`)?.textContent).toBe('Productos Relevantes');
    expect(names).toEqual([
      'Retroceder en Productos Relevantes',
      'Avanzar en Productos Relevantes',
      'Pausar movimiento',
    ]);
  });

  it('pausa con el puntero y reanuda al salir; un toque no cuenta como puntero', async () => {
    const { section, state, settle } = await render();
    expect(state()).toBe('running');

    section.dispatchEvent(pointer('pointerenter', 'touch'));
    await settle();
    expect(state()).toBe('running');

    section.dispatchEvent(pointer('pointerenter', 'mouse'));
    await settle();
    expect(state()).toBe('paused');

    section.dispatchEvent(pointer('pointerleave', 'mouse'));
    await settle();
    expect(state()).toBe('running');
  });

  it('pausa con el foco de teclado y reanuda al salir del carrusel', async () => {
    const { section, el, state, settle } = await render();
    const link = el.querySelector('a')!;
    vi.spyOn(link, 'matches').mockReturnValue(true);

    const scroll = vi.fn();
    link.closest('li')!.scrollIntoView = scroll;

    link.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    await settle();
    expect(state()).toBe('paused');
    expect(scroll).toHaveBeenCalledWith(expect.objectContaining({ inline: 'nearest' }));

    link.dispatchEvent(
      new FocusEvent('focusout', { bubbles: true, relatedTarget: el.querySelectorAll('a')[1] }),
    );
    await settle();
    expect(state()).toBe('paused');

    link.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: null }));
    await settle();
    expect(section.contains(link)).toBe(true);
    expect(state()).toBe('running');
  });

  it('el botón de pausa se mantiene aunque el puntero salga, hasta reanudar', async () => {
    const { section, el, state, settle } = await render();
    const pause = el.querySelector<HTMLButtonElement>('.carousel__pause')!;

    pause.click();
    await settle();
    expect(pause.getAttribute('aria-pressed')).toBe('true');
    expect(pause.textContent?.trim()).toBe('Reanudar movimiento');

    section.dispatchEvent(pointer('pointerenter', 'mouse'));
    section.dispatchEvent(pointer('pointerleave', 'mouse'));
    await settle();
    expect(state()).toBe('paused');

    pause.click();
    await settle();
    expect(state()).toBe('running');
  });

  it('con prefers-reduced-motion no se mueve solo y conserva los controles manuales', async () => {
    mockReducedMotion(true);
    const { el, state } = await render();

    expect(state()).toBe('reduced');
    expect(el.querySelector('.carousel__pause')).toBeNull();
    expect(el.querySelectorAll('.carousel__arrow').length).toBe(2);
  });
});
