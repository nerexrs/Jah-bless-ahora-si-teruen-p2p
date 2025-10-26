import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsModalComponent } from './settings-modal/settings-modal.component';

@NgModule({
  declarations: [
    SettingsModalComponent
  ],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [
    SettingsModalComponent
  ]
})
export class SettingsModalModule { }
