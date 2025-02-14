import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { LoginService } from '../../services/auth/login.service';


export const authGuard: CanActivateFn = (route, state) => {
  const singIn = inject(LoginService);
  const router = inject(Router);
  if (!singIn.isLogged()) {
    router.navigate(['/login']);
    return false;
  }
  return true;

};
