import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FloatingButtonComponent } from './floating-button/floating-button.component';
import { ModalFormModule } from './modal-form/modal-form.module';



@NgModule({
  declarations: [
    FloatingButtonComponent
  ],
  imports: [
    CommonModule,
    ModalFormModule
  ],
  exports: [
    FloatingButtonComponent
  ]
})
export class FloatingButtonModule { }
