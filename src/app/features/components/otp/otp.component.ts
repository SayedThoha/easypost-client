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
import { UserService } from '../../../core/services/user.service';
import { MessageToasterService } from '../../../core/services/message-toaster.service';
import { otpPattern } from '../../../shared/utils/regex';
import { verifyOtp } from '../../../core/models/models';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-otp',
  imports: [HeaderComponent, ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './otp.component.html',
  styleUrl: './otp.component.css',
})
export class OtpComponent implements OnInit {
  timerInterval: any;
  counter: number = 59;
  email!: string | null;
  newEmail!: string | null;
  otpForm!: FormGroup;
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private messageToaster: MessageToasterService
  ) {}

  ngOnInit(): void {
    this.counterFn();
    this.intialiseForms();
    this.email = localStorage.getItem('email');
    this.newEmail = localStorage.getItem('new_email');
  }
  intialiseForms() {
    this.otpForm = this.formBuilder.group({
      otp: ['', [Validators.required, Validators.pattern(otpPattern)]],
    });
  }

  counterFn() {
    this.timerInterval = setInterval(() => {
      this.counter--;
      if (this.counter === 0) {
        clearInterval(this.timerInterval);
      }
    }, 1000);
  }

  resendClicked() {
    this.counter = 59;
    this.counterFn();
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  onSubmit() {
    if (this.otpForm.invalid) {
      this.markFormGroupTouched(this.otpForm);
      return;
    } else {
      let otpData;
      if (this.email && this.otpForm.get('otp')?.value && this.newEmail) {
        otpData = {
          newEmail: this.newEmail,
          email: this.email,
          otp: Number(this.otpForm.get('otp')?.value),
        };
        if (otpData.email && otpData.otp && otpData.newEmail) {
          this.serverCall(otpData);
        }
      } else if (this.email && this.otpForm.get('otp')?.value) {
        otpData = {
          email: this.email,
          otp: Number(this.otpForm.get('otp')?.value),
        };
        if (otpData.email && otpData.otp) {
          this.serverCall(otpData);
        }
      }
    }
  }

  serverCall(otpData: verifyOtp) {
    this.userService.verifyOtp(otpData).subscribe({
      next: (Response) => {
        localStorage.removeItem('email');
        localStorage.removeItem('newEmail');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('accesseduser');
        this.messageToaster.showSuccessToastr(Response.message);
        this.router.navigate(['login']);
      },
      error: (error) => {
        console.log(error.error);
        this.messageToaster.showErrorToastr(error.error.message);
      },
    });
  }
}
