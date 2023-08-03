import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    private routes: ActivatedRoute
  ) {

  };

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // return true;
    var userInfo = JSON.parse(localStorage.getItem('user_data'));

    var token = localStorage.getItem('token')
    if (!userInfo) {
      this.router.navigate(['/login']);
    }
    if (!token) {
      this.router.navigate(['/login']);
    }

    if (userInfo['role_id'] == 1 || userInfo['role_id'] == 2) {

      if (state.url.search('globalsetting') !== -1) {
        if (userInfo['role_id'] == 2) {
          this.accessDenied()
        }
      }

      if (userInfo['role_id'] == 1) {
        return true;
      } else if (userInfo['role_id'] == 2) {
        console.log(userInfo.access)
        if (state.url.search('category') !== -1) {
          const data = userInfo.access.find(element => Number(element) == 2);
          if (data) {
            return true;
          } else {
            this.accessDenied()
          }
        } else if (state.url.search('service-provider') !== -1 || state.url.search('customer') !== -1) {
          const data = userInfo.access.find(element => Number(element) == 1);
          if (data) {
            return true;
          } else {
            this.accessDenied()
          }
        }
        else if (state.url.search('booking') !== -1) {
          const data = userInfo.access.find(element => Number(element) == 3);
          if (data) {
            return true;
          } else {
            this.accessDenied()
          }
        }
        else if (state.url.search('chat') !== -1) {
          const data = userInfo.access.find(element => Number(element) == 4);
          if (data) {
            return true;
          } else {
            this.accessDenied()
          }
        }
        else if (state.url.search('wallet') !== -1) {
          const data = userInfo.access.find(element => Number(element) == 6);
          if (data) {
            return true;
          } else {
            this.accessDenied()
          }
        }
        else if (state.url.search('promocode') !== -1) {
          const data = userInfo.access.find(element => Number(element) == 8);
          if (data) {
            return true;
          } else {
            this.accessDenied()
          }
        }

        else if (state.url.search('language') !== -1 || state.url.search('city') !== -1 || state.url.search('qualification') !== -1 || state.url.search('faq') !== -1 || state.url.search('cms') !== -1 || state.url.search('guide') !== -1 || state.url.search('training') !== -1 || state.url.search('slider') !== -1) {
          const data = userInfo.access.find(element => Number(element) == 7);
          if (data) {
            return true;
          } else {
            this.accessDenied()
          }
        }
        else {
          return true;
        }
      }
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }

  accessDenied() {
    this.router.navigate(['/access-denied']);
    return false;
  }
}
