import { TestBed } from '@angular/core/testing';
import { SITE_INFO } from '../../core/site-info';
import { SiteHeader } from './site-header';

// jsdom aún no implementa `showModal` ni `close`; Escape y el foco nativos se prueban en Chromium.
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
});

async function render() {
  const fixture = TestBed.createComponent(SiteHeader);
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  document.body.appendChild(el);
  return { el, settle: () => fixture.whenStable(), dialog: el.querySelector('dialog')! };
}

describe('SiteHeader: contacto', () => {
  it('el botón de llamada muestra el número nuevo y marca con el indicativo correcto', async () => {
    const { el } = await render();
    const call = el.querySelector<HTMLAnchorElement>('a.contact-action--call')!;

    expect(SITE_INFO.phone).toBe('(608) 772 86 66');
    expect(call.textContent!.replace(/\s+/g, ' ').trim()).toBe('Llamar: (608) 772 86 66');
    expect(call.getAttribute('href')).toBe('tel:+576087728666');
    expect(call.getAttribute('aria-label')).toContain('Llamar: (608) 772 86 66');
    expect(call.querySelector('.icon-phone')!.getAttribute('aria-hidden')).toBe('true');
    expect(el.textContent).not.toContain('038');
  });

  describe('botón de ubicación', () => {
    const open = async () => {
      const view = await render();
      const button = view.el.querySelector<HTMLButtonElement>('button.contact-action--map')!;
      button.focus();
      button.click();
      await view.settle();
      return { ...view, button };
    };

    it('muestra la dirección y no navega por sí solo', async () => {
      const { el } = await render();
      const button = el.querySelector<HTMLButtonElement>('button.contact-action--map')!;

      expect(button.textContent!.trim()).toBe('Cra 16 #10 48, Sogamoso');
      expect(button.getAttribute('aria-haspopup')).toBe('dialog');
      expect(button.getAttribute('aria-label')).toContain('Cra 16 #10 48, Sogamoso');
      expect(el.querySelector('dialog')!.hasAttribute('open')).toBe(false);
      expect(el.querySelector('a[href*="google"]')).toBeNull();
    });

    it('pregunta antes de abrir, con título accesible', async () => {
      const { dialog } = await open();

      expect(dialog.hasAttribute('open')).toBe(true);
      expect(dialog.getAttribute('aria-labelledby')).toBe(dialog.querySelector('h2')!.id);
      expect(dialog.querySelector('h2')!.textContent).toBe('Ubicación en Google Maps');
      expect(dialog.textContent).toContain('¿Deseas abrir la ubicación');
      expect(dialog.textContent).toContain(SITE_INFO.address);
    });

    it('confirmar abre Google Maps con la dirección codificada, en pestaña nueva', async () => {
      const { dialog, settle, button } = await open();
      const link = dialog.querySelector<HTMLAnchorElement>('a.contact-dialog__confirm')!;
      const url = new URL(link.href);

      expect(`${url.origin}${url.pathname}`).toBe('https://www.google.com/maps/search/');
      expect(url.searchParams.get('api')).toBe('1');
      expect(url.searchParams.get('query')).toBe('Cra 16 #10 48, Sogamoso');
      expect(link.getAttribute('href')).toContain('Cra%2016%20%2310%2048%2C%20Sogamoso');
      expect(link.getAttribute('target')).toBe('_blank');
      expect(link.getAttribute('rel')).toBe('noopener noreferrer');

      link.addEventListener('click', (event) => event.preventDefault());
      button.blur();
      link.click();
      await settle();
      expect(dialog.hasAttribute('open')).toBe(false);
      expect(document.activeElement).toBe(button);
    });

    it('cancelar cierra sin abrir nada y devuelve el foco al botón', async () => {
      const { dialog, settle, button } = await open();
      const cancel = dialog.querySelector<HTMLButtonElement>('.contact-dialog__close')!;

      expect(cancel.textContent!.trim()).toBe('Cancelar');
      button.blur();
      cancel.click();
      await settle();

      expect(dialog.hasAttribute('open')).toBe(false);
      expect(dialog.textContent!.trim()).toBe('');
      expect(document.activeElement).toBe(button);
    });
  });
});
