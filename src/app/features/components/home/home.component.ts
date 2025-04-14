import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { blogResponse } from '../../../core/models/models';
import { FooterComponent } from '../../../shared/components/footer/footer.component';

@Component({
  selector: 'app-home',
  imports: [HeaderComponent, CommonModule, FooterComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  constructor(private router: Router, private userService: UserService) {}

  blogs!: blogResponse[];
  ngOnInit(): void {
    this.userService.allBlogs().subscribe({
      next: (Response) => {
        this.blogs = Response.slice(0, 6);
      },
    });
  }

  addBlogs() {
    const currentRoute = this.router.url;

    if (currentRoute !== '/create_blog') {
      this.router.navigate(['create_blog']).catch((error) => {
        console.error('Navigation error:', error);
      });
    } else {
      console.log('Already on create_blog page, no navigation needed.');
    }
  }

  moreBlogs() {
    this.router.navigate(['all_blog']);
  }

  displayBlog(blogId: string) {
    this.router.navigate(['display_blog', blogId]);
  }

  getTruncatedContent(content: string): string {
    const words = content.split(' ');
    if (words.length > 15) {
      return words.slice(0, 15).join(' ');
    }
    return content;
  }
}
