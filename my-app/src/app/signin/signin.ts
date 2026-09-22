import { Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  imports: [ReactiveFormsModule, NgIf],
  selector: 'app-signin',
  styleUrl: './signin.css',
  templateUrl: './signin.html',
})
export class Signin implements OnInit {
  msgdata = false;
  msg = '';
  signinForm!: FormGroup;
  isSubmitting = false;

  constructor(private fb: FormBuilder, private router: Router) {}

  ngOnInit(): void {
    this.signinForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }
  navigateTodashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  onSubmit(): void {
    if (this.signinForm.invalid) {
      this.signinForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.msgdata = false;

    const registeredUsers: Array<{ email: string; password: string }> = JSON.parse(
      localStorage.getItem('registeredUsers') || '[]',
    );
    const user = registeredUsers.find(
      (registeredUser) =>
        registeredUser.email === this.signinForm.value.email &&
        registeredUser.password === this.signinForm.value.password,
    );

    this.isSubmitting = false;
    this.msg = user ? 'Sign in successful!' : 'No account found with those credentials.';
    this.msgdata = true;

    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      this.navigateTodashboard();
    }
  }
}
