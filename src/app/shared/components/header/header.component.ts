import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
@Component({
  selector: 'app-header',
  imports: [CommonModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit {
  userToken!: string | null;
  menuOpen = false;
  profileStatus: boolean = false;
  constructor(private router: Router) {}

  ngOnInit(): void {
    this.userToken = localStorage.getItem('accessToken');
    if (this.userToken) {
      this.profileStatus = true;
    } else {
      this.profileStatus = false;
    }
  }
  toggleMenu() {
    this.menuOpen = !this.menuOpen; // Toggles the menu open/close state
  }

  login() {
    this.router.navigate(['/login']);
  }
  home() {
    this.router.navigate(['/home']);
  }
  personal_blog() {
    this.router.navigate(['/personal_blog']);
  }

  blog() {
    this.router.navigate(['/all_blog']);
  }

  add_blog() {
    this.router.navigate(['create_blog']);
  }

  profile() {
    this.router.navigate(['/profile']);
  }

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('accessedUser');
    this.profileStatus = false;
    this.router.navigate(['home']);
  }
}
