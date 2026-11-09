import { mergeApplicationConfig } from '@angular/core';
import { BootstrapContext, bootstrapApplication } from '@angular/platform-browser';
import { renderApplication } from '@angular/platform-server';
import { DefaultTitleStrategy, TitleStrategy } from '@angular/router';
import { App } from '../../app';
import { config } from '../../app.config.server';

/** Ver la nota sobre `DefaultTitleStrategy` en producto-detalle.prerender.spec.ts. */
const serverConfig = mergeApplicationConfig(config, {
  providers: [{ provide: TitleStrategy, useClass: DefaultTitleStrategy }],
});
const bootstrap = (context: BootstrapContext) => bootstrapApplication(App, serverConfig, context);

describe('Prerenderizado de todo el sitio', () => {
  it('el pie no lleva año y el encabezado no lleva abierta la ventana de contacto', async () => {
    const html = await renderApplication(bootstrap, {
      document: '<app-root></app-root>',
      url: '/contacto',
    });

    expect(html).toContain('Todos los derechos reservados');
    expect(html).not.toMatch(/\d{4}\s*\|/);
    expect(html).toMatch(/<dialog[^>]*>/);
    expect(html).not.toMatch(/<dialog[^>]*\sopen/);
    expect(html).not.toContain('está pendiente de configurar');
  });
});
