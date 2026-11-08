import { mergeApplicationConfig } from '@angular/core';
import { BootstrapContext, bootstrapApplication } from '@angular/platform-browser';
import { renderApplication } from '@angular/platform-server';
import { DefaultTitleStrategy, TitleStrategy } from '@angular/router';
import { App } from '../../app';
import { config } from '../../app.config.server';
import { findProductBySlug, formatPrice } from '../../core/products/product-catalog';

/**
 * Renderiza en servidor, como el build. Aquí `Meta` crearía sus etiquetas con el documento global de
 * jsdom, incompatible con el del servidor: los metadatos se comprueban sobre el HTML real en
 * scripts/generate-seo-files.mjs, que también rechaza el precio en cualquier parte de la página.
 */
const serverConfig = mergeApplicationConfig(config, {
  providers: [{ provide: TitleStrategy, useClass: DefaultTitleStrategy }],
});
const bootstrap = (context: BootstrapContext) => bootstrapApplication(App, serverConfig, context);

describe('Prerenderizado del detalle de producto', () => {
  it('el HTML contiene el producto y el aviso, pero no su precio ficticio', async () => {
    const product = findProductBySlug('guante-kodiak')!;
    const rendered = await renderApplication(bootstrap, {
      document: '<app-root></app-root>',
      url: '/productos/guante-kodiak',
    });
    const html = rendered.replace(/\s/g, ' ');

    expect(html).toContain(product.name);
    expect(html).toContain(product.description);
    expect(html).toContain('class="product-detail__notice"');
    expect(html).toContain('class="product-detail__price-slot"');

    expect(html).not.toContain(formatPrice(product.price).replace(/\s/g, ' '));
    expect(html).not.toContain('COP');
    expect(html).not.toContain('Precio ficticio de demostración');
    expect(html).not.toContain('class="product-detail__unit"');
  });
});
