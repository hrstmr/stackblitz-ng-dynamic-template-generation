import {
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SecurityContext,
  SimpleChanges,
  ViewContainerRef,
} from '@angular/core';
import { bootstrapApplication, DomSanitizer } from '@angular/platform-browser';
import { firstValueFrom } from 'rxjs';
import 'zone.js';

interface ExportableTemplate<T> {
  input?: T;
}

@Component({
  standalone: true,
  template: ``,
})
export class Base<T> implements ExportableTemplate<T>, OnInit {
  elRef = inject(ElementRef) as ElementRef<HTMLElement>;
  @Input() input?: T;
  @Output() html = new EventEmitter<string>();

  ngOnInit() {
    setTimeout(() => this.html.emit(this.getHTML()), 0);
  }
  getHTML() {
    const html = this.elRef.nativeElement.innerHTML;
    // console.log(html);
    return html;
  }
}

@Component({
  selector: 'leaf-content',
  standalone: true,
  template: `
    This is the leaf <strong> content {{input}} </strong>

    some text

    <div class="some class">
Hi from Div
</div>
  `,
})
export class LeafContent extends Base<string> {}

@Component({
  selector: 'inner-item',
  standalone: true,
  template: `
    <button (click)="loadContent()">Load content</button>
  `,
})
export class InnerItem {
  constructor(private viewContainer: ViewContainerRef) {}
  async loadContent() {
    const leaf = this.viewContainer.createComponent(LeafContent);
    leaf.setInput('input', 'blah');
    const el = leaf.location.nativeElement as HTMLElement;
    el.style.display = 'none';
    const html = await firstValueFrom(leaf.instance.html);
    console.log(html);
    leaf.destroy();
  }
}

@Component({
  selector: 'outer-container',
  imports: [InnerItem],
  standalone: true,
  template: `
    <p>This is the start of the outer container</p>
    <inner-item />
    <p>This is the end of the outer container</p>
  `,
})
export class OuterContainer {}

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: 'main.html',
  imports: [OuterContainer],
})
export class App {
  sananize = inject(DomSanitizer);
  name = 'Angular';

  log() {
    const safe = this.sananize.sanitize(
      SecurityContext.HTML,
      'Template <script>alert("0wned")</script> <b>Syntax</b>'
    );
    console.log(safe);
    console.log('hit');
  }
}

bootstrapApplication(App);
