import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalFormComponent } from './modal-form/modal-form.component';



@NgModule({
  declarations: [
    ModalFormComponent
  ],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [
    ModalFormComponent
  ]
})
export class ModalFormModule { }
