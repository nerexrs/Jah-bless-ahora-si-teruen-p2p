import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ClockModule } from './modulos/clock/clock.module';
import { SessionLogModule } from './modulos/session-log/session-log.module';
import { FloatingButtonModule } from './floating-button/floating-button.module';
import { SettingsFloatingButtonModule } from './modulos/settings-floating-button/settings-floating-button.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ClockModule,
    SessionLogModule,
    FloatingButtonModule,
    SettingsFloatingButtonModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
