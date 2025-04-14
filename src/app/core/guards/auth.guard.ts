import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('accessToken');
  

  if (token) {
    console.log('true');

    return true; 
  } else {
    console.log('false');

    router.navigate(['/login']);
    return false; 
  }
};
