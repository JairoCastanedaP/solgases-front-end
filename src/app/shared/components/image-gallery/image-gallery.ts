import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { GalleryImage } from '../../models/gallery-image';

/**
 * Galería de imágenes en columnas. Al hacer clic en una imagen se abre en un
 * modal a pantalla completa (reemplaza a js/modal.js).
 */
@Component({
  selector: 'app-image-gallery',
  templateUrl: './image-gallery.html',
  styleUrl: './image-gallery.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageGallery {
  /** Cada elemento es una columna con sus imágenes en orden vertical. */
  readonly columns = input.required<readonly (readonly GalleryImage[])[]>();

  protected readonly selectedImage = signal<string | null>(null);

  protected open(src: string): void {
    this.selectedImage.set(src);
  }

  protected close(): void {
    this.selectedImage.set(null);
  }
}
