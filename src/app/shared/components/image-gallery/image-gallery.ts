import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { OptimizedImagePipe } from '../../images/optimized-image';
import { GalleryImage } from '../../models/gallery-image';

/**
 * Galería de imágenes en columnas. Al hacer clic en una imagen se abre en un
 * modal a pantalla completa (reemplaza a js/modal.js).
 */
@Component({
  selector: 'app-image-gallery',
  imports: [NgOptimizedImage, OptimizedImagePipe],
  templateUrl: './image-gallery.html',
  styleUrl: './image-gallery.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageGallery {
  /** Cada elemento es una columna con sus imágenes en orden vertical. */
  readonly columns = input.required<readonly (readonly GalleryImage[])[]>();

  protected readonly selectedImage = signal<GalleryImage | null>(null);

  protected open(image: GalleryImage): void {
    this.selectedImage.set(image);
  }

  protected close(): void {
    this.selectedImage.set(null);
  }
}
