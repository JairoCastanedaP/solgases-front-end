import { TestBed } from '@angular/core/testing';
import { SITE_INFO } from '../../core/site-info';
import { WHATSAPP_CONFIG, WHATSAPP_CONFIG_TOKEN, WhatsAppConfig } from '../../core/whatsapp.config';
import { FloatingContact } from './floating-contact';

async function render(config: WhatsAppConfig = WHATSAPP_CONFIG): Promise<HTMLElement> {
  TestBed.configureTestingModule({
    providers: [{ provide: WHATSAPP_CONFIG_TOKEN, useValue: config }],
  });
  const fixture = TestBed.createComponent(FloatingContact);
  await fixture.whenStable();
  return fixture.nativeElement as HTMLElement;
}

describe('FloatingContact', () => {
  it('el botón de llamada marca el fijo confirmado, con etiqueta accesible', async () => {
    const call = (await render()).querySelector('a.float-call')!;

    expect(call.getAttribute('href')).toBe('tel:+576087728666');
    expect(call.getAttribute('aria-label')).toBe('Llamar a Solgases: (608) 772 86 66');
    expect(call.querySelector('.icon-phone')!.getAttribute('aria-hidden')).toBe('true');
  });

  it('con WhatsApp pendiente lo explica, es enfocable y no abre nada', async () => {
    const el = await render({ phone: null, message: 'Hola' });
    const button = el.querySelector('button.float-wa')!;

    expect(el.querySelector('a.float-wa')).toBeNull();
    expect(button.getAttribute('aria-disabled')).toBe('true');
    expect(button.hasAttribute('disabled')).toBe(false);
    expect(button.getAttribute('aria-label')).toBe('Escríbenos por WhatsApp');
    expect(button.querySelector('.float-wa__label')?.textContent).toBe('Escríbenos por WhatsApp');
    expect(el.querySelector(`#${button.getAttribute('aria-describedby')}`)?.textContent).toContain(
      'pendiente de configurar',
    );
    expect(el.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('con un número válido enlaza a wa.me en pestaña nueva', async () => {
    const link = (await render({ phone: '573001234567', message: 'Hola' })).querySelector(
      'a.float-wa',
    )!;

    expect(link.getAttribute('href')).toBe('https://wa.me/573001234567?text=Hola');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    expect(link.getAttribute('aria-label')).toContain('Escríbenos por WhatsApp');
  });

  it('el teléfono de llamadas nunca se usa como WhatsApp', async () => {
    const el = await render();
    const digits = SITE_INFO.phone.replace(/\D/g, '');

    expect(WHATSAPP_CONFIG.phone ?? '').not.toContain(digits);
    expect(el.querySelector('a[href*="wa.me"]')).toBeNull();
  });
});
