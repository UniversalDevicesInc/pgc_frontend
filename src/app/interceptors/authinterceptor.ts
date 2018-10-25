import { HttpInterceptor, HttpRequest, HttpHandler,  HttpResponse, HttpErrorResponse } from "@angular/common/http";
import { Observable, BehaviorSubject } from "rxjs";
import { catchError, tap, flatMap, finalize, filter, take, switchMap } from 'rxjs/operators'
import { EMPTY, throwError } from 'rxjs';
import { Injectable, Injector } from "@angular/core";

import { environment } from '../../environments/environment'

import { AuthService } from '../services/auth.service'
import { LoggerService } from '../services/logger.service';

@Injectable()
export class Authinterceptor implements HttpInterceptor {

  refreshingToken: boolean = false
  gotTokenObserver: BehaviorSubject<boolean> = new BehaviorSubject(false)

  NOAUTHLIST = [
    `${environment.PG_URI}/api/sys/authorize`
  ]

  constructor(
    private loggerService: LoggerService,
    private authService: AuthService,
    private injector: Injector
  ) {}

  doRefresh(started, req, next) {
    if (!this.refreshingToken) {
      this.refreshingToken = true
      return this.authService.getRefreshTokens()
      .pipe(
        flatMap((profile) => {
          req = this.addAuth(req)
          this.gotTokenObserver.next(true)
          return next.handle(req)
          .pipe(
            tap(event => {
              if (event instanceof HttpResponse) {
                const elapsed = Date.now() - started;
                this.loggerService.add(`Request for ${req.urlWithParams} took ${elapsed} ms.`);
              }
            }))
        }),
        catchError(error => {
          this.loggerService.add('Caught error in reauth. Logging out.')
          this.authService.logout()
          return throwError(error)
        }),
        finalize(() => {
          this.refreshingToken = false
          this.gotTokenObserver.next(false)
        })
      )
    } else {
      return this.gotTokenObserver
      .pipe(
        filter(gotToken => gotToken), // when gotToken === true
        take(1),
        switchMap(token => {
          return next.handle(this.addAuth(req))
        })
      )
    }
  }

  addAuth(req) {
    return req.clone({
        setHeaders: {
            Authorization: `Bearer ${this.authService.getId()}`
        }
    });
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<any> {
    const authService = this.injector.get(AuthService)
    const started = +Date.now()
    const id = authService.getId()
    // const expires = authService.getExpires()
    // const access_token = authService.getToken()
    if (id) {
      if (!this.NOAUTHLIST.includes(req.url)) {
        /*
        if (started >= expires - 1000 * 600) {
          this.loggerService.add('Auth token expired or expiring soon. Refreshing.')
          return this.doRefresh(started, req, next)
        } else {
          req = this.addAuth(req)
        }
        */
        req = this.addAuth(req)
      }
    }
    return next.handle(req)
    .pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          const elapsed = Date.now() - started;
          this.loggerService.add(`Request for ${req.urlWithParams} took ${elapsed} ms.`);
        }
      }),
      catchError(error => {
          if (error instanceof HttpErrorResponse) {
            if ((<HttpErrorResponse>error).status === 401) {
              if (this.refreshingToken) {
                this.loggerService.add('Got 401, attempt to refresh tokens already in progress. Queuing request')
              } else {
                this.loggerService.add('Got 401, attempting to refresh tokens')
              }
              return this.doRefresh(started, req, next)
            } else {
              // Any other error HTTP Error response
              this.authService.logout()
            }
          }
          return EMPTY
        })
    )

  }
}
