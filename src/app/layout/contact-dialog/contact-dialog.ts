import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { SITE_INFO, SOCIAL_PROFILES_TOKEN } from '../../core/site-info';

export type ContactTopic = 'email' | 'address' | 'phone' | 'facebook' | 'instagram';

const TITLES: Readonly<Record<ContactTopic, string>> = {
  email: 'Correo',
  address: 'Dirección',
  phone: 'Teléfono',
  facebook: 'Facebook',
  instagram: 'Instagram',
};

/**
 * Ventana con un dato de contacto. Usa `<dialog>` nativo: `showModal` ya atrapa el foco, cierra con
 * Escape y deja inerte el resto de la página. Sin contenido hasta abrirse, no altera el HTML estático.
 */
@Component({
  selector: 'app-contact-dialog',
  templateUrl: './contact-dialog.html',
  styleUrl: './contact-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactDialog {
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  private trigger: HTMLElement | null = null;

  protected readonly site = SITE_INFO;
  protected readonly profiles = inject(SOCIAL_PROFILES_TOKEN);
  protected readonly topic = signal<ContactTopic | null>(null);
  protected readonly titles = TITLES;

  open(topic: ContactTopic, trigger: HTMLElement): void {
    this.topic.set(topic);
    this.trigger = trigger;
    // Primero el contenido: `showModal` necesita el título y el botón con `autofocus` ya en el DOM.
    this.changeDetector.detectChanges();
    const dialog = this.dialog().nativeElement;
    if (!dialog.open) {
      dialog.showModal();
    }
  }

  protected close(): void {
    this.dialog().nativeElement.close();
  }

  /** Clic en el fondo: el objetivo es el propio `<dialog>`, no su contenido. */
  protected onDialogClick(event: MouseEvent): void {
    if (event.target === this.dialog().nativeElement) {
      this.close();
    }
  }

  /** Se dispara por cualquier vía de cierre, incluido Escape: el foco vuelve al icono. */
  protected onClosed(): void {
    this.topic.set(null);
    this.trigger?.focus();
    this.trigger = null;
  }
}
