import { Component, ElementRef, Input, OnChanges, Renderer2, SimpleChanges, inject } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { HtmlPipe, MarkdownPipe } from '@upupa/common';


@Component({
  selector: 'paragraph',
  templateUrl: './paragraph.component.html',
  styleUrls: ['./paragraph.component.scss']
})
export class ParagraphComponent implements OnChanges {
  @Input() control: UntypedFormControl;
  @Input() text: string;
  @Input() renderer: 'markdown' | 'html' | 'none' = 'markdown';
  private readonly _sanitizer = inject(DomSanitizer)
  private readonly host = inject(ElementRef)
  private readonly _rendere = inject(Renderer2)
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['text'] || changes['renderer']) {
      let text = this.text;
      if (this.renderer === 'markdown') text = new MarkdownPipe(this._sanitizer).transform(this.text).toString()
      else if (this.renderer === 'html') text = new HtmlPipe(this._sanitizer).transform(this.text).toString()
      this._rendere.setProperty(this.host.nativeElement, 'innerHTML', text);
    }

  }
}


