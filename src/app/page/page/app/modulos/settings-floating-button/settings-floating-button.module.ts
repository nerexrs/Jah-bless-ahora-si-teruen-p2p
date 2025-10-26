import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsFloatingButtonComponent } from './settings-floating-button/settings-floating-button.component';
import { SettingsModalModule } from './settings-modal/settings-modal.module';

@NgModule({
  declarations: [
    SettingsFloatingButtonComponent
  ],
  imports: [
    CommonModule,
    SettingsModalModule
  ],
  exports: [
    SettingsFloatingButtonComponent
  ]
})
export class SettingsFloatingButtonModule { }
