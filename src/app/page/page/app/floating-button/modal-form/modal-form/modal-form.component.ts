import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-modal-form',
  standalone: false,
  templateUrl: './modal-form.component.html',
  styleUrl: './modal-form.component.scss'
})
export class ModalFormComponent {
  @Output() close = new EventEmitter<void>();
  @Output() sessionStarted = new EventEmitter<{title: string, description: string}>();

  isVisible = false;
  title = '';
  description = '';

  openModal() {
    this.isVisible = true;
  }

  closeModal() {
    this.isVisible = false;
    this.close.emit();
  }

  onSubmit() {
    if (this.title.trim()) {
      this.sessionStarted.emit({
        title: this.title.trim(),
        description: this.description.trim()
      });
      this.closeModal();
      // Reset form
      this.title = '';
      this.description = '';
    }
  }
}
