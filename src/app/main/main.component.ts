import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {
  primaryButtons: string[] = ['Assembly Constituency', 'Parliament Constituency'];
  secondaryButtons: string[] = ['b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8'];

  activePrimaryButton: string = this.primaryButtons[0];
  activeSecondaryButton: string = this.secondaryButtons[0];

  setActivePrimaryButton(button: string): void {
    this.activePrimaryButton = button;
  }

  setActiveSecondaryButton(button: string): void {
    this.activeSecondaryButton = button;
  }
}
