import { Directive, ElementRef } from '@angular/core';


@Directive({
  selector: 'popover-target, [popoverTarget]',
  exportAs: 'popoverTarget'
})
export class PopoverTarget { // tslint:disable-line:directive-class-suffix

  constructor(public _elementRef: ElementRef) { }

}
