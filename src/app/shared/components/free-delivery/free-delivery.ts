import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Aviso de domicilio gratis, con su condición siempre al lado: es el único lugar donde se redacta,
 * para que Nosotros y los servicios digan lo mismo. Solo aparece donde los datos lo indican.
 */
@Component({
  selector: 'app-free-delivery',
  template: `
    <div class="free-delivery" role="note">
      <strong class="free-delivery__tag">Domicilio gratis</strong>
      <p class="free-delivery__condition">
        Sujeto a cobertura y condiciones del servicio. Confirma con nosotros si aplica para tu
        ubicación y servicio antes de solicitarlo.
      </p>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .free-delivery {
      padding: 12px;
      border-left: 5px solid #de423a;
      background: #fff4cc;
      color: #222;
      text-align: left;
    }

    /* Rojo oscuro: con texto blanco, llega al contraste de 4,5:1. */
    .free-delivery__tag {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 4px;
      background: #b92d26;
      color: #fff;
      font-size: 1.05em;
    }

    .free-delivery__condition {
      margin: 8px 0 0;
      font-size: 0.85em;
      line-height: 1.4;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FreeDelivery {}
