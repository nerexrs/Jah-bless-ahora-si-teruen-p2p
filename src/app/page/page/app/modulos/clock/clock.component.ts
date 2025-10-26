import { Component, OnInit, OnDestroy } from '@angular/core';
import { ClockService } from '../../services/clock.service';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { Renderer2, ElementRef } from '@angular/core';

@Component({
  selector: 'app-clock',
  standalone: false,
  templateUrl: './clock.component.html',
  styleUrl: './clock.component.scss'
})
export class ClockComponent implements OnInit, OnDestroy {
  timer$!: Observable<number>;
  isRunning$!: Observable<boolean>;
  private isRunningSubscription: Subscription | undefined;
  private isRunningValue: boolean = false;
  private autoResetSubscription: Subscription | undefined;
  private isRotated: boolean = false;
  currentSessionTitle: string = '';

  constructor(private clockService: ClockService, private renderer: Renderer2, private el: ElementRef) {
    // Suscribirse a cambios en la sesión actual
    this.clockService.getCurrentSessionObservable().subscribe((session: {title: string, description: string} | null) => {
      this.currentSessionTitle = session ? session.title : '';
    });

    // Limpiar el título cuando termine el pomodoro
    this.clockService.getAutoReset().subscribe(() => {
      this.currentSessionTitle = '';
    });
  }

  ngOnInit() {
    this.timer$ = this.clockService.getTimer();
    this.isRunning$ = this.clockService.getIsRunning();
    this.isRunningSubscription = this.isRunning$.subscribe(isRunning => {
      this.isRunningValue = isRunning;
    });
    this.timer$.subscribe(timerValue => {
      // Timer value changed
    });
    this.autoResetSubscription = this.clockService.getAutoReset().subscribe(() => {
      const button = this.el.nativeElement.querySelector('.play-pause-btn');
      if (button) {
        this.renderer.addClass(button, 'auto-reset');
        setTimeout(() => {
          this.renderer.removeClass(button, 'auto-reset');
        }, 500);
      }
    });
  }

  ngOnDestroy() {
    if (this.isRunningSubscription) {
      this.isRunningSubscription.unsubscribe();
    }
    if (this.autoResetSubscription) {
      this.autoResetSubscription.unsubscribe();
    }
  }

  togglePlayPause() {
    if (this.isRunningValue) {
      this.pause();
    } else {
      this.toggleStartPause();
    }
  }

  toggleStartPause() {
    this.clockService.start();
  }

  pause() {
    this.clockService.pause();
  }

  reset() {
    const svg = this.el.nativeElement.querySelector('.reset-btn svg');
    if (svg) {
      // Toggle the rotated class
      if (this.isRotated) {
        this.renderer.removeClass(svg, 'rotated');
        this.renderer.addClass(svg, 'second-rotate');
        setTimeout(() => {
          this.renderer.removeClass(svg, 'second-rotate');
        }, 500);
      } else {
        this.renderer.addClass(svg, 'rotated');
      }
      this.isRotated = !this.isRotated;
    }
    this.clockService.reset();

    // Trigger the same animation as auto-reset on the play-pause button
    const button = this.el.nativeElement.querySelector('.play-pause-btn');
    if (button) {
      this.renderer.addClass(button, 'auto-reset');
      setTimeout(() => {
        this.renderer.removeClass(button, 'auto-reset');
      }, 500);
    }
  }

  skip() {
    this.clockService.skip();

    // Trigger the same animation as auto-reset on the play-pause button
    const button = this.el.nativeElement.querySelector('.play-pause-btn');
    if (button) {
      this.renderer.addClass(button, 'auto-reset');
      setTimeout(() => {
        this.renderer.removeClass(button, 'auto-reset');
      }, 500);
    }
  }
}
