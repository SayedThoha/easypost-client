import { Routes } from '@angular/router';
import { HomeComponent } from './features/components/home/home.component';
import { UserLoginComponent } from './features/components/user-login/user-login.component';
import { ForgotPasswordComponent } from './features/components/forgot-password/forgot-password.component';
import { NewPasswordComponent } from './features/components/new-password/new-password.component';
import { UserRegisterComponent } from './features/components/user-register/user-register.component';
import { OtpComponent } from './features/components/otp/otp.component';
import { AllBlogsComponent } from './features/components/all-blogs/all-blogs.component';
import { DisplayBlogComponent } from './features/components/display-blog/display-blog.component';
import { PersonalBlogComponent } from './features/components/personal-blog/personal-blog.component';
import { authGuard } from './core/guards/auth.guard';
import { CreateBlogComponent } from './features/components/create-blog/create-blog.component';
import { EditBlogComponent } from './features/components/edit-blog/edit-blog.component';
import { ProfileComponent } from './features/components/profile/profile.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: UserLoginComponent },
  { path: 'email_verification', component: ForgotPasswordComponent },
  { path: 'new_password', component: NewPasswordComponent },
  { path: 'register', component: UserRegisterComponent },
  { path: 'otp', component: OtpComponent },
  { path: 'all_blog', component: AllBlogsComponent },
  { path: 'display_blog/:_id', component: DisplayBlogComponent },
  {
    path: 'personal_blog',
    component: PersonalBlogComponent,
    canActivate: [authGuard],
  },
  {
    path: 'create_blog',
    component: CreateBlogComponent,
    canActivate: [authGuard],
  },
  {
    path: 'edit_blog/:id',
    component: EditBlogComponent,
    canActivate: [authGuard],
  },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'home', pathMatch: 'full' },
];
