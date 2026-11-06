import { TestBed } from '@angular/core/testing';
import { ContactoPage } from './contacto';

describe('ContactoPage', () => {
  it('conserva el formulario POST hacia el script PHP con los mismos campos', async () => {
    TestBed.configureTestingModule({ imports: [ContactoPage] });
    const fixture = TestBed.createComponent(ContactoPage);
    await fixture.whenStable();
    const form = (fixture.nativeElement as HTMLElement).querySelector('form')!;

    expect(form.getAttribute('action')).toBe('php/enviar-prueba.php');
    expect(form.method.toLowerCase()).toBe('post');
    const names = Array.from(form.querySelectorAll('[name]')).map((f) => f.getAttribute('name'));
    expect(names).toEqual(['nombre', 'correo', 'telefono', 'mensaje']);
  });
});
