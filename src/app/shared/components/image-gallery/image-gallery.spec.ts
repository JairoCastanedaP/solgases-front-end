import { TestBed } from '@angular/core/testing';
import { ImageGallery } from './image-gallery';

describe('ImageGallery', () => {
  it('abre la imagen seleccionada en el modal y lo cierra con el botón', async () => {
    TestBed.configureTestingModule({ imports: [ImageGallery] });
    const fixture = TestBed.createComponent(ImageGallery);
    fixture.componentRef.setInput('columns', [
      [
        { src: 'img/a.jpg', size: 'big' },
        { src: 'img/b.jpg', size: 'small' },
      ],
    ]);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const modal = el.querySelector('.modal')!;
    const images = el.querySelectorAll<HTMLImageElement>('.gallery__img');

    expect(images[0].classList).toContain('gallery__img--big');
    expect(images[1].classList).toContain('gallery__img--small');
    expect(modal.classList).not.toContain('modal--open');

    images[1].click();
    await fixture.whenStable();
    expect(modal.classList).toContain('modal--open');
    expect(el.querySelector('.modal__img')?.getAttribute('src')).toBe('img/b.jpg');

    el.querySelector<HTMLElement>('.modal__boton')!.click();
    await fixture.whenStable();
    expect(modal.classList).not.toContain('modal--open');
  });
});
