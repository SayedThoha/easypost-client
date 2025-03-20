import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { profileData, userDetails } from '../../../core/models/models';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { MessageToasterService } from '../../../core/services/message-toaster.service';
import { Router } from '@angular/router';
import { ImageUploadService } from '../../../core/services/image-upload.service';
import { namePattern } from '../../../shared/utils/regex';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  imports: [HeaderComponent, ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  user_profile_data: any = { firstname: '', lastname: '' };
  userId!: any;
  email_edit: boolean = false;
  name_edit: boolean = false;
  url: any = null;
  imagePath!: any;
  profile_pic_event!: Event;
  edit_profile_picture!: FormGroup;
  name_form!: FormGroup;
  email_form!: FormGroup;

  profileDataSubscription!: Subscription;

  constructor(
    private userService: UserService,
    private showMessage: MessageToasterService,
    private formBuilder: FormBuilder,
    private router: Router,
    private uploadService: ImageUploadService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.profileData();
    this.initializeForms();
    this.name_form.get('firstname')?.disable();
    this.name_form.get('lastname')?.disable();
    this.email_form.get('email')?.disable();
  }

  selectedFile: File | null = null;
  previewUrl: string | null = null;

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.uploadImage();
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  uploadImage() {
    if (this.selectedFile) {
      this.uploadService.uploadImage(this.selectedFile, 'EasyPost').subscribe({
        next: (response) => {
          const image = response;

          this.url = image;
          const userId = localStorage.getItem('accessedUser');
          if (userId) {
            const profileData: profileData = {
              _id: userId,
              profilePicture: image,
            };

            this.upload_image_to_server(profileData);
          }
        },
        error: (error) => {
          console.error('Error uploading image:', error);
          this.showMessage.showErrorToastr(error.error);
        },
      });
    }
  }

  upload_image_to_server(profileData: profileData) {
    this.userService.changeProfilePicture(profileData).subscribe({
      next: (Response) => {
        this.showMessage.showSuccessToastr(Response.message);
      },
      error: (error) => {
        this.showMessage.showErrorToastr(error.error);
      },
    });
  }

  triggerFileInput() {
    const fileInput = document.getElementById(
      'upload_profile'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  private initializeForms(): void {
    this.edit_profile_picture = this.formBuilder.group({
      profile_picture: [null, Validators.required],
    });

    this.name_form = this.formBuilder.group({
      firstname: [
        this.user_profile_data.firstname,
        [
          Validators.required,
          Validators.maxLength(50),
          Validators.pattern(namePattern),
        ],
      ],
      lastname: [
        this.user_profile_data.lastname,
        [
          Validators.required,
          Validators.maxLength(50),
          Validators.pattern(namePattern),
        ],
      ],
    });

    this.email_form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  close_name() {
    this.name_form.patchValue({
      firstname: this.user_profile_data.firstname,
      lastname: this.user_profile_data.lastname,
    });
    this.name_edit = !this.name_edit;
    if (this.name_edit) {
      this.name_form.get('firstname')?.enable();
      this.name_form.get('lastname')?.enable();
    } else {
      this.name_form.get('firstname')?.disable();
      this.name_form.get('lastname')?.disable();
    }
  }

  close_email() {
    this.email_form.patchValue({
      email: this.user_profile_data.email,
    });
    this.email_edit = !this.email_edit;

    if (this.email_edit) {
      this.email_form.get('email')?.enable();
    } else {
      this.email_form.get('email')?.disable();
    }
  }

  submit_name() {
    if (this.name_form.invalid) {
      this.markFormGroupTouched(this.name_form);
      return;
    } else {
      if (
        this.name_form.value.firstname === this.user_profile_data.firstname &&
        this.name_form.value.lastname === this.user_profile_data.lastname
      ) {
        this.close_name();
        return;
      }
      const data = {
        _id: this.userId || undefined,
        firstname: this.name_form.value.firstname,
        lastname: this.name_form.value.lastname,
        email: this.user_profile_data.email,
      };
      this.userService.editUserName(data).subscribe({
        next: (response) => {
          this.showMessage.showSuccessToastr(response.message);
          this.user_profile_data.firstname = data.firstname;
          this.user_profile_data.lastname = data.lastname;
          this.close_name();
        },
        error: (error) => {
          console.error('Error response:', error);
          this.showMessage.showErrorToastr(error.error.message);
          this.close_name();
        },
      });
    }
  }

  submit_email() {
    if (this.email_form.invalid) {
      this.markFormGroupTouched(this.email_form);
      return;
    } else {
      if (this.email_form.value.email === this.user_profile_data.email) {
        this.close_email();
        return;
      }
      const data = {
        _id: this.userId,
        email: this.email_form.value.email,
      };

      this.userService.editUserEmail(data).subscribe({
        next: (Response) => {
          this.showMessage.showSuccessToastr(
            Response.message || 'Email update OTP sent successfully.'
          );
          if (data.email && this.user_profile_data.email) {
            localStorage.setItem('email', this.user_profile_data.email);
            localStorage.setItem('new_email', data.email);
            localStorage.setItem('role', 'user_new_email');
          }
          this.router.navigate(['otp']);
        },
        error: (error) => {
          this.showMessage.showErrorToastr(error.error.message);
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

  profileData() {
    this.userId = localStorage.getItem('accessedUser');

    this.profileDataSubscription = this.userService
      .userDetails(this.userId)
      .subscribe({
        next: (response) => {
          this.user_profile_data = response;
          this.url = this.user_profile_data.profilePicture;
          this.name_form.patchValue({
            firstname: this.user_profile_data.firstname,
            lastname: this.user_profile_data.lastname,
          });
          this.email_form.patchValue({
            email: this.user_profile_data.email,
          });
        },
        error: (error) => {
          this.showMessage.showErrorToastr('Error in fetching profile data');
        },
      });
  }
}
