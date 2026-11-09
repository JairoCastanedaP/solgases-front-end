import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import { SITE_SERVICE_CATALOG } from '../../core/site-services/site-service-catalog';
import { SERVICE_TYPES, servicesOfType } from '../../core/site-services/site-service-search';

const text = (element: Element | null | undefined) =>
  element?.textContent?.replace(/\s+/g, ' ').trim();

async function open(url: string) {
  TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
  const harness = await RouterTestingHarness.create(url);
  const page = () => harness.routeNativeElement as HTMLElement;
  return {
    harness,
    page,
    settle: () => harness.fixture.whenStable(),
    status: () => text(page().querySelector('[role="status"]')),
    links: () =>
      Array.from(page().querySelectorAll('app-catalog-grid a')).map((a) => a.getAttribute('href')),
    url: () => TestBed.inject(Router).url,
    checkedType: () => page().querySelector<HTMLInputElement>('input[name="tipo"]:checked')?.value,
    async chooseType(value: string) {
      page().querySelector<HTMLInputElement>(`input[name="tipo"][value="${value}"]`)!.click();
      await harness.fixture.whenStable();
    },
    async search(value: string) {
      const input = page().querySelector<HTMLInputElement>('#servicios-busqueda')!;
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.form!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      await harness.fixture.whenStable();
    },
    async sort(value: string) {
      const select = page().querySelector<HTMLSelectElement>('#servicios-orden')!;
      select.value = value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      await harness.fixture.whenStable();
    },
  };
}

describe('ServiciosPage', () => {
  describe('vista completa', () => {
    it('muestra los 18 servicios una vez, en una sola lista intercalada', async () => {
      const { page, status, links } = await open('/servicios');
      const json = SITE_SERVICE_CATALOG.services.map((s) => `/servicios/${s.slug}`);

      expect(status()).toBe('Mostrando los 18 servicios');
      expect(links().length).toBe(18);
      expect(new Set(links()).size).toBe(18);
      expect([...links()].sort()).toEqual([...json].sort());
      expect(links()).not.toEqual(json);
      expect(page().querySelectorAll('app-catalog-grid').length).toBe(1);
      expect(text(page().querySelector('app-catalog-grid h2'))).toBe('Todos los servicios');
    });

    it('no deja dos seguidos del mismo tipo', async () => {
      const { page } = await open('/servicios');
      const kinds = Array.from(page().querySelectorAll('.catalog-card__meta')).map((m) => text(m));

      for (let i = 1; i < kinds.length; i++) {
        expect(kinds[i], `posición ${i}`).not.toBe(kinds[i - 1]);
      }
    });

    it('las etiquetas son visibles y la búsqueda tiene su rol', async () => {
      const { page } = await open('/servicios');

      expect(text(page().querySelector('label[for="servicios-busqueda"]'))).toBe('Buscar');
      expect(text(page().querySelector('label[for="servicios-orden"]'))).toBe('Ordenar');
      expect(text(page().querySelector('fieldset legend'))).toBe('Tipo de servicio');
      expect(page().querySelector('form[role="search"]')).not.toBeNull();
    });

    it('conserva el texto y el botón de contacto de la página', async () => {
      const { page } = await open('/servicios');

      expect(text(page())).toContain('Recarga de extintores ABC');
      expect(page().querySelector('main a[href="/contacto"].btn')).not.toBeNull();
    });
  });

  describe('tarjetas', () => {
    it('muestran tipo, nombre, imagen y enlace, sin estrellas, marca ni precio', async () => {
      const { page } = await open('/servicios');
      const service = SITE_SERVICE_CATALOG.services.find((s) => s.slug === 'recarga-extintor-co2')!;
      const card = page().querySelector(`[data-slug="${service.slug}"]`)!;

      expect(text(card.querySelector('.catalog-card__meta'))).toBe('Recarga de extintores');
      expect(text(card.querySelector('.today-special__title'))).toBe(service.name);
      expect(card.querySelector('img')!.getAttribute('alt')).toBe(service.image.alt);
      expect(card.querySelector('a')!.getAttribute('href')).toBe(`/servicios/${service.slug}`);
      expect(page().querySelector('.catalog-card__stars')).toBeNull();
      expect(page().querySelector('.catalog-card__rating')).toBeNull();
      expect(page().querySelector('.catalog-card__brand')).toBeNull();
      expect(text(page().querySelector('app-catalog-grid'))).not.toMatch(
        /COP|\$|Precio|calificaci|disponible/i,
      );
    });
  });

  describe('búsqueda, filtro y orden', () => {
    it('busca por nombre, sin mayúsculas ni tildes, y queda en la URL', async () => {
      const { search, status, links, url } = await open('/servicios');

      await search('REPARACION');

      // Revisión de equipos de soldar menciona "reparación" en su descripción.
      expect(status()).toBe('Mostrando 3 de 18 servicios');
      expect([...links()].sort()).toEqual([
        '/servicios/reparacion-regulador-acetileno',
        '/servicios/reparacion-regulador-oxigeno',
        '/servicios/revision-equipos-soldar',
      ]);
      expect(url()).toBe('/servicios?q=REPARACION');
    });

    it('busca también en la descripción', async () => {
      const { search, links } = await open('/servicios');
      const inDescription = SITE_SERVICE_CATALOG.services.filter(
        (s) => /solkaflam/i.test(s.description) && !/solkaflam/i.test(s.name),
      );

      await search('solkaflam');

      expect(inDescription.length).toBeGreaterThan(0);
      expect(links()).toContain(`/servicios/${inDescription[0].slug}`);
    });

    it('ofrece todos los tipos del JSON, y cada uno muestra los suyos en orden', async () => {
      const { chooseType, links, status, page, checkedType } = await open('/servicios');

      expect(SERVICE_TYPES.length).toBe(6);
      for (const type of SERVICE_TYPES) {
        await chooseType(type);
        const expected = servicesOfType(type).map((c) => c.link);
        expect(links(), type).toEqual(expected);
        expect(checkedType()).toBe(type);
        expect(text(page().querySelector('app-catalog-grid h2'))).toBe(type);
        expect(status()).toBe(`Mostrando ${expected.length} de 18 servicios`);
      }
    });

    it('ordena por nombre en ambos sentidos y lo combina con el filtro', async () => {
      const { chooseType, sort, page, url } = await open('/servicios');
      const names = () =>
        Array.from(page().querySelectorAll('.today-special__title')).map((t) => text(t)!);
      const es = new Intl.Collator('es', { sensitivity: 'base', numeric: true });

      await sort('nombre-asc');
      expect(names()).toEqual([...names()].sort(es.compare));
      expect(names().length).toBe(18);

      await chooseType('Llenado de gases');
      await sort('nombre-desc');
      expect(names().length).toBe(5);
      expect(names()).toEqual([...names()].sort(es.compare).reverse());
      expect(url()).toBe('/servicios?tipo=Llenado%20de%20gases&orden=nombre-desc');
    });

    it('sin resultados lo anuncia y limpia búsqueda y filtro', async () => {
      const { page, search, chooseType, status, settle, links, url, checkedType } =
        await open('/servicios');
      await chooseType('Alquiler');
      await search('zzzz');

      expect(status()).toBe('Sin resultados: 0 de 18 servicios');
      expect(text(page().querySelector('.catalog-empty'))).toContain('No encontramos servicios');

      page().querySelector<HTMLButtonElement>('.catalog-empty button')!.click();
      await settle();

      expect(url()).toBe('/servicios');
      expect(links().length).toBe(18);
      expect(checkedType()).toBe('');
    });

    it('una URL compartida restaura el estado; los valores inválidos no filtran', async () => {
      const view = await open('/servicios?q=regulador&tipo=Reparaci%C3%B3n%20de%20reguladores');

      expect(view.status()).toBe('Mostrando 2 de 18 servicios');
      expect(view.checkedType()).toBe('Reparación de reguladores');
      expect(view.page().querySelector<HTMLInputElement>('#servicios-busqueda')!.value).toBe(
        'regulador',
      );

      await view.harness.navigateByUrl('/servicios?tipo=inventado&orden=azar&otro=1');
      expect(view.status()).toBe('Mostrando los 18 servicios');
      expect(view.checkedType()).toBe('');
    });

    it('el control de filtros abre y cierra el panel y devuelve el foco', async () => {
      const { page, settle, chooseType } = await open('/servicios');
      const toggle = page().querySelector<HTMLButtonElement>('.catalog-filters__toggle')!;
      document.body.appendChild(page());

      toggle.click();
      await settle();
      expect(toggle.getAttribute('aria-expanded')).toBe('true');

      await chooseType('Alquiler');
      expect(text(page().querySelector('.catalog-filters__close'))).toBe('Ver resultados (1)');
      expect(text(toggle)).toContain('1 activo');

      page().querySelector<HTMLButtonElement>('.catalog-filters__close')!.click();
      await settle();
      expect(toggle.getAttribute('aria-expanded')).toBe('false');
      expect(document.activeElement).toBe(toggle);
    });
  });

  describe('vista rápida', () => {
    const SLUG = 'recarga-extintor-co2';
    const pointer = (type: string, pointerType: string) =>
      Object.assign(new MouseEvent(type), { pointerType });
    const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    async function card() {
      const view = await open('/servicios');
      const el = view.page().querySelector<HTMLElement>(`[data-slug="${SLUG}"]`)!;
      return {
        ...view,
        el,
        popup: () => el.querySelector('[role="tooltip"]'),
        link: el.querySelector<HTMLAnchorElement>('a')!,
        button: el.querySelector<HTMLButtonElement>('.catalog-card__quick')!,
      };
    }

    it('con el puntero se abre tras un retraso, con nombre, tipo, descripción e imagen', async () => {
      const { el, popup, settle, link } = await card();
      const service = SITE_SERVICE_CATALOG.services.find((s) => s.slug === SLUG)!;

      el.dispatchEvent(pointer('pointerenter', 'mouse'));
      await settle();
      expect(popup()).toBeNull();

      await wait(450);
      await settle();
      expect(text(popup())).toContain(service.name);
      expect(text(popup())).toContain('Tipo: Recarga de extintores');
      expect(text(popup())).toContain(service.summary);
      expect(popup()!.querySelector('img')!.getAttribute('alt')).toBe('');
      expect(text(popup())).not.toMatch(/demostración|Marca|Categoría|COP|\$/);
      expect(link.getAttribute('aria-describedby')).toBe(popup()!.id);

      el.dispatchEvent(pointer('pointerleave', 'mouse'));
      await settle();
      expect(popup()).toBeNull();
    });

    it('funciona con teclado y Escape', async () => {
      const { popup, settle, link } = await card();
      vi.spyOn(link, 'matches').mockReturnValue(true);

      link.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
      await settle();
      expect(popup()).not.toBeNull();

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      await settle();
      expect(popup()).toBeNull();
    });

    it('en móvil usa el botón, y no intercepta el enlace al detalle', async () => {
      const { el, popup, settle, button, link, url } = await card();

      el.dispatchEvent(pointer('pointerenter', 'touch'));
      await wait(450);
      await settle();
      expect(popup()).toBeNull();

      button.click();
      await settle();
      expect(popup()).not.toBeNull();
      expect(button.getAttribute('aria-expanded')).toBe('true');

      link.click();
      await settle();
      expect(url()).toBe(`/servicios/${SLUG}`);
    });
  });

  describe('Encuentra todo en Solgases', () => {
    it('enlaza solo tipos, servicios y páginas reales, sin promociones', async () => {
      const { page } = await open('/servicios');
      const section = page().querySelector('app-catalog-directory')!;
      const slugs = new Set(SITE_SERVICE_CATALOG.services.map((s) => `/servicios/${s.slug}`));
      const hrefs = Array.from(section.querySelectorAll('a')).map((a) => a.getAttribute('href')!);

      expect(text(section.querySelector('h2'))).toBe('Encuentra todo en Solgases');
      for (const href of hrefs) {
        const isType = href.startsWith('/servicios?tipo=');
        const isPage = ['/productos', '/bioseguridad', '/contacto'].includes(href);
        expect(isType || isPage || slugs.has(href), href).toBe(true);
      }
      for (const type of SERVICE_TYPES) {
        expect(hrefs).toContain(`/servicios?tipo=${encodeURIComponent(type)}`);
      }
      expect(text(section)).not.toMatch(/promoci|tendencia|favorit|del mes|oferta/i);
    });

    it('queda al final y sus enlaces aplican el filtro', async () => {
      const { page, settle, status, checkedType } = await open('/servicios');

      expect(page().querySelector('main')!.lastElementChild!.tagName).toBe('APP-CATALOG-DIRECTORY');

      page()
        .querySelector<HTMLAnchorElement>(
          'app-catalog-directory a[href="/servicios?tipo=Alquiler"]',
        )!
        .click();
      await settle();

      expect(checkedType()).toBe('Alquiler');
      expect(status()).toBe('Mostrando 1 de 18 servicios');
    });
  });
});
