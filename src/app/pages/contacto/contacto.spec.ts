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

  describe('horario, dirección y mapa', () => {
    const cards = async () => Array.from((await render()).querySelectorAll('.contact-card'));
    const clean = (el: Element | null | undefined) => el?.textContent?.replace(/\s+/g, ' ').trim();

    it('los presenta en tres tarjetas con título', async () => {
      expect((await cards()).map((c) => clean(c.querySelector('h3')))).toEqual([
        'Horario de atención',
        'Dirección',
        'Ubícanos con Google Maps',
      ]);
    });

    it('mantiene los horarios y la dirección', async () => {
      const [hours, address] = await cards();

      expect(Array.from(hours.querySelectorAll('dt, dd')).map(clean)).toEqual([
        'Lunes a viernes',
        '8am a 12pm y 2pm a 6:30pm',
        'Sábados',
        '8am a 6pm (jornada continua)',
      ]);
      expect(clean(address.querySelector('p'))).toBe('Cra 16 #10 48, Sogamoso, Boyacá');
    });

    it('al entrar el foco en el mapa lo lleva a la vista; con otro foco no mueve la página', async () => {
      const el = await render();
      document.body.appendChild(el);
      const frame = el.querySelector('iframe')!;
      const reveal = vi.fn();
      frame.scrollIntoView = reveal;

      window.dispatchEvent(new Event('blur'));
      expect(reveal).not.toHaveBeenCalled();

      vi.spyOn(document, 'activeElement', 'get').mockReturnValue(frame);
      window.dispatchEvent(new Event('blur'));
      expect(reveal).toHaveBeenCalledWith({ block: 'nearest' });
      vi.restoreAllMocks();
    });

    it('no cambia el destino del mapa', async () => {
      const [, , map] = await cards();
      const frame = map.querySelector('iframe')!;

      expect(frame.getAttribute('title')).toBe('Ubicación de Solgases en Google Maps');
      expect(frame.getAttribute('src')).toContain('!2sSolgases!');
      expect(frame.getAttribute('src')).toContain('0x8e6a45d9f304ae27');
    });
  });
});
