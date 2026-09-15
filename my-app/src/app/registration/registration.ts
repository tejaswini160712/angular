import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  imports: [FormsModule],
  selector: 'app-registration',
  styleUrl: './registration.css',
  templateUrl: './registration.html',
})
export class Registration {
  protected submitted = false;

  protected onSubmit(): void {
    this.submitted = true;
  }
}
