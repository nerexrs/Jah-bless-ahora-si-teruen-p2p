import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SessionLogService {
  private pomodorosSubject = new BehaviorSubject<{ task: string, startTime: string, endTime: string, duration: number, description: string }[]>([]);
  pomodoros$ = this.pomodorosSubject.asObservable();

  updatePomodoros(pomodoros: { task: string, startTime: string, endTime: string, duration: number, description: string }[]) {
    this.pomodorosSubject.next(pomodoros);
  }
}