import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, of, Observable } from 'rxjs'
import { catchError, map, tap } from 'rxjs/operators'
import { EMPTY, throwError } from 'rxjs';

import { environment } from '../../environments/environment'
import { LoggerService } from './logger.service';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public authSubject: BehaviorSubject<boolean> = new BehaviorSubject(false)
  public username: BehaviorSubject<string> = new BehaviorSubject("")

  constructor(
    private router: Router,
    private http: HttpClient,
    private loggerService: LoggerService
  ) { }

  /** Log a message with the MessageService */
  private log(message: string) {
    this.loggerService.add('AuthService: ' + message);
  }

  login() {
    return this.http.get(`${environment.PG_URI}/api/sys/getauthurl`)
    .pipe(catchError(this.handleError('getAuthData', [])))
    .subscribe(data => {
      this.log(`${JSON.stringify(data)}`)
      if (data.hasOwnProperty('auth_uri')) {
        //window.location.href = `https://dev.isy.io${data['auth_uri']}?response_type=${data['type']}&client_id=isyportal-oa2-bdnQJABx4HqeI6W&redirect_uri=${data['redirect_uri']}&state=${data['state']}`
        window.location.href = `${data['base_uri']}${data['auth_uri']}?response_type=${data['type']}&client_id=${data['client_id']}&redirect_uri=${data['redirect_uri']}&state=${data['state']}`
      }
    })
  }

  logout() {
    localStorage.clear()
    this.authSubject.next(false)
    this.router.navigate(['/login'])
  }

  getTokens(code) {
    this.log(`Getting Tokens with Code ${code}`)
    let headers = new HttpHeaders()
    .set('Content-Type', 'application/json')
    let params = {
      code: code,
      grant_type: 'authorization_code'
    }
    return this.http.post(`${environment.PG_URI}/api/sys/authorize`, params, { headers: headers })
      .pipe(
        tap((profile) => {
          if (profile.hasOwnProperty('access_token')) {
            this.username.next(profile['username'])
            this.log(`Received token data. Auth_Token: ${profile['access_token']}`)
            localStorage.setItem('profile', JSON.stringify(profile))
            this.authSubject.next(true)
          } else {
            this.log(`Did not receive access token from UDI Portal Service.`)
          }
        }),
        catchError(this.handleError('getTokenData', []))
      )
  }

  getRefresh() {
    this.getRefreshTokens()
      .subscribe(profile => {
        if (profile.hasOwnProperty('access_token'))
          return of(profile['access_token'])
      })
  }

  getRefreshTokens() {
    let userData = JSON.parse(localStorage.getItem('profile')) || {}
    if (!userData.hasOwnProperty('id')) {
      this.log('Cannot refresh token for unknown user.')
      return EMPTY
    }
    this.log(`Getting Refreshed Auth Token for ${userData.username}`)
    let headers = new HttpHeaders()
    .set('Content-Type', 'application/json')
    let params = {
      id: userData.id,
      grant_type: 'refresh_token'
    }
    return this.http.post(`${environment.PG_URI}/api/sys/authorize`, params, { headers: headers })
    .pipe(
      tap(profile => {
        if (profile.hasOwnProperty('access_token')) {
          this.log(`Received token data. Auth_Token: ${profile['access_token']}`)
          localStorage.setItem('profile', JSON.stringify(profile))
          this.authSubject.next(true)
        } else {
          this.log(`Did not receive access token from UDI Portal Service.`)
        }
      }),
      catchError(this.handleError('getRefreshTokens', [])))
  }

  getUrl() {
    let token = this.getToken()
    if (!token) return
    this.log(`Getting Profile from Portal`)
    let headers = new HttpHeaders()
    .set('Content-Type', 'application/json')
    return this.http.get(`${environment.PG_URI}/api/sys/getioturl`, { headers: headers })
    .pipe(
      tap(data => {
        this.log(JSON.stringify(data, null, 2))
      }),
      catchError(this.handleError('getUrl', [])))
  }

  /* Oauth Flow direct to Portal(remove before prod)
  getTokensDirect(code) {
    this.log(`Getting Tokens directly from UDI (no backend) with Code ${code}`)
    let headers = new HttpHeaders()
    .set('Content-Type', 'application/x-www-form-urlencoded')
    let params = new HttpParams()
    .set('code', code)
    .set('redirect_uri', 'https://spark.3csolutions.net/api/oauth/portal')
    .set('grant_type', 'authorization_code')
    //.set('client_id', 'isyportal-oa2-bdnQJABx4HqeI6W')
    //.set('client_secret', 'SlDdUi0J9rOLjOU')
    .set('client_id', 'isyportal-o2-HMaHqSOZWjTT2De')
    .set('client_secret', 'uunvNh8wjbUjOJHYOthl1A0lAwwmf6HYwxRWDaBd')
    return this.http.post(`https://my.isy.io/o2/token`, params.toString() , { headers: headers })
    .pipe(catchError(this.handleError('getTokensDirect', [])))
    .subscribe(tokendata => {
      if (tokendata.hasOwnProperty('access_token')) {
        this.log(`Received token data. Auth_Token: ${tokendata['access_token']}`)
        localStorage.setItem('Auth_Token', tokendata['access_token'])
        this.authSubject.next(true)
        this.getIsys()
        this.router.navigate(['/dashboard'])
      } else {
        this.log(`Did not receive access token from UDI Portal Service.`)
      }
    })
  }

  getRefreshDirect() {
    let refreshToken = localStorage.getItem('Refresh_Token')
    this.log(`Getting Refresh Tokens directly from UDI (no backend) with Token ${refreshToken}`)
    let headers = new HttpHeaders()
    .set('Content-Type', 'application/x-www-form-urlencoded')
    let params = new HttpParams()
    //.set('code', code)
    .set('redirect_uri', 'https://spark.3csolutions.net/api/oauth/portal')
    .set('grant_type', 'refresh_token')
    //.set('client_id', 'isyportal-oa2-bdnQJABx4HqeI6W')
    //.set('client_secret', 'SlDdUi0J9rOLjOU')
    .set('client_id', 'isyportal-o2-HMaHqSOZWjTT2De')
    .set('client_secret', 'uunvNh8wjbUjOJHYOthl1A0lAwwmf6HYwxRWDaBd')
    .set('refresh_token', refreshToken)
    return this.http.post(`https://my.isy.io/o2/token`, params.toString() , { headers: headers })
    .pipe(catchError(this.handleError('getRefreshDirect', [])))
    .subscribe(tokendata => {
      this.log(JSON.stringify(tokendata))
      if (tokendata.hasOwnProperty('access_token')) {
        this.log(`Received token data. Auth_Token: ${tokendata['access_token']}`)
        localStorage.setItem('Auth_Token', tokendata['access_token'])
        localStorage.setItem('Refresh_Token', tokendata['refresh_token'])
        this.authSubject.next(true)
        this.getUserProfile()
        this.router.navigate(['/dashboard'])
      } else {
        this.log(`Did not receive access token from UDI Portal Service.`)
      }
    })
  }
  */

  getToken() {
    let profile = JSON.parse(localStorage.getItem('profile')) || {}
    if (profile.hasOwnProperty('access_token')) return profile.access_token
  }

  getExpires() {
    let profile = JSON.parse(localStorage.getItem('profile')) || {}
    if (profile.hasOwnProperty('auth_expires')) return profile.auth_expires
  }

  getUsername() {
    let profile = JSON.parse(localStorage.getItem('profile')) || {}
    if (profile.hasOwnProperty('username')) this.username.next(profile.username)
  }

  loggedIn() {
    if (this.authSubject.value) return true
    let profile = JSON.parse(localStorage.getItem('profile'))
    if (profile && profile.hasOwnProperty('access_token')) {
      return true
    } else {
      return false
    }
  }

  getUserProfile() {
    let token = this.getToken()
    if (!token) return
    this.log(`Getting Profile from Portal`)
    let headers = new HttpHeaders()
    .set('Content-Type', 'application/json')
    return this.http.get(`https://my.isy.io/api/profile`, { headers: headers })
    .pipe(catchError(this.handleError('getUserProfile', [])))
    .subscribe(data => {
      this.authSubject.next(true)
      this.log(JSON.stringify(data, null, 2))
    })
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return throwError(error)
      //return of(result as T);
    };
  }

}
