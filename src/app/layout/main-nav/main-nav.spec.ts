import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MainNav } from './main-nav';

describe('MainNav', () => {
  it('abre y cierra el menú móvil con el botón y lo cierra al elegir una opción', async () => {
    TestBed.configureTestingModule({ imports: [MainNav], providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(MainNav);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const button = el.querySelector<HTMLElement>('.icon-menu')!;
    const menu = el.querySelector('.menu')!;

    expect(menu.classList).not.toContain('mostrar');

    button.click();
    await fixture.whenStable();
    expect(menu.classList).toContain('mostrar');
    expect(button.getAttribute('aria-expanded')).toBe('true');

    el.querySelector<HTMLElement>('.menu__link')!.click();
    await fixture.whenStable();
    expect(menu.classList).not.toContain('mostrar');
  });
});
