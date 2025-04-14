import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { UserService } from '../../../core/services/user.service';
import { Router } from '@angular/router';
import { MessageToasterService } from '../../../core/services/message-toaster.service';
import { blogResponse } from '../../../core/models/models';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-personal-blog',
  imports: [HeaderComponent, FooterComponent, CommonModule, FormsModule],
  templateUrl: './personal-blog.component.html',
  styleUrl: './personal-blog.component.css',
})
export class PersonalBlogComponent implements OnInit {
  constructor(
    private userService: UserService,
    private router: Router,
    private messageToaster: MessageToasterService
  ) {}

  blogs!: blogResponse[];
  userId!: string | null;

  ngOnInit(): void {
    this.userId = localStorage.getItem('accessedUser');
    this.personalBlogs(this.userId);
  }

  getTruncatedContent(content: string): string {
    const words = content.split(' ');
    if (words.length > 15) {
      return words.slice(0, 15).join(' ');
    }
    return content;
  }

  displayBlog(blogId: any) {
    this.router.navigate(['display_blog', blogId]);
  }
  addBlogs() {
    this.router.navigate(['create_blog']);
  }

  personalBlogs(userId: string | null) {
    if (!userId) {
      userId = localStorage.getItem('accessedUser');
    }
    if (userId) {
      this.userService.personalBlogs(userId).subscribe({
        next: (Response) => {
          this.blogs = Response;
        },
      });
    } else {
      this.messageToaster.showErrorToastr('User not found');
    }
  }
}
