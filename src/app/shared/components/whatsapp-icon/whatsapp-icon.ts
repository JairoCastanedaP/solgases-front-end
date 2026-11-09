import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Icono propio de WhatsApp (burbuja de chat con auricular), decorativo y sin dependencias. */
@Component({
  selector: 'app-whatsapp-icon',
  template: `
    <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <path
        d="M16 3C8.8 3 3 8.6 3 15.5c0 2.4.7 4.6 1.9 6.5L3 29l7.3-1.9c1.7.9 3.7 1.4 5.7 1.4 7.2 0 13-5.6 13-12.5S23.2 3 16 3z"
        fill="none"
        stroke="currentColor"
        stroke-width="2.2"
        stroke-linejoin="round"
      />
      <path
        transform="translate(9.2 8.6) scale(0.58)"
        fill="currentColor"
        d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
      />
    </svg>
  `,
  styles: `
    :host {
      display: block;
    }

    svg {
      display: block;
      width: 100%;
      height: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WhatsAppIcon {}
