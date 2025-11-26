import { Component, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterOutlet } from '@angular/router';
import { NotificationComponent } from './components/notification/notification';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatIconModule, NotificationComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');
}
