import { Component, signal } from '@angular/core';
import { Registration } from './registration/registration';

@Component({
  imports: [Registration],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('my-app');
}
