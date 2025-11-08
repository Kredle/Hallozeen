import { Component, HostBinding, HostListener, Input, ElementRef } from '@angular/core';
import { ProductDto } from '../../../api/hallozeen-api-client';
import { CartService } from '../../cart/cart.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss']
})
export class ProductCardComponent {
  @Input() product?: ProductDto;
  @Input() @HostBinding('class.is-selected') selected = false;
  private hoverAudio?: HTMLAudioElement;
  private audioCtx?: AudioContext;
  
  constructor(private el: ElementRef<HTMLElement>, private cart: CartService) {}

  get displayTitle(): string {
    return this.product?.name ?? 'The Grimoire of Glitches';
  }

  get displayPrice(): number | string {
    return this.product?.cost ?? this.product?.weirdCostTitle ?? '???';
  }

  get imageSrc(): string | undefined {
    return this.product?.imageUrl as string | undefined;
  }

  toggleSelected(): void {
    this.selected = !this.selected;
  }

  playHoverSound(): void {
    try {
      if (!this.hoverAudio && this.canPlayMp3()) {
        const audio = new Audio();
        audio.src = 'assets/sounds/teams-notification.mp3';
        audio.preload = 'auto';
        audio.volume = 0.4; // keep it subtle
        audio.addEventListener('error', () => {
          // source failed (404/unsupported) — fallback to beep
          this.hoverAudio = undefined;
          this.playBeep();
        });
        this.hoverAudio = audio;
      }

      if (this.hoverAudio) {
        this.hoverAudio.currentTime = 0; // restart for quick re-entry
        this.hoverAudio.play().catch(() => this.playBeep());
      } else {
        this.playBeep();
      }
    } catch {
      // ignore playback errors (e.g., policies) and try beep
      this.playBeep();
    }
  }

  private canPlayMp3(): boolean {
    try {
      const a = document.createElement('audio');
      return typeof a.canPlayType === 'function' && a.canPlayType('audio/mpeg') !== '';
    } catch {
      return false;
    }
  }

  private playBeep(): void {
    try {
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (this.audioCtx.state === 'suspended') {
        // Attempt resume; may still require a user gesture
        void this.audioCtx.resume().catch(() => {});
      }
      const ctx = this.audioCtx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 tone
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    } catch {
      // As a last resort, do nothing silently
    }
  }

  addToCart(event: MouseEvent): void {
    event.stopPropagation();
    const id = this.product?.id;
    if (id != null) {
      this.cart.add(id, 1, {
        name: this.product?.name ?? undefined,
        cost: this.product?.cost ?? undefined,
        imageUrl: (this.product?.imageUrl as any) ?? undefined,
        weirdCostTitle: (this.product as any)?.weirdCostTitle ?? undefined
      });
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.selected) return;
    const target = event.target as Node | null;
    if (!target) return;
    const clickedInside = this.el.nativeElement.contains(target);
    if (!clickedInside) {
      this.selected = false;
    }
  }

  // Play sound once when cursor enters the component, not per child.
  @HostListener('mouseenter')
  onMouseEnter(): void {
    this.playHoverSound();
  }

  // Toggle selection when clicking anywhere on the component (except where stopped).
  @HostListener('click')
  onHostClick(): void {
    this.toggleSelected();
  }
}
