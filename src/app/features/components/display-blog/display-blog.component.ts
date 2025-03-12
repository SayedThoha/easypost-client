import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { CommonModule, ViewportScroller } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { MessageToasterService } from '../../../core/services/message-toaster.service';
import { blogResponse } from '../../../core/models/models';

@Component({
  selector: 'app-display-blog',
  imports: [HeaderComponent, FooterComponent, CommonModule, FormsModule],
  templateUrl: './display-blog.component.html',
  styleUrl: './display-blog.component.css',
})
export class DisplayBlogComponent implements OnInit {
  constructor(
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageToasterService,
    private viewportScroller: ViewportScroller
  ) {}

  blogId!: string;
  blogDetails!: blogResponse;
  userId!: string | null;
  edit: boolean = false;

  ngOnInit(): void {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.viewportScroller.scrollToPosition([0, 0]);
      }
    });
    this.userId = localStorage.getItem('accessedUser');
    this.route.params.subscribe((params) => {
      this.blogId = params['_id'];
      this.getBlogDetails(this.blogId);
    });
  }

  editBlog(blogId: string) {
    this.router.navigate(['edit_blog', blogId]);
  }

  deleteBlog(blogId: string) {
    this.userService.deleteBlog(blogId).subscribe({
      next: (Response) => {
        this.messageService.showSuccessToastr(Response.message);
        this.router.navigate(['personal_blog']);
      },
      error: (Error) => {
        this.messageService.showErrorToastr(Error.error);
      },
    });
  }

  formatContent(content: string): string {
    return content.replace(/\n/g, '<br>');
  }

  getBlogDetails(blogId: string) {
    this.userService.SingleBlog(blogId).subscribe({
      next: (Response) => {
        this.blogDetails = Response;
        if (this.blogDetails.userId._id === this.userId) {
          this.edit = true;
        }
      },
      error: (error) => {
        this.messageService.showErrorToastr(error.error);
      },
    });
  }
}
