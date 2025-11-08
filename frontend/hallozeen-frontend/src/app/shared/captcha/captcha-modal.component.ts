import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Output, ViewChild, signal, OnDestroy } from '@angular/core';
import { CaptchaService } from './captcha.service';

type State = 'idle' | 'failed' | 'success';

@Component({
  selector: 'app-captcha-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './captcha-modal.component.html',
  styleUrls: ['./captcha-modal.component.scss']
})
export class CaptchaModalComponent implements OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('img', { static: true }) imgRef!: ElementRef<HTMLImageElement>;

  @Output() solved = new EventEmitter<void>();

  state = signal<State>('idle');
  drawing = false;
  private points: { x: number; y: number }[] = [];
  private overscanPx = 0;
  private keyHandler?: (e: KeyboardEvent) => void;

  constructor(private captcha: CaptchaService) {}

  ngAfterViewInit() {
    const img = this.imgRef.nativeElement;
    const canvas = this.canvasRef.nativeElement;
    // Match canvas size to rendered image
    const onReady = () => {
      const rect = img.getBoundingClientRect();
      const overscan = Math.round(Math.min(rect.width, rect.height) * 0.10); // ~10% наружу
      this.overscanPx = overscan;
      canvas.width = Math.max(1, Math.round(rect.width) + overscan * 2);
      canvas.height = Math.max(1, Math.round(rect.height) + overscan * 2);
      canvas.style.width = canvas.width + 'px';
      canvas.style.height = canvas.height + 'px';
      canvas.style.left = -overscan + 'px';
      canvas.style.top = -overscan + 'px';
      this.clearCanvas();
    };
    if (img.complete) onReady();
    else img.addEventListener('load', onReady, { once: true });

    // Developer helper: press Shift+S to draw solution if debug flag set
    if (localStorage.getItem('HZ_CAPTCHA_DEBUG') === '1') {
      this.keyHandler = (e: KeyboardEvent) => {
        if (e.key.toLowerCase() === 's' && e.shiftKey) {
          e.preventDefault();
          this.drawSolution();
        }
      };
      window.addEventListener('keydown', this.keyHandler);
    }
  }

  ngOnDestroy() {
    if (this.keyHandler) window.removeEventListener('keydown', this.keyHandler);
  }

  // Pointer events
  onPointerDown(ev: PointerEvent) {
    ev.preventDefault();
    const { x, y } = this.localXY(ev);
    this.drawing = true;
    this.points = [{ x, y }];
    this.drawDot(x, y, '#B0172A');
  }

  onPointerMove(ev: PointerEvent) {
    if (!this.drawing) return;
    const { x, y } = this.localXY(ev);
    const last = this.points[this.points.length - 1];
    if (!last) return;
    this.points.push({ x, y });
    this.drawSegment(last.x, last.y, x, y, this.state() === 'success' ? '#23D160' : '#B0172A');
  }

  onPointerUp(ev: PointerEvent) {
    if (!this.drawing) return;
    this.drawing = false;
    this.validatePath();
  }

  onReset() {
    this.state.set('idle');
    this.clearCanvas();
    this.points = [];
  }

  onContinue() {
    this.captcha.markSolved();
    this.solved.emit();
  }

  // Helpers
  private ctx(): CanvasRenderingContext2D {
    const ctx = this.canvasRef.nativeElement.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context unavailable');
    return ctx;
  }

  private clearCanvas() {
    const ctx = this.ctx();
    ctx.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
  }

  private drawDot(x: number, y: number, color: string) {
    const ctx = this.ctx();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawSegment(x1: number, y1: number, x2: number, y2: number, color: string) {
    const ctx = this.ctx();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  private localXY(ev: PointerEvent) {
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    return { x: ev.clientX - rect.left, y: ev.clientY - rect.top };
  }

  // Heuristic validator: path must go outside the maze box along the bottom, touching left and right sides, and never enter inside box.
  private validatePath() {
    const w = this.canvasRef.nativeElement.width;
    const h = this.canvasRef.nativeElement.height;
    if (this.points.length < 60) {
      this.state.set('failed');
      return;
    }

    // Approximate inner square of the labyrinth (leave margin for the white border)
    const margin = Math.round(Math.min(w, h) * 0.08); // ~8%
    const left = this.overscanPx + margin;
    const top = this.overscanPx + margin;
    const right = w - (this.overscanPx + margin);
    const bottom = h - (this.overscanPx + margin);

    const leftBorder = this.overscanPx;
    const rightBorder = w - this.overscanPx;
    const bottomBorder = h - this.overscanPx;

    // More forgiving thresholds to account for larger overscan and human error
    const eps = 4; // pixels tolerance
    let insideCount = 0;
    let bottomBandCount = 0;
    let minX = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    // Expanded start/finish zones (so you don't need to hit exact labels)
    const innerHeight = bottom - top;
    const startZone = {
      x1: leftBorder - this.overscanPx, // include overscan outside
      x2: leftBorder + Math.max(20, w * 0.15),
      y1: top + innerHeight * 0.05,
      y2: top + innerHeight * 0.40,
    };
    const finishZone = {
      x1: rightBorder - Math.max(20, w * 0.15),
      x2: rightBorder + this.overscanPx,
      y1: top + innerHeight * 0.60,
      y2: top + innerHeight * 0.95,
    };
    let hitStartZone = false;
    let hitFinishZone = false;
    for (const p of this.points) {
      const inside = p.x >= left && p.x <= right && p.y >= top && p.y <= bottom;
      if (inside) insideCount++;
      if (p.y >= bottomBorder - eps) bottomBandCount++;
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (!hitStartZone && p.x >= startZone.x1 && p.x <= startZone.x2 && p.y >= startZone.y1 && p.y <= startZone.y2) hitStartZone = true;
      if (!hitFinishZone && p.x >= finishZone.x1 && p.x <= finishZone.x2 && p.y >= finishZone.y1 && p.y <= finishZone.y2) hitFinishZone = true;
    }

    // Touch rules: allow being very near the image edge, not strictly outside
    const leftTouch = minX <= leftBorder + eps;
    const rightTouch = maxX >= rightBorder - eps;

    // Allow a portion of points along or below the bottom edge
    const bottomRatio = bottomBandCount / this.points.length;

    // allow a small number of accidental points inside
    const allowedInside = Math.max(6, Math.floor(this.points.length * 0.02));
    const ok = insideCount <= allowedInside && (leftTouch || hitStartZone) && (rightTouch || hitFinishZone) && bottomRatio >= 0.35;
    this.state.set(ok ? 'success' : 'failed');
    // Recolor whole path to final color
    if (this.points.length >= 2) {
      const color = ok ? '#23D160' : '#B0172A';
      const pts = this.points;
      this.clearCanvas();
      for (let i = 1; i < pts.length; i++) this.drawSegment(pts[i - 1].x, pts[i - 1].y, pts[i].x, pts[i].y, color);
    }
  }

  // Developer aid: programmatically draw the correct outer path
  private drawSolution() {
    const canvas = this.canvasRef.nativeElement;
    const w = canvas.width;
    const h = canvas.height;

    const margin = Math.round(Math.min(w, h) * 0.08);
    const top = this.overscanPx + margin;
    const bottom = h - (this.overscanPx + margin);
    const leftBorder = this.overscanPx;
    const rightBorder = w - this.overscanPx;

    const xL = leftBorder - 6; // outside left
    const xR = rightBorder + 6; // outside right
    // Start a bit below the top to match the new START label
    const yStart = top + (bottom - top) * 0.16; // START ~16% from top
    const yBottomOut = h - this.overscanPx + 6; // below bottom

    const pts: { x: number; y: number }[] = [];
    // down along left from the new START
    for (let t = 0; t <= 1; t += 0.01) {
      pts.push({ x: xL, y: yStart + (yBottomOut - yStart) * t });
    }
    // right along bottom
    for (let t = 0; t <= 1; t += 0.01) {
      pts.push({ x: xL + (xR - xL) * t, y: yBottomOut });
    }
    // go up on the right to align with new FINISH label area
    const yFinish = top + (bottom - top) * 0.84; // FINISH ~16% above bottom
    for (let t = 0; t <= 0.35; t += 0.01) {
      pts.push({ x: xR, y: yBottomOut - (yBottomOut - yFinish) * t });
    }

    this.points = pts;
    // Render in green
    this.clearCanvas();
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1];
      const b = pts[i];
      this.drawSegment(a.x, a.y, b.x, b.y, '#23D160');
    }
    this.state.set('success');
    this.captcha.markSolved();
  }
}
