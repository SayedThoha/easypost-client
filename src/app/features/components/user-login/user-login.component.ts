import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { MessageToasterService } from '../../../core/services/message-toaster.service';
import { UserService } from '../../../core/services/user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-login',
  imports: [HeaderComponent,ReactiveFormsModule, FormsModule,CommonModule],
  templateUrl: './user-login.component.html',
  styleUrl: './user-login.component.css',
})
export class UserLoginComponent implements OnInit {
  loginForm!: FormGroup;
  constructor(
    private router: Router,
    private messageToaster: MessageToasterService,
    private formBuilder: FormBuilder,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.initialiseForms();
  }

  initialiseForms() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }
  forgetPassword() {
    this.router.navigate(['email_verification']);
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      return;
    } else {
      const data = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password,
      };
      this.userService.userLogin(data).subscribe({
        next: (Response) => {
          this.router.navigate(['home']);
          localStorage.setItem('accessToken', Response.accessToken);
          localStorage.setItem('accessedUser', Response.accessedUser);
          localStorage.setItem('refreshToken', Response.refreshToken);
          console.log('Response userId:', Response.accessedUser);

          console.log('userId:', localStorage.getItem('accessedUser'));

          this.messageToaster.showSuccessToastr(Response.message);
        },
        error: (Error) => {
          this.messageToaster.showErrorToastr(Error.error.message);
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

  register() {
    this.router.navigate(['register']);
  }
}
