import { TestBed } from '@angular/core/testing';
import {
  WHATSAPP_CONFIG,
  WHATSAPP_CONFIG_TOKEN,
  WhatsAppConfig,
  buildWhatsAppUrl,
} from '../../core/whatsapp.config';
import { WhatsAppButton } from './whatsapp-button';

async function render(config: WhatsAppConfig): Promise<HTMLElement> {
  TestBed.configureTestingModule({
    imports: [WhatsAppButton],
    providers: [{ provide: WHATSAPP_CONFIG_TOKEN, useValue: config }],
  });
  const fixture = TestBed.createComponent(WhatsAppButton);
  await fixture.whenStable();
  return fixture.nativeElement as HTMLElement;
}

describe('WhatsAppButton', () => {
  it('la configuración del repositorio tiene el número pendiente (null)', () => {
    expect(WHATSAPP_CONFIG.phone).toBeNull();
    expect(WHATSAPP_CONFIG.message.trim()).not.toBe('');
  });

  it('con número pendiente muestra un botón desactivado y accesible, sin enlace', async () => {
    const el = await render({ phone: null, message: 'Hola' });
    const button = el.querySelector('button')!;

    expect(el.querySelector('a')).toBeNull();
    expect(button.getAttribute('aria-disabled')).toBe('true');
    expect(button.hasAttribute('disabled')).toBe(false); // sigue siendo enfocable
    expect(button.getAttribute('aria-label')).toBe('Contactar por WhatsApp');
    const description = el.querySelector(`#${button.getAttribute('aria-describedby')}`);
    expect(description?.textContent?.trim()).toBe('Número de WhatsApp pendiente de configurar');
    expect(el.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('con número configurado enlaza a wa.me con el mensaje codificado en pestaña nueva', async () => {
    const el = await render({
      phone: '573001234567',
      message: 'Hola, ¿tienen extintores & cascos?',
    });
    const link = el.querySelector('a')!;

    expect(el.querySelector('button')).toBeNull();
    expect(link.getAttribute('href')).toBe(
      'https://wa.me/573001234567?text=Hola%2C%20%C2%BFtienen%20extintores%20%26%20cascos%3F',
    );
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    expect(link.getAttribute('aria-label')).toContain('WhatsApp');
  });

  it('no genera enlace si el número no tiene solo dígitos con código de país', () => {
    for (const phone of ['', '+57 300 123 4567', '300-123-4567', '1234567', '57abc1234567']) {
      expect(buildWhatsAppUrl({ phone, message: 'Hola' }), phone).toBeNull();
    }
    expect(buildWhatsAppUrl({ phone: '573001234567', message: 'Hola' })).toBe(
      'https://wa.me/573001234567?text=Hola',
    );
  });
});
