import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, timer, Subscription, Subject } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import { SessionLogService } from './session-log.service';

@Injectable({
  providedIn: 'root'
})
export class ClockService {
  private initialTime = 25 * 60; // 25 minutes in seconds
  private timer$: BehaviorSubject<number> = new BehaviorSubject(this.initialTime);
  private timerSubscription: Subscription | undefined;
  private isPaused = false;
  private currentTime = this.initialTime;
  private pomodoroCounter = 0;
  private completedPomodoros: { task: string, startTime: string, endTime: string, duration: number, description: string }[] = [];
  private isRunning$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private autoReset$: Subject<void> = new Subject<void>();
  private currentSession: {title: string, description: string} | null = null;
  private currentSession$: BehaviorSubject<{title: string, description: string} | null> = new BehaviorSubject<{title: string, description: string} | null>(null);

  constructor(private sessionLogService: SessionLogService) { }

  start() {
    // Si ya hay una suscripción activa y no está pausado, no hacer nada
    if (this.timerSubscription && !this.timerSubscription.closed && !this.isPaused) {
      return;
    }

    // Si está pausado, continuar desde el tiempo actual
    const startTime = this.isPaused ? this.currentTime : this.initialTime;
    this.isPaused = false;
    this.isRunning$.next(true);

    this.timerSubscription = timer(0, 1000).pipe(
      take(startTime + 1),
      map(i => startTime - i),
      tap(val => {
        if (val === 0) {
          this.pomodoroCounter++;
          const now = new Date();
          const endTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          const startTime = new Date(now.getTime() - this.initialTime * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          const currentSession = this.getCurrentSession();
          const taskName = currentSession && currentSession.title ? currentSession.title : `Tarea ${this.pomodoroCounter}`;
          const description = currentSession && currentSession.description ? currentSession.description : '';
          this.completedPomodoros.push({ task: taskName, startTime, endTime, duration: this.initialTime, description });
          this.sessionLogService.updatePomodoros(this.completedPomodoros);
          this.reset();
          this.autoReset$.next();
        }
      })
    ).subscribe(val => {
      this.currentTime = val;
      this.timer$.next(val);
    });
  }

  pause() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.isPaused = true;
      this.isRunning$.next(false);
    }
  }

  reset() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    this.isPaused = false;
    this.currentTime = this.initialTime;
    this.timer$.next(this.initialTime);
    this.isRunning$.next(false);
  }

  getTimer(): Observable<number> {
    return this.timer$.asObservable();
  }

  getIsRunning(): Observable<boolean> {
    return this.isRunning$.asObservable();
  }

  getAutoReset(): Observable<void> {
    return this.autoReset$.asObservable();
  }

  skip() {
    if (this.timerSubscription && !this.timerSubscription.closed) {
      this.timerSubscription.unsubscribe();
      this.pomodoroCounter++;
      const now = new Date();
      const endTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const elapsedTime = this.initialTime - this.currentTime;
      const startTime = new Date(now.getTime() - elapsedTime * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const currentSession = this.getCurrentSession();
      const taskName = currentSession && currentSession.title ? currentSession.title : `Tarea ${this.pomodoroCounter}`;
      const description = currentSession && currentSession.description ? currentSession.description : '';
      this.completedPomodoros.push({ task: taskName, startTime, endTime, duration: elapsedTime, description });
      this.sessionLogService.updatePomodoros(this.completedPomodoros);
      this.reset();
      this.autoReset$.next();
    }
  }

  getInitialTime(): number {
    return this.initialTime;
  }

  setInitialTime(seconds: number) {
    this.initialTime = seconds;
    // Reset the timer to the new initial time
    this.reset();
  }

  setCurrentSession(session: {title: string, description: string} | null) {
    this.currentSession = session;
    this.currentSession$.next(session);
  }

  getCurrentSession(): {title: string, description: string} | null {
    return this.currentSession;
  }

  getCurrentSessionObservable(): Observable<{title: string, description: string} | null> {
    return this.currentSession$.asObservable();
  }
}
