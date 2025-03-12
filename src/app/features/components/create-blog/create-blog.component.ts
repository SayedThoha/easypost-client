import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { UserService } from '../../../core/services/user.service';
import { ImageUploadService } from '../../../core/services/image-upload.service';
import { Router } from '@angular/router';
import { MessageToasterService } from '../../../core/services/message-toaster.service';
import { blogData } from '../../../core/models/models';
import { namePattern } from '../../../shared/utils/regex';

@Component({
  selector: 'app-create-blog',
  imports: [
    HeaderComponent,
    CommonModule,
    FormsModule,
    FooterComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './create-blog.component.html',
  styleUrl: './create-blog.component.css',
})
export class CreateBlogComponent implements OnInit {
  blogForm!: FormGroup;
  topics: string[] = ['Technology', 'Travel', 'Food', 'Lifestyle', 'Other'];
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private uploadService: ImageUploadService,
    private router: Router,
    private messageToaster: MessageToasterService
  ) {}

  ngOnInit() {
    this.blogForm = this.fb.group({
      topic: ['', Validators.required],
      otherTopic: [''],
      title: ['', Validators.required, Validators.minLength(5)],
      content: ['', Validators.required],
      image: ['', Validators.required],
    });
  }

  onTopicChange() {
    const topicControl = this.blogForm.get('topic');
    const otherTopicControl = this.blogForm.get('otherTopic');

    if (topicControl?.value === 'Other') {
      otherTopicControl?.setValidators([
        Validators.required,
        Validators.pattern(namePattern),
      ]);
    } else {
      otherTopicControl?.clearValidators();
    }
    otherTopicControl?.updateValueAndValidity();
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    this.selectedFile = file || null;
    if (this.selectedFile) {
      this.blogForm.get('image')?.clearValidators();
      this.blogForm.get('image')?.updateValueAndValidity();

      this.previewImage();
    }
  }

  previewImage() {
    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  onSubmit() {
    if (this.blogForm.invalid) {
      this.markFormGroupTouched(this.blogForm);
      return;
    }

    if (this.selectedFile) {
      this.uploadService.uploadImage(this.selectedFile, 'EasyPost').subscribe({
        next: (response) => {
          const image = response;

          const blogData: blogData = {
            userId: localStorage.getItem('accessedUser'),
            topic: this.blogForm.get('topic')?.value,
            otherTopic: this.blogForm.get('otherTopic')?.value || '',
            title: this.blogForm.get('title')?.value,
            content: this.blogForm.get('content')?.value,
            image,
          };

          this.userService.createBlog(blogData).subscribe({
            next: (response) => {
              this.messageToaster.showSuccessToastr(response.message);
              this.router.navigate(['personal_blog']);
            },
            error: (error) => {
              console.error('Error creating blog:', error);
            },
          });
        },
        error: (error) => {
          console.error('Error uploading image:', error);
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
