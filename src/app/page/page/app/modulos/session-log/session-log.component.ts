import { Component, OnInit } from '@angular/core';
import { SessionLogService } from '../../services/session-log.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-session-log',
  standalone: false,
  templateUrl: './session-log.component.html',
  styleUrl: './session-log.component.scss'
})
export class SessionLogComponent implements OnInit {
  pomodoros$!: Observable<{ task: string, startTime: string, endTime: string, duration: number, description: string }[]>;
  selectedPomodoro: { task: string, startTime: string, endTime: string, duration: number, description: string } | null = null;
  modalVisible = false;

  constructor(private sessionLogService: SessionLogService) { }

  ngOnInit() {
    this.pomodoros$ = this.sessionLogService.pomodoros$;
  }

  openModal(pomodoro: { task: string, startTime: string, endTime: string, duration: number, description: string }) {
    this.selectedPomodoro = pomodoro;
    this.modalVisible = true;
  }

  closeModal() {
    this.modalVisible = false;
    this.selectedPomodoro = null;
  }
}
