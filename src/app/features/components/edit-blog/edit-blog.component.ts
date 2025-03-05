import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { blogData, blogResponse } from '../../../core/models/models';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { MessageToasterService } from '../../../core/services/message-toaster.service';
import { ImageUploadService } from '../../../core/services/image-upload.service';
import { namePattern } from '../../../shared/utils/regex';

@Component({
  selector: 'app-edit-blog',
  imports: [HeaderComponent, FooterComponent, CommonModule, FormsModule,ReactiveFormsModule],
  templateUrl: './edit-blog.component.html',
  styleUrl: './edit-blog.component.css',
})
export class EditBlogComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private messageService: MessageToasterService,
    private fb: FormBuilder,
    private uploadService: ImageUploadService
  ) {}

  blogId!: string;
  blogDetails!: blogResponse;
  originalFormData!: FormGroup;
  blogForm!: FormGroup;
  selectedFile: File | null = null;
  topics: string[] = ['Technology', 'Travel', 'Food', 'Lifestyle', 'Other'];
  imagePreview: string | ArrayBuffer | null = null;

  ngOnInit(): void {
    console.log('edit blog');
    this.route.params.subscribe((params) => {
      this.blogId = params['id']; 
      this.getBlogDetails(this.blogId); 
    });
    this.editBlogForm();
  }

  editBlogForm() {
    this.blogForm = this.fb.group({
      topic: ['', Validators.required],
      otherTopic: [''],
      title: ['', [Validators.required, Validators.minLength(5)]],
      content: ['', Validators.required],
      image: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.blogForm.invalid) {
      this.markFormGroupTouched(this.blogForm);
      return;
    }
    if (!this.selectedFile) {
      if (this.areFormValuesUnchanged()) {
        console.log('No changes made. Skipping backend call.');
        this.messageService.showWarningToastr(
          'No changes detected. The blog remains unchanged.'
        );
        this.router.navigate(['display_blog', this.blogId]);
        return;
      }
    }

    let blogData: blogData = {
      userId: localStorage.getItem('accessedUser'),
      _id: this.blogId,
      topic: this.blogForm.get('topic')?.value,
      otherTopic: this.blogForm.get('otherTopic')?.value || '',
      title: this.blogForm.get('title')?.value,
      content: this.blogForm.get('content')?.value,
      image: this.blogForm.get('image')?.value,
    };

    if (this.selectedFile) {
      this.uploadService.uploadImage(this.selectedFile, 'EasyPost').subscribe({
        next: (response) => {
          const image = response;
          console.log('Image uploaded successfully:', image);
          blogData.image = image;
          console.log('image from blogData:', blogData.image);
          this.submitEditBlog(blogData);
        },
        error: (error) => {
          console.error('Error uploading image:', error);
          this.messageService.showErrorToastr(error.error);
        },
      });
    } else {
      this.submitEditBlog(blogData);
    }
  }

  submitEditBlog(blogData: blogData) {
    this.userService.editBlog(blogData).subscribe({
      next: (response) => {
        console.log('Blog edited successfully:', response);
        this.messageService.showSuccessToastr(response.message);
        this.router.navigate(['display_blog', this.blogId]);
      },
      error: (error) => {
        console.error('Error creating blog:', error);
        this.messageService.showErrorToastr(error.error);
      },
    });
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
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
      // Clear the validation for the image field after a file is selected
      this.blogForm.get('image')?.clearValidators();
      this.blogForm.get('image')?.updateValueAndValidity();
      // Preview the image
      this.previewImage();
    }
  }

  previewImage() {
    if (this.selectedFile) {
      console.log(this.selectedFile);
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
        console.log(this.imagePreview);
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  getBlogDetails(blogId: string) {
    this.userService.SingleBlog(blogId).subscribe({
      next: (Response) => {
        this.blogDetails = Response;
        // Set the image preview if image exists
        if (this.blogDetails.image) {
          this.imagePreview = this.blogDetails.image;
        }
        console.log(Response.topic);

        if (!this.topics.includes(this.blogDetails.topic)) {
          this.blogForm.patchValue({
            topic: 'Other',
            otherTopic: Response.topic,
            title: this.blogDetails.title,
            content: this.blogDetails.content,
            image: this.blogDetails.image,
          });
        } else {
          this.blogForm.patchValue({
            topic: this.blogDetails.topic,
            title: this.blogDetails.title,
            content: this.blogDetails.content,
            image: this.blogDetails.image,
          });
        }
        // Store the original form data for comparison
        this.originalFormData = this.blogForm.getRawValue();
      },
      error: (error) => {
        this.messageService.showErrorToastr(error.error);
      },
    });
  }

  // Function to compare form values with the original data
  areFormValuesUnchanged(): boolean {
    const currentFormData = this.blogForm.getRawValue();
    console.log('raw value of form:', this.blogForm.getRawValue());
    console.log('original value:', this.originalFormData);

    return (
      JSON.stringify(this.originalFormData) === JSON.stringify(currentFormData)
    );
  }
}

