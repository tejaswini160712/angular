import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  imports: [FormsModule],
  selector: 'app-registration',
  styleUrl: './registration.css',
  templateUrl: './registration.html',
})
export class Registration {
  submitted = false;
  showValidation = false;
  constructor(private router: Router) {}

  onSubmit(form: NgForm): void {
    this.showValidation = true;
    this.submitted = false;

    if (form.valid) {
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      registeredUsers.push({
        email: form.value.email,
        password: form.value.password,
      });
      localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
      this.submitted = true;
    }
  }

  navigateToSignin(): void {
    this.router.navigate(['/signin']);
  }
}

