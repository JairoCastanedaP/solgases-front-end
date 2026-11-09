import { TestBed } from '@angular/core/testing';
import { SITE_INFO } from '../../core/site-info';
import { WHATSAPP_CONFIG_TOKEN, WhatsAppConfig } from '../../core/whatsapp.config';
import { ContactoPage } from './contacto';

describe('ContactoPage', () => {
  it('conserva el formulario POST hacia el script PHP con los mismos campos', async () => {
    TestBed.configureTestingModule({ imports: [ContactoPage] });
    const fixture = TestBed.createComponent(ContactoPage);
    await fixture.whenStable();
    const form = (fixture.nativeElement as HTMLElement).querySelector('form')!;

    expect(form.getAttribute('action')).toBe('php/enviar-prueba.php');
    expect(form.method.toLowerCase()).toBe('post');
    const names = Array.from(form.querySelectorAll('[name]')).map((f) => f.getAttribute('name'));
    expect(names).toEqual(['nombre', 'correo', 'telefono', 'mensaje']);
  });
});

describe('ContactoPage: presentación y canales', () => {
  async function render(config?: WhatsAppConfig) {
    TestBed.configureTestingModule({
      providers: [...(config ? [{ provide: WHATSAPP_CONFIG_TOKEN, useValue: config }] : [])],
    });
    const fixture = TestBed.createComponent(ContactoPage);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }
  const channels = (el: HTMLElement) => Array.from(el.querySelectorAll('.contact-channels > li'));

  it('saluda sin otra marca ni tiempos de respuesta, encima del formulario', async () => {
    const el = await render();
    const hero = el.querySelector('.contact-hero')!;

    expect(hero.querySelector('h2')?.textContent).toBe('¡Estamos listos para asesorarte!');
    expect(hero.textContent).toContain('En SOLGASES, tu seguridad');
    expect(hero.textContent).not.toMatch(/JAT|Dotar|rápida|horas|minutos|inmediat/i);
    expect(
      hero.compareDocumentPosition(el.querySelector('form')!) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it('correo y línea telefónica usan la configuración del sitio', async () => {
    const [, mail, phone] = channels(await render());

    expect(mail.textContent).toContain('Correo electrónico');
    expect(mail.textContent).toContain(SITE_INFO.email);
    expect(mail.querySelector('a')!.getAttribute('href')).toBe(`mailto:${SITE_INFO.email}`);
    expect(phone.textContent).toContain('Línea telefónica');
    expect(phone.textContent).toContain('(608) 772 86 66');
    expect(phone.querySelector('a')!.getAttribute('href')).toBe('tel:+576087728666');
  });

  it('WhatsApp pendiente lo indica y no enlaza', async () => {
    const [whatsApp] = channels(await render({ phone: null, message: 'Hola' }));

    expect(whatsApp.textContent).toContain('WhatsApp');
    expect(whatsApp.textContent).toContain('Número pendiente de configurar');
    expect(whatsApp.querySelector('a')).toBeNull();
  });

  it('WhatsApp configurado enlaza a wa.me en pestaña nueva', async () => {
    const [whatsApp] = channels(await render({ phone: '573001234567', message: 'Hola' }));
    const link = whatsApp.querySelector('a')!;

    expect(link.getAttribute('href')).toBe('https://wa.me/573001234567?text=Hola');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });
});
