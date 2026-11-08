import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import { PRODUCT_CATALOG } from '../../core/products/product-catalog';

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
        ['catalogo-categoria', 'Categoría'],
        ['catalogo-marca', 'Marca o línea'],
        ['catalogo-orden', 'Ordenar'],
      ]) {
        expect(page().querySelector(`#${id}`), id).not.toBeNull();
        expect(text(page().querySelector(`label[for="${id}"]`))).toBe(label);
      }
      expect(page().querySelector('form[role="search"]')).not.toBeNull();
    });

    it('sin criterios conserva las categorías y anuncia el total', async () => {
      const { page, status, links } = await open('/productos');

      expect(status()).toBe('Mostrando los 94 productos');
      expect(links().length).toBe(94);
      expect(page().querySelector('#guantes h2')).not.toBeNull();
      expect(page().querySelector('.catalog-tools__button')!.hasAttribute('disabled')).toBe(true);
    });
  });

  it('la búsqueda filtra, anuncia el conteo y queda en la URL', async () => {
    const { search, status, links, url } = await open('/productos');

    await search('kondor');

    expect(status()).toBe('Mostrando 2 de 94 productos');
    expect(links()).toEqual([
      '/productos/botas-kondor-soldador',
      '/productos/botas-kondor-dielectricas',
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
    const { page, select, status, url } = await open('/productos');

    await select('#catalogo-categoria', 'caretas');

    expect(url()).toBe('/productos?categoria=caretas');
    expect(status()).toBe('Mostrando 4 de 94 productos');
    expect(text(page().querySelector('#caretas h2'))).toBe('Caretas');
    expect(page().querySelector('#guantes')).toBeNull();
  });

  it('combina búsqueda, categoría, marca y orden en la URL', async () => {
    const { search, select, links, status, url } = await open('/productos');

    await select('#catalogo-categoria', 'calzado-caucho');
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

    expect(page().querySelectorAll('app-product-grid').length).toBe(1);
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
    const { page, click, url, status, harness } = await open(
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
    for (const id of ['#catalogo-categoria', '#catalogo-marca', '#catalogo-orden']) {
      expect(page().querySelector<HTMLSelectElement>(id)!.value, id).toBe('');
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(url()).toBe('/productos');
  });

  describe('URL', () => {
    it('una URL compartida restaura los controles y el resultado', async () => {
      const { page, status, links } = await open(
        '/productos?q=machita&categoria=calzado-caucho&marca=Croydon&orden=nombre-asc',
      );
      const value = (id: string) =>
        page().querySelector<HTMLInputElement | HTMLSelectElement>(id)!.value;

      expect(value('#catalogo-busqueda')).toBe('machita');
      expect(value('#catalogo-categoria')).toBe('calzado-caucho');
      expect(value('#catalogo-marca')).toBe('Croydon');
      expect(value('#catalogo-orden')).toBe('nombre-asc');
      expect(status()).toBe('Mostrando 2 de 94 productos');
      expect(links()[0]).toBe('/productos/botas-croydon-machita-azul');
    });

    it('los parámetros inválidos muestran el catálogo completo, sin errores', async () => {
      const { page, status } = await open(
        '/productos?categoria=no-existe&marca=Acme&orden=azar&otro=1',
      );

      expect(status()).toBe('Mostrando los 94 productos');
      expect(page().querySelector('#guantes')).not.toBeNull();
      expect(page().querySelector<HTMLSelectElement>('#catalogo-categoria')!.value).toBe('');
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

    it('la vista completa tiene los 94 productos; la sección Bioseguridad, los 18 no listados antes', async () => {
      const view = await open('/productos');

      expectExactCount(view, 94, 'vista completa');
      const sections = Array.from(view.page().querySelectorAll('app-intro-section')).slice(1);
      const bioseguridad = sections.find((s) => text(s.querySelector('h2')) === 'Bioseguridad')!;
      const grid = bioseguridad.nextElementSibling!;
      expect(grid.querySelectorAll('a.today-special__link').length).toBe(18);
    });

    it('un producto de dos categorías aparece una vez en cada listado', async () => {
      const view = await open('/productos');
      const gel = '/productos/gel-antibacterial';
      const n95 = '/productos/tapabocas-3m-desechable-n95';
      const times = (href: string) => view.links().filter((link) => link === href).length;

      for (const category of ['', 'otros', 'bioseguridad']) {
        await view.select('#catalogo-categoria', category);
        expect(times(gel), category).toBe(1);
      }
      for (const category of ['', 'mascarillas-respiradores-filtros', 'bioseguridad']) {
        await view.select('#catalogo-categoria', category);
        expect(times(n95), category).toBe(1);
      }
    });

    it('coincide con las tarjetas en cada categoría, con y sin orden, y al limpiar', async () => {
      const view = await open('/productos');

      for (const { id, items } of PRODUCT_CATALOG.categories) {
        await view.select('#catalogo-categoria', id);
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
        expect(page.querySelector('.catalog-tools'), path).toBeNull();
      }
    });
  });
});
