import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('accessToken'); // Retrieve the access token from local storage
  console.log('guard token:',token);
  
  if (token) {
    console.log('true');
    
    return true; // User is authenticated, allow access
  } else {
    console.log('false');
    
    router.navigate(['/login']); // Redirect to login page if not authenticated
    return false; // Deny access
  }

};
