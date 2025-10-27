import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  isEntered = false;

  enterAbyssPressed() {
    this.isEntered = true;
  }

  onPopupClose() {
    this.isEntered = false;
    window.location.href = '/register';
  }

  onAdClick() {
    window.location.href = '/ad';
  }
}
