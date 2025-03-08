import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../core/services/user.service';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MessageToasterService } from '../../../core/services/message-toaster.service';
import { passwordPattern } from '../../../shared/utils/regex';
import { newPassword } from '../../../core/models/models';

@Component({
  selector: 'app-new-password',
  imports: [HeaderComponent, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './new-password.component.html',
  styleUrl: './new-password.component.css',
})
export class NewPasswordComponent implements OnInit {
  constructor(
    private userService: UserService,
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: MessageToasterService
  ) {}
  email!: string | null;
  passwordForm!: FormGroup;

  ngOnInit(): void {
    this.email = localStorage.getItem('email');
    this.initialiseForms();
  }

  initialiseForms() {
    this.passwordForm = this.formBuilder.group({
      password: [
        '',
        [Validators.required, Validators.pattern(passwordPattern)],
      ],
      confirmPassword: ['', [Validators.required]],
    });
  }

  onSubmit() {
    if (this.passwordForm.invalid) {
      this.markFormGroupTouched(this.passwordForm);
      return;
    }
    if (
      this.passwordForm.value.password !==
      this.passwordForm.value.confirmPassword
    ) {
      this.messageService.showErrorToastr('Passowrds not matching');
      this.passwordForm.patchValue({
        password: '',
        confirmPassword: '',
      });
      return;
    }
    if (this.email && this.passwordForm.value.password) {
      const data: newPassword = {
        email: this.email,
        password: this.passwordForm.value.password,
      };
      this.userService.newPassword(data).subscribe({
        next: (Response) => {
          this.messageService.showSuccessToastr(Response.message);
          this.router.navigate(['login']);
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
