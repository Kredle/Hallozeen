import { Injectable, signal } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class CaptchaService {
  private _required = signal<boolean>(true);
  readonly required = this._required.asReadonly();
  requireAgain() { this._required.set(true); }
  markSolved() { this._required.set(false); }
  reset() { this._required.set(true); }
}
