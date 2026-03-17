import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Se l'utente è loggato (ha il token), lo facciamo passare
  if (authService.isLoggedIn()) {
    return true;
  } else {
    // Altrimenti lo rimandiamo alla pagina di login
    router.navigate(['/login']);
    return false;
  }
};
