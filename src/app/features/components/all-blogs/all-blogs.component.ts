import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { FormsModule } from '@angular/forms';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../core/services/user.service';
import { Router } from '@angular/router';
import { MessageToasterService } from '../../../core/services/message-toaster.service';
import { blogResponse } from '../../../core/models/models';

@Component({
  selector: 'app-all-blogs',
  imports: [HeaderComponent, FormsModule, FooterComponent, CommonModule],
  templateUrl: './all-blogs.component.html',
  styleUrl: './all-blogs.component.css',
})
export class AllBlogsComponent implements OnInit {
  constructor(
    private userService: UserService,
    private router: Router,
    private messageService: MessageToasterService
  ) {}

  blogs!: blogResponse[];

  addBlogs() {
    this.router.navigate(['/create_blogs']);
  }

  ngOnInit(): void {
    this.userService.allBlogs().subscribe({
      next: (Response) => {
        this.blogs = Response;
      },
    });
  }

  displayBlog(blogId: string) {
    this.router.navigate(['/display_blog', blogId]);
  }

  getTruncatedContent(content: string): string {
    const words = content.split(' ');
    if (words.length > 15) {
      return words.slice(0, 15).join(' ');
    }
    return content;
  }
}
