import { platformBrowser } from '@angular/platform-browser';
import { AppModule } from './app/app.module';

// Polyfill for process.nextTick required by SimplePeer (WebRTC)
(window as any).process = {
  nextTick: (fn: Function) => setTimeout(fn, 0)
};

platformBrowser().bootstrapModule(AppModule, {
  ngZoneEventCoalescing: true,
})
  .catch(err => console.error(err));
