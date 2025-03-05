import { Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-profile',
  imports: [HeaderComponent, ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  userDetails!: userDetails;
  userId!: string | null;
  emailEdit: boolean = false;
  name_edit: boolean = false;
  url!: string | null | undefined;
  imagePath!: any;
  // profile_pic_event!:Event;
  originalNameForm!: { firstname: string | null; lastname: string | null };
  originalEmailForm!: { email: string | null };
  edit_profile_picture!: FormGroup;
  nameForm!: FormGroup;
  emailForm!: FormGroup;
  constructor(
    private userService: UserService,
    private messageService: MessageToasterService,
    private formBuilder: FormBuilder,
    private router: Router,
    private uploadService: ImageUploadService
  ) {}

  ngOnInit(): void {
    this.profileData();
    this.initialiseForms();
    this.nameForm.get('firstname')?.disable();
    this.nameForm.get('lastname')?.disable();
    this.emailForm.get('email')?.disable();
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
      console.log('upload file in ts,before service call');
      this.uploadService
        .uploadImage(this.selectedFile, 'medilink24')
        .subscribe({
          next: (response) => {
            const image = response;
            console.log('Image uploaded successfully:', image);
            this.url = image;
            const userId = localStorage.getItem('accessedUser');
            if (userId) {
              const profileData: profileData = {
                _id: userId,
                profilePicture: image,
              };
              console.log('userId in profile page:', profileData._id);

              this.upload_image_to_server(profileData);
            }
          },
          error: (error) => {
            console.error('Error uploading image:', error);
            this.messageService.showErrorToastr(error.error);
          },
        });
    }
  }

  upload_image_to_server(profileData: profileData) {
    this.userService.changeProfilePicture(profileData).subscribe({
      next: (Response) => {
        // this.userDetails.profilePicture=profileData.profilePicture
        // this.url=profileData.profilePicture
        this.messageService.showSuccessToastr(Response.message);
      },
      error: (error) => {
        this.messageService.showErrorToastr(error.error);
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
  initialiseForms() {
    this.edit_profile_picture = this.formBuilder.group({
      profile_picture: [null, Validators.required],
    });

    this.nameForm = this.formBuilder.group({
      firstname: [
        '',
        [
          Validators.required,
          Validators.maxLength(20),
          Validators.pattern(namePattern),
        ],
      ],
      lastname: [
        '',
        [
          Validators.required,
          Validators.maxLength(20),
          Validators.pattern(namePattern),
        ],
      ],
    });

    this.emailForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  closeName() {
    this.nameForm.patchValue({
      firstname: this.userDetails.firstname,
      lastname: this.userDetails.lastname,
    });
    this.name_edit = !this.name_edit;
    if (this.name_edit) {
      this.nameForm.get('firstname')?.enable();
      this.nameForm.get('lastname')?.enable();
    } else {
      this.nameForm.get('firstname')?.disable();
      this.nameForm.get('lastname')?.disable();
    }
  }

  close_email() {
    this.emailForm.patchValue({
      email: this.userDetails.email,
    });
    this.emailEdit = !this.emailEdit;

    if (this.emailEdit) {
      this.emailForm.get('email')?.enable();
    } else {
      this.emailForm.get('email')?.disable();
    }
  }

  submitName() {
    console.log('edit profile submitted');
    if (this.nameForm.invalid) {
      console.log('Form is invalid');
      this.markFormGroupTouched(this.nameForm);
      return;
    } else {
      if (
        this.nameForm.value.firstname === this.userDetails.firstname &&
        this.nameForm.value.lastname === this.userDetails.lastname
      ) {
        this.closeName();
        return;
      }
      const data: userDetails = {
        _id: this.userId || undefined,
        firstname: this.nameForm.get('firstname')?.value || undefined,
        lastname: this.nameForm.get('lastname')?.value || undefined,
      };
      this.userService.editUserName(data).subscribe({
        next: (response) => {
          this.messageService.showSuccessToastr(response.message);
          this.userDetails.firstname = data.firstname;
          this.userDetails.lastname = data.lastname;
          this.closeName();
        },
        error: (error) => {
          console.log('Error response:', error);
          this.messageService.showErrorToastr(error.error.message);
          this.closeName();
        },
      });
    }
  }

  submitEmail() {
    console.log('edit profile submitted');
    if (this.emailForm.invalid) {
      console.log('Form is invalid');
      this.markFormGroupTouched(this.emailForm);
      return;
    } else {
      if (this.emailForm.value.email === this.userDetails.email) {
        this.close_email();
        return;
      }
      const data: userDetails = {
        _id: this.userId || undefined,
        email: this.emailForm.get('email')?.value || undefined,
      };
      this.userService.editUserEmail(data).subscribe({
        next: (Response) => {
          this.messageService.showSuccessToastr(Response.message);
          if (data.email && this.userDetails.email) {
            localStorage.setItem('email', this.userDetails.email);
            localStorage.setItem('new_email', data.email);
            localStorage.setItem('role', 'user_new_email');
          }
          this.router.navigate(['otp']);
        },
        error: (error) => {
          this.messageService.showErrorToastr(error.error.message);
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
    if (this.userId)
      this.userService.userDetails(this.userId).subscribe({
        next: (Response) => {
          console.log('Response:', Response);

          this.userDetails = Response;
          this.url = Response.profilePicture;
          console.log(this.url);

          this.nameForm.patchValue({
            firstname: this.userDetails.firstname,
            lastname: this.userDetails.lastname,
          });
          this.emailForm.patchValue({
            email: this.userDetails.email,
          });
          this.originalNameForm = this.nameForm.getRawValue();
          this.originalEmailForm = this.emailForm.getRawValue();
        },
        error: (Error) => {
          this.messageService.showErrorToastr(Error.error);
        },
      });
  }

  // Function to compare form values with the original data
  areNameFormValuesUnchanged(): boolean {
    const currentFormData = this.nameForm.getRawValue();
    return (
      JSON.stringify(this.originalNameForm) === JSON.stringify(currentFormData)
    );
  }

  areEmailFormValuesUnchanged(): boolean {
    const currentFormData = this.emailForm.getRawValue();
    return (
      JSON.stringify(this.originalEmailForm) === JSON.stringify(currentFormData)
    );
  }
}
