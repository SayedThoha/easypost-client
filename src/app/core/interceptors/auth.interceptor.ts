import { HttpHandlerFn, HttpInterceptorFn } from '@angular/common/http';

import { inject, Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  //   return next(req);
  // };
  const router = inject(Router);
  const userService = inject(UserService);

  if (req.url.includes('cloudinary.com')) {
    return next(req);
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

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Check if the error status is 401 (Unauthorized) and try to refresh the token
      if (error.status === 401) {
        return handle401Error(req, next, userService, router);
      }
      // return throwError(error);
      return throwError(() => error);
    })
  );

  function handle401Error(
    req: HttpRequest<any>,
    next: HttpHandlerFn,
    userService: UserService,
    router: Router
  ) {
    const refreshToken = localStorage.getItem('refreshToken');

    // Use refresh token to get a new access token
    return userService.refreshToken({ refreshToken }).pipe(
      switchMap((Response: any) => {
        localStorage.setItem('accessToken', Response.accessToken); // Save new access token

        // Retry the original request with the new access token
        req = req.clone({
          setHeaders: {
            Authorization: `Bearer ${Response.accessToken}`,
          },
        });
        return next(req);
      }),
      catchError((error) => {
        // If refreshing the token fails, redirect to login
        router.navigate(['/login']);
        // return throwError(error);
        return throwError(() => error);
      })
    );
  }
};
