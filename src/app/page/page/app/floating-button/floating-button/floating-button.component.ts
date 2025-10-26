import { Component, ViewChild } from '@angular/core';
import { ModalFormComponent } from '../modal-form/modal-form/modal-form.component';
import { ClockService } from '../../services/clock.service';

@Component({
  selector: 'app-floating-button',
  standalone: false,
  templateUrl: './floating-button.component.html',
  styleUrl: './floating-button.component.scss'
})
export class FloatingButtonComponent {
  @ViewChild('modalForm') modalForm!: ModalFormComponent;

  currentSession: {title: string, description: string} | null = null;

  constructor(private clockService: ClockService) {}

  onClick() {
    this.modalForm.openModal();
  }

  onSessionStarted(sessionData: {title: string, description: string}) {
    this.currentSession = sessionData;
    this.clockService.setCurrentSession(sessionData);
    // Aquí puedes iniciar el timer automáticamente si lo deseas
    // this.clockService.start();
  }
}
