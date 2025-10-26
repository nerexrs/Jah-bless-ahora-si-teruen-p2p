import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionLogComponent } from './session-log.component';
import { FormatTimePipe } from '../clock/format-time.pipe';
import { PomodoroModalComponent } from './pomodoro-modal/pomodoro-modal.component';



@NgModule({
  declarations: [
    SessionLogComponent,
    PomodoroModalComponent
  ],
  imports: [
    CommonModule,
    FormatTimePipe
  ],
  exports: [
    SessionLogComponent
  ]
})
export class SessionLogModule { }
