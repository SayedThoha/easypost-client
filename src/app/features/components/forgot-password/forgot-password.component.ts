import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { Router } from '@angular/router';
import { MessageToasterService } from '../../../core/services/message-toaster.service';

@Component({
  selector: 'app-forgot-password',
  imports: [HeaderComponent, CommonModule,ReactiveFormsModule,FormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css',
})
export class ForgotPasswordComponent implements OnInit {
  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private router: Router,
    private messageService: MessageToasterService
  ) {}

  emailForm!: FormGroup;

  ngOnInit(): void {
    this.emailForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit() {
    if (this.emailForm.invalid) {
      this.markFormGroupTouched(this.emailForm);
      return;
    }
    const data = this.emailForm.value.email;
    if (data) {
      console.log(data);

      this.userService.verifyEmail({ email: data }).subscribe({
        next: (Response) => {
          if (Response.email) {
            localStorage.setItem('email', Response.email);
          }
          this.messageService.showSuccessToastr(Response.message);
          this.router.navigate(['new_password']);
        },
        error: (Error) => {
          this.messageService.showErrorToastr(Error.error);
        },
      });
    }
  }
  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
