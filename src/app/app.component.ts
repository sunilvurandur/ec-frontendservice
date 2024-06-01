import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MainComponent } from './main/main.component';
import { Main2Component } from './main2/main2.component';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    MainComponent,
    Main2Component
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})

// @Component({
//   selector: 'app-component-overview',
//   templateUrl: './component-overview.component.html',
// })

export class AppComponent {

}