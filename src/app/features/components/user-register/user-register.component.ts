import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { MessageToasterService } from '../../../core/services/message-toaster.service';
import { namePattern, passwordPattern } from '../../../shared/utils/regex';
import { userRegister } from '../../../core/models/models';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-register',
  imports: [HeaderComponent, ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './user-register.component.html',
  styleUrl: './user-register.component.css',
})
export class UserRegisterComponent implements OnInit {
  registrationForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private userService: UserService,
    private messageToaster: MessageToasterService
  ) {}

  ngOnInit(): void {
    this.registrationForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.pattern(namePattern)]],
      lastName: ['', [Validators.required, Validators.pattern(namePattern)]],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [Validators.required, Validators.pattern(passwordPattern)],
      ],
      confirmPassword: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.registrationForm.invalid) {
      this.markFormGroupTouched(this.registrationForm);
      return;
    } else {
      if (
        (this.registrationForm.get('password')?.value as string) !==
        (this.registrationForm.get('confirmPassword')?.value as string)
      ) {
        this.messageToaster.showErrorToastr('Passwords are not matching');
      } else {
        const data: userRegister = {
          firstName: this.registrationForm.get('firstName')?.value as string,
          lastName: this.registrationForm.get('lastName')?.value as string,
          email: this.registrationForm.get('email')?.value as string,
          password: this.registrationForm.get('password')?.value as string,
        };
        this.userService.userRegister(data).subscribe({
          next: (Response) => {
            localStorage.setItem(
              'email',
              this.registrationForm.get('email')?.value
            );
            localStorage.removeItem('new_email');
            this.router.navigate(['otp']);
            this.messageToaster.showSuccessToastr(Response.message);
          },
          error: (Error) => {
            console.error('not registered', Error);
            this.messageToaster.showErrorToastr(Error.error.message);
          },
        });
      }
    }
  }

  login() {
    this.router.navigate(['login']);
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
