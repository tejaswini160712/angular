import { Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { HttpClient} from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-signin',
  styleUrl: './signin.css',
  templateUrl: './signin.html',
})
export class Signin implements OnInit {
  msgdata = false;
  msg = '';
  signinForm!: FormGroup;
  isSubmitting = false;

  constructor(private fb: FormBuilder, private http: HttpClient) {}

  ngOnInit(): void {
    this.signinForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  onSubmit(): void {
    if (this.signinForm.invalid) {
      this.signinForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.msgdata = false;

    this.http
      .post<{ success: boolean; message: string; user?: { email: string,password:string } }>('api/signin', this.signinForm.value)
      .subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.msg = response.message || 'Sign in successful!';
          this.msgdata = true;
          localStorage.setItem('currentUser', JSON.stringify(response.user || this.signinForm.value));
        },
        error: (error) => {
          this.isSubmitting = false;
          this.msg = error?.error?.message || 'Unable to sign in. Please try again.';
          this.msgdata = true;
        },
      });
  }
}
