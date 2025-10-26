import { Component, ViewChild } from '@angular/core';
import { SettingsModalComponent } from '../settings-modal/settings-modal/settings-modal.component';

@Component({
  selector: 'app-settings-floating-button',
  standalone: false,
  templateUrl: './settings-floating-button.component.html',
  styleUrl: './settings-floating-button.component.scss'
})
export class SettingsFloatingButtonComponent {
  @ViewChild('settingsModal') settingsModal!: SettingsModalComponent;

  onClick() {
    this.settingsModal.openModal();
  }
}
