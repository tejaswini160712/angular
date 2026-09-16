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
constructor(private router:Router) {}
  onSubmit(form: NgForm): void {
    this.showValidation = true;
    this.submitted = false;

    if (form.valid) {
      this.submitted = true;
    }
  }
navigateToSignin(){
     this.router.navigate(['/signin']);  
}
}

