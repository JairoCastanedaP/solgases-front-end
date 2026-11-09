import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import { BRAND_LOGO_COLUMNS } from './nosotros.data';

describe('NosotrosPage: marcas', () => {
  async function brands() {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    const harness = await RouterTestingHarness.create('/nosotros');
    return (harness.routeNativeElement as HTMLElement).querySelector('.brands')!;
  }

  it('muestra las 16 marcas del proyecto, cada logo una vez, con texto alternativo', async () => {
    const section = await brands();
    const logos = BRAND_LOGO_COLUMNS.flat();
    const images = Array.from(section.querySelectorAll('img'));

    expect(section.querySelector('h2')?.textContent).toBe('Manejamos las mejores marcas');
    expect(logos.length).toBe(16);
    expect(images.length).toBe(16);
    expect(images.map((i) => i.getAttribute('alt'))).toEqual(
      logos.map(({ name }) => `Logo de ${name}`),
    );
    expect(new Set(images.map((i) => i.getAttribute('src'))).size).toBe(16);
  });

  it('es una lista con el nombre visible, sin anunciarlo dos veces', async () => {
    const section = await brands();
    const logos = BRAND_LOGO_COLUMNS.flat();
    const names = Array.from(section.querySelectorAll('.brands__name'));

    expect(section.querySelectorAll('ul > li').length).toBe(16);
    expect(names.map((n) => n.textContent)).toEqual(logos.map(({ name }) => name));
    expect(names.every((n) => n.getAttribute('aria-hidden') === 'true')).toBe(true);
  });

  it('no tiene movimiento automático ni controles que operar', async () => {
    const section = await brands();

    expect(section.querySelector('button')).toBeNull();
  });
});
