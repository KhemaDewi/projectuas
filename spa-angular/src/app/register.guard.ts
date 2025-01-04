import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class RegisterGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const userRole = localStorage.getItem('userRole');

    if (userRole === 'admin') {
      // User has admin role, access allowed
      return true;
    } else {
      // Redirect to login page if not admin
      this.router.navigate(['/register']);
      return false;
    }
  }
}
