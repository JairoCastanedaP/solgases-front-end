import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SITE_INFO, SOCIAL_PROFILES_TOKEN, SocialProfiles } from '../../core/site-info';
import { WHATSAPP_CONFIG } from '../../core/whatsapp.config';
import { MainNav } from '../main-nav/main-nav';

// jsdom aún no implementa `showModal` ni `close`; el foco y Escape nativos se prueban en Chromium.
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
});

async function render(profiles?: SocialProfiles) {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      ...(profiles ? [{ provide: SOCIAL_PROFILES_TOKEN, useValue: profiles }] : []),
    ],
  });
  const fixture = TestBed.createComponent(MainNav);
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  document.body.appendChild(el);
  const dialog = el.querySelector('dialog')!;
  return {
    el,
    dialog,
    title: () => dialog.querySelector('h2')?.textContent?.trim(),
    body: () => dialog.textContent!.replace(/\s+/g, ' '),
    settle: () => fixture.whenStable(),
    icon: (label: string) => el.querySelector<HTMLButtonElement>(`[aria-label^="Ver ${label}"]`)!,
    async open(label: string) {
      const icon = el.querySelector<HTMLButtonElement>(`[aria-label^="Ver ${label}"]`)!;
      icon.focus();
      icon.click();
      await fixture.whenStable();
      return icon;
    },
  };
}

describe('Ventana de contacto del encabezado', () => {
  it('hay cinco iconos: botones con nombre accesible y sin enlaces sin destino', async () => {
    const { el } = await render();
    const icons = Array.from(el.querySelectorAll<HTMLButtonElement>('.social-icon button'));

    expect(icons.map((b) => b.getAttribute('aria-label'))).toEqual([
      'Ver correo de Solgases',
      'Ver dirección de Solgases',
      'Ver teléfono de Solgases',
      'Ver Facebook de Solgases',
      'Ver Instagram de Solgases',
    ]);
    expect(icons.every((b) => b.getAttribute('aria-haspopup') === 'dialog')).toBe(true);
    expect(el.querySelector('.social-icon a')).toBeNull();
  });

  it('está cerrada y vacía hasta activar un icono', async () => {
    const { dialog } = await render();

    expect(dialog.hasAttribute('open')).toBe(false);
    expect(dialog.textContent?.trim()).toBe('');
  });

  it('muestra los datos configurados, con título accesible', async () => {
    const { open, title, body, dialog } = await render();

    await open('correo');
    expect(dialog.hasAttribute('open')).toBe(true);
    expect(title()).toBe('Correo');
    expect(dialog.getAttribute('aria-labelledby')).toBe(dialog.querySelector('h2')!.id);
    expect(dialog.querySelector('a')!.getAttribute('href')).toBe(`mailto:${SITE_INFO.email}`);

    await open('dirección');
    expect(title()).toBe('Dirección');
    expect(body()).toContain(SITE_INFO.address);

    await open('teléfono');
    expect(title()).toBe('Teléfono');
    expect(body()).toContain(SITE_INFO.phone);
    expect(dialog.querySelector('a')).toBeNull();
  });

  it('sin cuentas confirmadas, las redes lo dicen y no enlazan a nada', async () => {
    const { open, body, dialog, settle } = await render();

    for (const [label, name] of [
      ['Facebook', 'Facebook'],
      ['Instagram', 'Instagram'],
    ]) {
      await open(label);
      expect(body()).toContain(`El perfil de ${name} de Solgases está pendiente de configurar.`);
      expect(dialog.querySelector('a')).toBeNull();
      dialog.querySelector('button')!.click();
      await settle();
    }
  });

  it('cuando se confirme una cuenta, muestra su enlace y deja la otra pendiente', async () => {
    const url = 'https://example.test/solgases';
    const { open, body, dialog, settle } = await render({ facebook: url, instagram: null });

    await open('Facebook');
    const link = dialog.querySelector('a')!;
    expect(link.getAttribute('href')).toBe(url);
    expect(link.getAttribute('rel')).toContain('noopener');
    dialog.querySelector('button')!.click();
    await settle();

    await open('Instagram');
    expect(body()).toContain('pendiente de configurar');
  });

  it('el botón Cerrar la cierra, la vacía y devuelve el foco al icono', async () => {
    const { open, dialog, settle } = await render();
    const icon = await open('teléfono');

    const close = dialog.querySelector('button')!;
    expect(close.textContent?.trim()).toBe('Cerrar');
    icon.blur();
    close.click();
    await settle();

    expect(dialog.hasAttribute('open')).toBe(false);
    expect(dialog.textContent?.trim()).toBe('');
    expect(document.activeElement).toBe(icon);
  });

  it('un clic en el fondo la cierra; un clic en el contenido, no', async () => {
    const { open, dialog, settle } = await render();
    await open('correo');

    dialog.querySelector('h2')!.click();
    await settle();
    expect(dialog.hasAttribute('open')).toBe(true);

    dialog.click();
    await settle();
    expect(dialog.hasAttribute('open')).toBe(false);
  });

  it('no toca el número de WhatsApp', () => {
    expect(WHATSAPP_CONFIG.phone).toBeNull();
  });
});
