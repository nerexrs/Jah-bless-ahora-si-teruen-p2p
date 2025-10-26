import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClockComponent } from './clock.component';
import { FormatTimePipe } from './format-time.pipe';



@NgModule({
  declarations: [
    ClockComponent
  ],
  imports: [
    CommonModule,
    FormatTimePipe
  ],
  exports: [
    ClockComponent
  ]
})
export class ClockModule { }
