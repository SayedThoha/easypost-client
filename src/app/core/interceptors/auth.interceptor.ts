// import { HttpInterceptorFn } from '@angular/common/http';

// export const authInterceptor: HttpInterceptorFn = (req, next) => {
//   return next(req);
// };

import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';


@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(private userService: UserService, private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.url.includes('cloudinary.com')) {
      return next.handle(req);
    }
    // Add the access token to the request header
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Check if the error status is 401 (Unauthorized) and try to refresh the token
        if (error.status === 401) {
          return this.handle401Error(req, next);
        }
        // return throwError(error);
        return throwError(() => error);
      })
    );
  }

  private handle401Error(req: HttpRequest<any>, next: HttpHandler) {
    const refreshToken = localStorage.getItem('refreshToken');
    
    // Use refresh token to get a new access token
    return this.userService.refreshToken({ refreshToken }).pipe(
      switchMap((Response: any) => {
        localStorage.setItem('accessToken', Response.accessToken); // Save new access token

        // Retry the original request with the new access token
        req = req.clone({
          setHeaders: {
            Authorization: `Bearer ${Response.accessToken}`,
          },
        });
        return next.handle(req);
      }),
      catchError((error) => {
        // If refreshing the token fails, redirect to login
        this.router.navigate(['/login']);
        // return throwError(error);
        return throwError(() => error);
      })
    );
  }
}