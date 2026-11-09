import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import { PRODUCT_CATALOG } from '../../core/products/product-catalog';
import { BRAND_OPTIONS, CATEGORY_OPTIONS } from '../../core/products/product-catalog-search';
import { SITE_SERVICE_CATALOG } from '../../core/site-services/site-service-catalog';

const text = (element: Element | null | undefined) =>
  element?.textContent?.replace(/\s+/g, ' ').trim();

async function open(url: string) {
  TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
  const harness = await RouterTestingHarness.create(url);
  const page = () => harness.routeNativeElement as HTMLElement;
  return {
    harness,
    page,
    status: () => text(page().querySelector('[role="status"]')),
    links: () =>
      Array.from(page().querySelectorAll<HTMLAnchorElement>('a.today-special__link')).map((a) =>
        a.getAttribute('href'),
      ),
    url: () => TestBed.inject(Router).url,
    /** Escribe en el buscador y pulsa Enter, que aplica el texto sin esperar. */
    async search(value: string) {
      const input = page().querySelector<HTMLInputElement>('#catalogo-busqueda')!;
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.form!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      await harness.fixture.whenStable();
    },
    async category(value: string) {
      page().querySelector<HTMLInputElement>(`input[name="categoria"][value="${value}"]`)!.click();
      await harness.fixture.whenStable();
    },
    checkedCategory: () =>
      page().querySelector<HTMLInputElement>('input[name="categoria"]:checked')?.value,
    async select(id: string, value: string) {
      const select = page().querySelector<HTMLSelectElement>(id)!;
      select.value = value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      await harness.fixture.whenStable();
    },
    async click(selector: string) {
      page().querySelector<HTMLButtonElement>(selector)!.click();
      await harness.fixture.whenStable();
    },
  };
}

describe('ProductosPage: búsqueda, filtros y orden', () => {
  describe('controles', () => {
    it('cada campo tiene una etiqueta visible asociada, además del placeholder', async () => {
      const { page } = await open('/productos');

      for (const [id, label] of [
        ['catalogo-busqueda', 'Buscar'],
        ['catalogo-marca', 'Marca o línea'],
        ['catalogo-orden', 'Ordenar'],
      ]) {
        expect(page().querySelector(`#${id}`), id).not.toBeNull();
        expect(text(page().querySelector(`label[for="${id}"]`))).toBe(label);
      }
      expect(page().querySelector('form[role="search"]')).not.toBeNull();
      expect(text(page().querySelector('.catalog-filters fieldset legend'))).toBe('Categoría');
      for (const radio of Array.from(page().querySelectorAll('input[name="categoria"]'))) {
        expect(text(radio.closest('label'))).toBeTruthy();
      }
    });

    it('sin criterios muestra una sola lista mezclada y anuncia el total', async () => {
      const { page, status, links } = await open('/productos');

      expect(status()).toBe('Mostrando los 94 productos');
      expect(links().length).toBe(94);
      expect(page().querySelectorAll('app-catalog-grid').length).toBe(1);
      expect(text(page().querySelector('app-catalog-grid h2'))).toBe('Todos los productos');
      expect(page().querySelector('#guantes')).toBeNull();
      expect(page().querySelector('.catalog-tools__button')!.hasAttribute('disabled')).toBe(true);
    });
  });

  it('la búsqueda filtra, anuncia el conteo y queda en la URL', async () => {
    const { search, status, links, url } = await open('/productos');

    await search('kondor');

    expect(status()).toBe('Mostrando 2 de 94 productos');
    expect([...links()].sort()).toEqual([
      '/productos/botas-kondor-dielectricas',
      '/productos/botas-kondor-soldador',
    ]);
    expect(url()).toBe('/productos?q=kondor');
  });

  it('espera a que se termine de escribir antes de cambiar la URL', async () => {
    const { page, harness, url, status } = await open('/productos');
    const input = page().querySelector<HTMLInputElement>('#catalogo-busqueda')!;

    input.value = 'kondor';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await harness.fixture.whenStable();
    expect(url()).toBe('/productos');

    await new Promise((resolve) => setTimeout(resolve, 300));
    await harness.fixture.whenStable();
    expect(url()).toBe('/productos?q=kondor');
    expect(status()).toBe('Mostrando 2 de 94 productos');
    expect(input.value).toBe('kondor');
  });

  it('filtra por categoría y conserva las tarjetas de esa categoría', async () => {
    const { page, category, checkedCategory, status, url } = await open('/productos');

    await category('caretas');

    expect(checkedCategory()).toBe('caretas');

    expect(url()).toBe('/productos?categoria=caretas');
    expect(status()).toBe('Mostrando 4 de 94 productos');
    expect(text(page().querySelector('#caretas h2'))).toBe('Caretas');
    expect(page().querySelector('#guantes')).toBeNull();
  });

  it('combina búsqueda, categoría, marca y orden en la URL', async () => {
    const { search, select, category, links, status, url } = await open('/productos');

    await category('calzado-caucho');
    await select('#catalogo-marca', 'Croydon');
    await search('machita');
    await select('#catalogo-orden', 'nombre-desc');

    expect(status()).toBe('Mostrando 2 de 94 productos');
    expect(links()).toEqual([
      '/productos/botas-croydon-machita-negra',
      '/productos/botas-croydon-machita-azul',
    ]);
    expect(url()).toBe(
      '/productos?q=machita&categoria=calzado-caucho&marca=Croydon&orden=nombre-desc',
    );
  });

  it('al ordenar por nombre muestra una sola lista, sin precios', async () => {
    const { page, select } = await open('/productos');

    await select('#catalogo-orden', 'nombre-asc');

    expect(page().querySelectorAll('app-catalog-grid').length).toBe(1);
    expect(page().querySelector('.today-special__note')).toBeNull();
    expect(page().querySelector('.catalog-tools__notice')).toBeNull();
  });

  it('al ordenar por precio lo presenta como ficticio, con el aviso del catálogo', async () => {
    const { page, select } = await open('/productos');

    await select('#catalogo-orden', 'precio-asc');

    expect(text(page().querySelector('.catalog-tools__notice[role="note"]'))).toBe(
      PRODUCT_CATALOG.notice,
    );
    const notes = page().querySelectorAll('.today-special__note');
    expect(notes.length).toBe(94);
    expect(text(notes[0])).toMatch(/^Precio ficticio: /);
    expect(page().querySelector('a.today-special__link')!.getAttribute('aria-label')).toContain(
      'Precio ficticio',
    );
  });

  describe('sin resultados', () => {
    it('lo anuncia y ofrece limpiar; el foco vuelve al buscador', async () => {
      const { page, search, status, links, click, url } = await open('/productos');

      await search('zzzz');

      expect(status()).toBe('Sin resultados: 0 de 94 productos');
      expect(links()).toEqual([]);
      expect(text(page().querySelector('.catalog-empty'))).toContain('No encontramos productos');

      await click('.catalog-empty button');

      expect(url()).toBe('/productos');
      expect(status()).toBe('Mostrando los 94 productos');
      expect(page().querySelector('.catalog-empty')).toBeNull();
      expect(page().querySelector<HTMLInputElement>('#catalogo-busqueda')!.value).toBe('');
    });

    it('una combinación válida sin coincidencias no es un error', async () => {
      const { status } = await open('/productos?categoria=gafas&marca=Croydon');

      expect(status()).toBe('Sin resultados: 0 de 94 productos');
    });
  });

  it('el botón general limpia búsqueda, filtros y orden, incluido un texto aún sin aplicar', async () => {
    const { page, click, checkedCategory, url, status, harness } = await open(
      '/productos?categoria=cascos&marca=3M&orden=precio-asc',
    );
    const input = page().querySelector<HTMLInputElement>('#catalogo-busqueda')!;
    input.value = 'pendiente';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    harness.detectChanges();

    await click('.catalog-tools__button');

    expect(url()).toBe('/productos');
    expect(status()).toBe('Mostrando los 94 productos');
    expect(input.value).toBe('');
    expect(checkedCategory()).toBe('');
    for (const id of ['#catalogo-marca', '#catalogo-orden']) {
      expect(page().querySelector<HTMLSelectElement>(id)!.value, id).toBe('');
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(url()).toBe('/productos');
  });

  describe('URL', () => {
    it('una URL compartida restaura los controles y el resultado', async () => {
      const { page, status, links, checkedCategory } = await open(
        '/productos?q=machita&categoria=calzado-caucho&marca=Croydon&orden=nombre-asc',
      );
      const value = (id: string) =>
        page().querySelector<HTMLInputElement | HTMLSelectElement>(id)!.value;

      expect(value('#catalogo-busqueda')).toBe('machita');
      expect(checkedCategory()).toBe('calzado-caucho');
      expect(value('#catalogo-marca')).toBe('Croydon');
      expect(value('#catalogo-orden')).toBe('nombre-asc');
      expect(status()).toBe('Mostrando 2 de 94 productos');
      expect(links()[0]).toBe('/productos/botas-croydon-machita-azul');
    });

    it('los parámetros inválidos muestran el catálogo completo, sin errores', async () => {
      const { page, links, status, checkedCategory } = await open(
        '/productos?categoria=no-existe&marca=Acme&orden=azar&otro=1',
      );

      expect(status()).toBe('Mostrando los 94 productos');
      expect(links().length).toBe(94);
      expect(checkedCategory()).toBe('');
      expect(page().querySelector('.catalog-tools__button')!.hasAttribute('disabled')).toBe(true);
    });

    it('un texto con marcado se muestra como texto', async () => {
      const { page, status } = await open(
        `/productos?q=${encodeURIComponent('<img src=x onerror=alert(1)>')}`,
      );

      expect(status()).toBe('Sin resultados: 0 de 94 productos');
      expect(page().querySelector('img[src="x"]')).toBeNull();
    });
  });

  describe('enlaces a los detalles', () => {
    it('cada tarjeta filtrada enlaza a su detalle con imagen y texto alternativo', async () => {
      const { page } = await open('/productos?categoria=gafas&orden=nombre-asc');
      const anchors = page().querySelectorAll<HTMLAnchorElement>('a.today-special__link');

      expect(anchors.length).toBe(8);
      for (const anchor of Array.from(anchors)) {
        const product = PRODUCT_CATALOG.products.find(
          (p) => `/productos/${p.slug}` === anchor.getAttribute('href'),
        );
        expect(product, anchor.getAttribute('href')!).toBeDefined();
        expect(anchor.querySelector('img')!.getAttribute('alt')).toBe(product!.image.alt);
      }
    });

    it('la URL filtrada reconstruye el catálogo al regresar desde un detalle', async () => {
      const { harness, page, search, click, url, status } = await open('/productos');
      await search('kondor');

      await click('a[href="/productos/botas-kondor-soldador"]');
      expect(url()).toBe('/productos/botas-kondor-soldador');
      expect(text(page().querySelector('h1'))).toBe('Botas Kondor Soldador');

      await harness.navigateByUrl('/productos?q=kondor');

      expect(url()).toBe('/productos?q=kondor');
      expect(status()).toBe('Mostrando 2 de 94 productos');
      expect(page().querySelector<HTMLInputElement>('#catalogo-busqueda')!.value).toBe('kondor');
    });
  });

  describe('conteo y productos repetidos', () => {
    /** El número anunciado debe coincidir con las tarjetas, sin ningún producto repetido. */
    function expectExactCount(
      { status, links }: Awaited<ReturnType<typeof open>>,
      expected: number,
      label: string,
    ) {
      expect(links().length, label).toBe(expected);
      expect(new Set(links()).size, label).toBe(expected);
      expect(status()?.match(/\d+/)?.[0], label).toBe(String(expected));
    }

    it('la vista completa tiene los 94 productos, una tarjeta por producto', async () => {
      const view = await open('/productos');

      expectExactCount(view, 94, 'vista completa');
    });

    it('un producto de dos categorías aparece una vez en cada listado', async () => {
      const view = await open('/productos');
      const gel = '/productos/gel-antibacterial';
      const n95 = '/productos/tapabocas-3m-desechable-n95';
      const times = (href: string) => view.links().filter((link) => link === href).length;

      for (const category of ['', 'otros', 'bioseguridad']) {
        await view.category(category);
        expect(times(gel), category).toBe(1);
      }
      for (const category of ['', 'mascarillas-respiradores-filtros', 'bioseguridad']) {
        await view.category(category);
        expect(times(n95), category).toBe(1);
      }
    });

    it('coincide con las tarjetas en cada categoría, con y sin orden, y al limpiar', async () => {
      const view = await open('/productos');

      for (const { id, items } of PRODUCT_CATALOG.categories) {
        await view.category(id);
        await view.select('#catalogo-orden', '');
        expectExactCount(view, items.length, id);
        await view.select('#catalogo-orden', 'precio-asc');
        expectExactCount(view, items.length, `${id} por precio`);
      }

      await view.click('.catalog-tools__button');
      expectExactCount(view, 94, 'tras limpiar');
    });

    it('coincide con las tarjetas al buscar, incluso sin resultados', async () => {
      const view = await open('/productos');

      for (const [q, expected] of [
        ['gel', 2],
        ['alcohol', 1],
        ['zzzz', 0],
      ] as const) {
        await view.search(q);
        expectExactCount(view, expected, q);
      }
    });
  });

  describe('composición de tienda', () => {
    it('no muestra el collage y deja el texto introductorio después de los resultados', async () => {
      const { page } = await open('/productos');
      const results = page().querySelector('.catalog-results')!;
      const intro = page().querySelector('app-intro-section')!;

      expect(page().querySelector('app-image-gallery')).toBeNull();
      expect(page().textContent).not.toContain('Te asesoramos');
      expect(text(intro.querySelector('h2'))).toBe(
        'Elementos de Protección Personal en Sogamoso, Boyacá',
      );
      expect(results.contains(intro)).toBe(false);
      expect(
        results.compareDocumentPosition(intro) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    });

    it('el control de filtros abre y cierra el panel, y devuelve el foco al cerrar', async () => {
      const { page, harness, category } = await open('/productos');
      const toggle = page().querySelector<HTMLButtonElement>('.catalog-filters__toggle')!;
      const panel = page().querySelector(`#${toggle.getAttribute('aria-controls')}`)!;

      expect(toggle.getAttribute('aria-expanded')).toBe('false');

      toggle.click();
      await harness.fixture.whenStable();
      expect(toggle.getAttribute('aria-expanded')).toBe('true');
      expect(panel.classList).toContain('catalog-filters__panel--open');

      await category('guantes');
      expect(toggle.getAttribute('aria-expanded')).toBe('true');
      expect(text(toggle)).toContain('1 activo');
      expect(text(page().querySelector('.catalog-filters__close'))).toBe('Ver resultados (8)');

      page().querySelector<HTMLButtonElement>('.catalog-filters__close')!.click();
      await harness.fixture.whenStable();
      expect(toggle.getAttribute('aria-expanded')).toBe('false');
      expect(document.activeElement).toBe(toggle);
    });
  });

  describe('tarjetas', () => {
    it('muestran marca, tipo, nombre y estrellas sin calificación', async () => {
      const { page } = await open('/productos?q=argyll%20amarillo');
      const card = page().querySelector('app-catalog-grid .column')!;

      expect(text(card.querySelector('.catalog-card__meta'))).toBe('Croydon | Bota de caucho');
      expect(text(card.querySelector('.today-special__title'))).toBe(
        'Botas Croydon Argyll Amarillo',
      );
      expect(text(card.querySelector('.catalog-card__rating'))).toContain('Sin calificaciones');
      expect(card.querySelector('.catalog-card__stars')!.getAttribute('aria-hidden')).toBe('true');
      expect(card.querySelector('.catalog-card__stars')!.textContent).not.toContain('★');
    });

    it('sin marca omiten el separador y el dato', async () => {
      const { page } = await open('/productos?q=cono');
      const card = Array.from(page().querySelectorAll('app-catalog-grid .column')).find(
        (c) => c.getAttribute('data-slug') === 'cono',
      )!;

      expect(text(card.querySelector('.catalog-card__meta'))).toBe('Cono de señalización');
      expect(card.querySelector('.catalog-card__brand')).toBeNull();
    });
  });

  describe('vista rápida', () => {
    const SLUG = 'botas-croydon-argyll-amarillo';
    async function card() {
      const view = await open('/productos?q=argyll%20amarillo');
      const el = view.page().querySelector<HTMLElement>(`[data-slug="${SLUG}"]`)!;
      return {
        ...view,
        el,
        settle: () => view.harness.fixture.whenStable(),
        popup: () => el.querySelector('[role="tooltip"]'),
        link: el.querySelector<HTMLAnchorElement>('a')!,
        button: el.querySelector<HTMLButtonElement>('.catalog-card__quick')!,
      };
    }
    const pointer = (type: string, pointerType: string) =>
      Object.assign(new MouseEvent(type), { pointerType });
    const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    it('no forma parte del HTML hasta abrirse', async () => {
      const { popup } = await card();

      expect(popup()).toBeNull();
    });

    it('con el puntero se abre tras un retraso, sin diálogo, y se cierra al salir', async () => {
      const { el, popup, settle, link } = await card();

      el.dispatchEvent(pointer('pointerenter', 'mouse'));
      await settle();
      expect(popup()).toBeNull();

      await wait(450);
      await settle();
      expect(text(popup())).toContain('Botas Croydon Argyll Amarillo');
      expect(text(popup())).toContain('Categoría: Calzado Caucho');
      expect(text(popup())).toContain('Marca: Croydon');
      expect(text(popup())).toContain('Descripción de demostración');
      expect(link.getAttribute('aria-describedby')).toBe(popup()!.id);
      expect(el.querySelector('[role="dialog"]')).toBeNull();

      el.dispatchEvent(pointer('pointerleave', 'mouse'));
      await settle();
      expect(popup()).toBeNull();
    });

    it('salir antes del retraso cancela la apertura', async () => {
      const { el, popup, settle } = await card();

      el.dispatchEvent(pointer('pointerenter', 'mouse'));
      el.dispatchEvent(pointer('pointerleave', 'mouse'));
      await wait(450);
      await settle();

      expect(popup()).toBeNull();
    });

    it('un toque no la abre: en táctil se usa el botón', async () => {
      const { el, popup, settle, button } = await card();

      el.dispatchEvent(pointer('pointerenter', 'touch'));
      await wait(450);
      await settle();
      expect(popup()).toBeNull();

      expect(button.getAttribute('aria-expanded')).toBe('false');
      button.click();
      await settle();
      expect(popup()).not.toBeNull();
      expect(button.getAttribute('aria-expanded')).toBe('true');
      expect(button.getAttribute('aria-controls')).toBe(popup()!.id);

      button.click();
      await settle();
      expect(popup()).toBeNull();
    });

    it('se abre al enfocar con teclado, se cierra al salir y con Escape', async () => {
      const { popup, settle, link } = await card();
      vi.spyOn(link, 'matches').mockReturnValue(true);

      link.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
      await settle();
      expect(popup()).not.toBeNull();

      link.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: null }));
      await settle();
      expect(popup()).toBeNull();

      link.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
      await settle();
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      await settle();
      expect(popup()).toBeNull();
    });

    it('tocar fuera la cierra; abrir otra deja una sola abierta', async () => {
      const { page, popup, settle, button } = await open('/productos?q=croydon').then(async (v) => {
        const el = v.page().querySelector<HTMLElement>('app-catalog-grid .column')!;
        return {
          ...v,
          settle: () => v.harness.fixture.whenStable(),
          popup: () => el.querySelector('[role="tooltip"]'),
          button: el.querySelector<HTMLButtonElement>('.catalog-card__quick')!,
        };
      });

      button.click();
      await settle();
      expect(popup()).not.toBeNull();

      page().querySelectorAll<HTMLButtonElement>('.catalog-card__quick')[1].click();
      await settle();
      expect(page().querySelectorAll('[role="tooltip"]').length).toBe(1);

      document.body.click();
      await settle();
      expect(page().querySelectorAll('[role="tooltip"]').length).toBe(0);
    });

    it('no muestra precios y no intercepta el enlace al detalle', async () => {
      const { popup, settle, button, link, url } = await card();

      button.click();
      await settle();
      expect(text(popup())).not.toMatch(/COP|\$|Precio/);

      link.click();
      await settle();
      expect(url()).toBe(`/productos/${SLUG}`);
    });
  });

  describe('enlaces antiguos con ancla', () => {
    it('/productos#guantes abre esa categoría, y elegir otra quita el ancla', async () => {
      const { page, status, checkedCategory, category, url } = await open('/productos#guantes');

      expect(status()).toBe('Mostrando 8 de 94 productos');
      expect(checkedCategory()).toBe('guantes');
      expect(text(page().querySelector('#guantes h2'))).toBe('Guantes');

      await category('');
      expect(url()).toBe('/productos');
      expect(status()).toBe('Mostrando los 94 productos');
    });

    it('un ancla desconocida no filtra', async () => {
      const { status } = await open('/productos#no-existe');

      expect(status()).toBe('Mostrando los 94 productos');
    });
  });

  describe('Encuentra todo en Solgases', () => {
    const groups = (page: HTMLElement) =>
      new Map(
        Array.from(page.querySelectorAll('app-catalog-directory h3')).map((h3) => [
          text(h3),
          Array.from(h3.parentElement!.querySelectorAll('a')),
        ]),
      );

    it('queda al final de la página, después del catálogo y del texto', async () => {
      const { page } = await open('/productos');
      const main = page().querySelector('main')!;

      expect(main.lastElementChild!.tagName).toBe('APP-CATALOG-DIRECTORY');
      expect(text(page().querySelector('app-catalog-directory h2'))).toBe(
        'Encuentra todo en Solgases',
      );
    });

    it('enlaza solo categorías, marcas, productos y servicios reales', async () => {
      const { page } = await open('/productos');
      const found = groups(page());
      const hrefs = (name: string) => found.get(name)!.map((a) => a.getAttribute('href')!);
      const slugs = new Set(PRODUCT_CATALOG.products.map((p) => `/productos/${p.slug}`));
      const services = new Set(SITE_SERVICE_CATALOG.services.map((s) => `/servicios/${s.slug}`));

      expect([...found.keys()]).toEqual([
        'Categorías',
        'Marcas y líneas',
        'Productos relevantes',
        'Servicios',
      ]);
      expect(hrefs('Categorías')).toEqual(
        CATEGORY_OPTIONS.map((c) => `/productos?categoria=${c.value}`),
      );
      expect(hrefs('Marcas y líneas')).toEqual(
        BRAND_OPTIONS.map((b) => `/productos?marca=${encodeURIComponent(b)}`),
      );
      const [viewAllProducts, ...products] = hrefs('Productos relevantes').reverse();
      expect(viewAllProducts).toBe('/productos');
      expect(products.every((href) => slugs.has(href))).toBe(true);
      const [viewAllServices, ...siteServices] = hrefs('Servicios').reverse();
      expect(viewAllServices).toBe('/servicios');
      expect(siteServices.every((href) => services.has(href))).toBe(true);
    });

    it('no repite ningún enlace dentro de un grupo', async () => {
      const { page } = await open('/productos');

      for (const [name, links] of groups(page())) {
        const hrefs = links.map((a) => a.getAttribute('href'));
        expect(new Set(hrefs).size, name!).toBe(hrefs.length);
      }
    });

    it('usa selecciones cortas y no promete promociones ni tendencias', async () => {
      const { page } = await open('/productos');
      const section = page().querySelector('app-catalog-directory')!;

      for (const [name, links] of groups(page())) {
        expect(links.length, name!).toBeLessThanOrEqual(12);
      }
      expect(text(section)).not.toMatch(/promoci|tendencia|favorit|del mes|oferta|COP/i);
    });

    it('sus enlaces aplican el filtro en el catálogo', async () => {
      const { page, harness, status, checkedCategory } = await open('/productos');

      page()
        .querySelector<HTMLAnchorElement>(
          'app-catalog-directory a[href="/productos?categoria=caretas"]',
        )!
        .click();
      await harness.fixture.whenStable();

      expect(checkedCategory()).toBe('caretas');
      expect(status()).toBe('Mostrando 4 de 94 productos');
    });
  });

  describe('otras páginas', () => {
    it('filtrar en /productos no altera Bioseguridad, Inicio ni Servicios', async () => {
      const cards = (page: HTMLElement) =>
        Array.from(page.querySelectorAll('a.today-special__link')).map((a) =>
          a.getAttribute('href'),
        );
      const view = await open('/productos');
      const pages = [
        ['/bioseguridad', 20],
        ['/', 32],
        ['/servicios', 18],
      ] as const;

      const before = [];
      for (const [path] of pages) {
        await view.harness.navigateByUrl(path);
        before.push(cards(view.page()));
      }

      await view.harness.navigateByUrl('/productos?q=gel&categoria=bioseguridad&orden=precio-asc');
      expect(view.status()).toBe('Mostrando 2 de 94 productos');

      for (const [index, [path, count]] of pages.entries()) {
        await view.harness.navigateByUrl(path);
        const page = view.page();
        expect(cards(page).length, path).toBe(count);
        expect(cards(page), path).toEqual(before[index]);
        expect(page.querySelector('.today-special__note'), path).toBeNull();
        // Servicios tiene sus propios controles: lo que no puede aparecer son los de Productos.
        expect(page.querySelector('#catalogo-busqueda'), path).toBeNull();
      }
    });
  });
});
