import { TestBed } from '@angular/core/testing';
import { SITE_INFO } from '../../core/site-info';
import {
  WHATSAPP_CONFIG,
  WHATSAPP_CONFIG_TOKEN,
  WhatsAppConfig,
  buildWhatsAppUrl,
} from '../../core/whatsapp.config';
import { FloatingContact } from './floating-contact';

async function render(config: WhatsAppConfig = WHATSAPP_CONFIG): Promise<HTMLElement> {
  TestBed.configureTestingModule({
    providers: [{ provide: WHATSAPP_CONFIG_TOKEN, useValue: config }],
  });
  const fixture = TestBed.createComponent(FloatingContact);
  await fixture.whenStable();
  return fixture.nativeElement as HTMLElement;
}

const text = (el: Element | null | undefined) => el?.textContent?.replace(/\s+/g, ' ').trim();
const LABELS = ['Escríbenos para asesorarte', 'Escríbenos por WhatsApp', 'Llamar'];

describe('FloatingContact', () => {
  it('la configuración del repositorio tiene el número pendiente', () => {
    expect(WHATSAPP_CONFIG.phone).toBeNull();
    expect(WHATSAPP_CONFIG.message.trim()).not.toBe('');
  });

  for (const [state, config] of [
    ['pendiente', { phone: null, message: 'Hola' }],
    ['configurado', { phone: '573001234567', message: 'Hola' }],
  ] as const) {
    it(`con WhatsApp ${state} están los tres botones, separados y con ícono`, async () => {
      const el = await render(config);
      const actions = Array.from(el.querySelectorAll('.float-action'));

      expect(actions.map((a) => text(a.querySelector('.float-action__text')))).toEqual(LABELS);
      expect(actions[0].classList).toContain('float-advice');
      expect(actions[1].classList).toContain('float-wa');
      expect(actions[1].querySelector('.float-wa__waves svg')).not.toBeNull();
      expect(actions[2].classList).toContain('float-call');
    });
  }

  it('el botón de llamada marca el fijo configurado', async () => {
    const call = (await render()).querySelector('a.float-call')!;

    expect(call.getAttribute('href')).toBe('tel:+576087728666');
    expect(call.getAttribute('aria-label')).toBe('Llamar a Solgases: (608) 772 86 66');
    expect(call.querySelector('.icon-phone')!.getAttribute('aria-hidden')).toBe('true');
  });

  describe('con el número pendiente', () => {
    const pending = () => render({ phone: null, message: 'Hola' });

    it('no muestra ningún aviso de configuración', async () => {
      expect(text(await pending())).not.toMatch(/pendiente|configurar|no disponible/i);
    });

    it('asesoría y WhatsApp son botones que no abren nada, y el nombre accesible lo indica', async () => {
      const el = await pending();
      const buttons = Array.from(el.querySelectorAll('button'));

      expect(buttons.length).toBe(2);
      for (const button of buttons) {
        expect(button.getAttribute('aria-disabled')).toBe('true');
        expect(button.hasAttribute('disabled')).toBe(false);
        expect(button.getAttribute('aria-label')).toContain('no disponible por ahora');
      }
      expect(el.querySelector('a[href*="wa.me"]')).toBeNull();
      expect(Array.from(el.querySelectorAll('a')).map((a) => a.getAttribute('href'))).toEqual([
        'tel:+576087728666',
      ]);
    });

    it('el WhatsApp verde conserva las ondas', async () => {
      expect((await pending()).querySelector('button.float-wa .float-wa__waves')).not.toBeNull();
    });
  });

  it('con un número válido, asesoría y WhatsApp enlazan a wa.me en pestaña nueva', async () => {
    const el = await render({ phone: '573001234567', message: 'Hola' });

    expect(el.querySelector('button')).toBeNull();
    for (const selector of ['a.float-advice', 'a.float-wa']) {
      const link = el.querySelector(selector)!;
      expect(link.getAttribute('href'), selector).toBe('https://wa.me/573001234567?text=Hola');
      expect(link.getAttribute('target'), selector).toBe('_blank');
      expect(link.getAttribute('rel'), selector).toBe('noopener noreferrer');
    }
  });

  it('el teléfono de llamadas nunca se usa como WhatsApp', () => {
    expect(WHATSAPP_CONFIG.phone ?? '').not.toContain(SITE_INFO.phone.replace(/\D/g, ''));
    expect(buildWhatsAppUrl(WHATSAPP_CONFIG)).toBeNull();
  });

  it('no genera enlace si el número no tiene solo dígitos con código de país', () => {
    for (const phone of ['', '+57 300 123 4567', '300-123-4567', '1234567', '57abc1234567']) {
      expect(buildWhatsAppUrl({ phone, message: 'Hola' }), phone).toBeNull();
    }
    expect(buildWhatsAppUrl({ phone: '573001234567', message: 'Hola, ¿sí & no?' })).toBe(
      'https://wa.me/573001234567?text=Hola%2C%20%C2%BFs%C3%AD%20%26%20no%3F',
    );
  });
});
