import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Franja de color con título y, opcionalmente, párrafos descriptivos. */
@Component({
  selector: 'app-intro-section',
  template: `
    <section class="group group--color">
      <div class="container">
        <h2 class="main__title">{{ title() }}</h2>
        @for (paragraph of paragraphs(); track $index) {
          <p class="main__txt">{{ paragraph }}</p>
        }
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntroSection {
  readonly title = input.required<string>();
  readonly paragraphs = input<readonly string[]>([]);
}
