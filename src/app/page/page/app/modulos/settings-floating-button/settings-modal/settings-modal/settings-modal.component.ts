import { Component, EventEmitter, Output } from '@angular/core';
import { ClockService } from '../../../../services/clock.service';

@Component({
  selector: 'app-settings-modal',
  standalone: false,
  templateUrl: './settings-modal.component.html',
  styleUrl: './settings-modal.component.scss'
})
export class SettingsModalComponent {
  @Output() close = new EventEmitter<void>();

  isVisible = false;
  minutes: number = 25; // Default 25 minutes
  seconds: number = 0; // Default 0 seconds

  constructor(private clockService: ClockService) {}

  openModal() {
    this.isVisible = true;
    // Load current timer duration
    const totalSeconds = this.clockService.getInitialTime();
    this.minutes = Math.floor(totalSeconds / 60);
    this.seconds = totalSeconds % 60;
  }

  closeModal() {
    this.isVisible = false;
    this.close.emit();
  }

  onSubmit() {
    // Save timer duration in seconds
    const totalSeconds = this.minutes * 60 + this.seconds;
    this.clockService.setInitialTime(totalSeconds);
    this.closeModal();
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}
