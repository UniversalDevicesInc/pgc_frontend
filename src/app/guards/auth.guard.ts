import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs'
// import { map, tap } from 'rxjs/operators'
// import { AuthService } from '../services/auth.service'
import Auth from '@aws-amplify/auth'


@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
//    private authService: AuthService
  ) {}

  /*canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return true;
  } */

  /*
  canActivate() {
    if (this.authService.loggedIn) {
      return true
    } else {
      this.router.navigate(['/login'])
      return false
    }
  } */

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
      return Auth.currentAuthenticatedUser().then(() => { return true })
        .catch(() => {
          this.router.navigate(['login'])
          return false
        })
      }
}
