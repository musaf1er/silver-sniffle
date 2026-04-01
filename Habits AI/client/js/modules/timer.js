// client/js/modules/timer.js
export class TimerModule {
  constructor() {
    this.mode = 'focus';
    this.timeLeft = 25 * 60;
    this.isRunning = false;
    this.interval = null;
    this.onTick = null;
    this.onComplete = null;
  }

  setMode(mode) {
    if (this.isRunning) this.stop();
    this.mode = mode;
    this.timeLeft = mode === 'focus' ? 25 * 60 : 5 * 60;
    if (this.onTick) this.onTick(this.timeLeft);
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.interval = setInterval(() => {
      if (this.timeLeft <= 0) {
        this.complete();
      } else {
        this.timeLeft--;
        if (this.onTick) this.onTick(this.timeLeft);
      }
    }, 1000);
  }

  pause() {
    if (this.interval) {
      clearInterval(this.interval);
      this.isRunning = false;
    }
  }

  reset() {
    this.pause();
    this.timeLeft = this.mode === 'focus' ? 25 * 60 : 5 * 60;
    if (this.onTick) this.onTick(this.timeLeft);
  }

  stop() {
    this.pause();
    this.isRunning = false;
  }

  complete() {
    this.pause();
    if (this.onComplete) this.onComplete();
    this.reset();
  }
}