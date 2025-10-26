import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-pomodoro-modal',
  standalone: false,
  templateUrl: './pomodoro-modal.component.html',
  styleUrl: './pomodoro-modal.component.scss'
})
export class PomodoroModalComponent {
  @Input() pomodoro: { task: string, startTime: string, endTime: string, duration: number, description: string } | null = null;
  @Input() isVisible: boolean = false;
  @Output() close = new EventEmitter<void>();

  closeModal() {
    this.close.emit();
  }
}
