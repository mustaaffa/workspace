import { Component, Input, forwardRef, ViewEncapsulation, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { ControlValueAccessor, UntypedFormControl, NG_VALUE_ACCESSOR, NG_VALIDATORS } from '@angular/forms';
import { ReplaySubject } from 'rxjs';
// import { Options } from "@angular-slider/ngx-slider";
import { DataAdapter } from '@upupa/data';
import { InputComponent } from '../../input/input.component';

// https://angular-slider.github.io/ngx-slider/demos
@Component({
    selector: 'form-slider',
    templateUrl: './slider.component.html',
    styleUrls: ['./slider.component.scss'],
    // encapsulation: ViewEncapsulation.None,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => SliderComponent),
            multi: true,
        },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => SliderComponent), multi: true }
    ]
})
export class SliderComponent extends InputComponent {

    @Input() floor = 0;
    @Input() ceil = 100;
    @Input() step = 1;
    @Input() pushRange: boolean = false;
    @Input() showSelectionBar: boolean = true;

    //@Input() selectionBarGradient: { from: string, to: string };
    //@Input() getSelectionBarColor: (value: number) => string;
    //@Input() getPointerColor: (value: number) => string;

    @Input() direction: 'horizontal' | 'vertical' = "horizontal";


    @Input() adapter: DataAdapter;



    _options = { floor: 0, ceil: 100, showTicks: true, tickStep: 20, stepsArray: [] } as any//as Options;

    override ngOnChanges(changes: SimpleChanges) {
        super.ngOnChanges(changes);
        if (changes['floor']) {
            this.floor = +this.floor;
            if (this._value < this.floor) this.value = this.floor;
        }
        if (changes['ceiling']) {
            this.ceil = +this.ceil;
            if (this._value > this.ceil) this.value = this.ceil;
        }
        if (changes['step']) this.step = +this.step;

        if (changes['adapter']) {
            this.adapter.normalized$.subscribe(n => {
                this._options = {
                    floor: 0, ceil: n.length - 1,
                    showTicks: true,
                    stepsArray: n.map((x, i) => { return { legend: <any>x.display, value: i } })
                };
            })
        }


        if (!this._options.stepsArray) {
            this._options.floor = this.floor;
            this._options.ceil = this.ceil;
            this._options.step = this.step;

            const interval = this.ceil - this.floor;
            if (interval < 10) this._options.tickStep = this.step;
            else if (interval < 100) this._options.tickStep = Math.max(this.step, Math.round(interval / 5));
        }

        this._options.vertical = this.direction === 'vertical';
    }

    _percentage = 0;
    get percentage(): number { return this._percentage; }
    set percentage(v: number) {
        this._percentage = v;
        this.value = Math.round(this.floor + (this.ceil - this.floor) * v);
    }
}