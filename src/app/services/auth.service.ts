import { Injectable } from '@angular/core'
import { Router } from '@angular/router'
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http'
import { BehaviorSubject, Observable ,  EMPTY, throwError } from 'rxjs'
import { catchError, map, tap } from 'rxjs/operators'

import { environment } from '../../environments/environment'
import { LoggerService } from './logger.service'
import { MqttService } from './mqtt.service'

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json'
  })
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public username: BehaviorSubject<string> = new BehaviorSubject(null)

  constructor(
    private router: Router,
    private http: HttpClient,
    private loggerService: LoggerService,
    private mqttService: MqttService
  ) { }

  /** Log a message with the LoggerService */
  private log(message: string) {
    this.loggerService.add('AuthService: ' + message)
  }

  login() {
    return this.http.get(`${environment.PG_URI}/api/sys/getauthurl`)
      .pipe(
        tap(data => {
          this.log(`${JSON.stringify(data)}`)
          if (data.hasOwnProperty('auth_uri')) {
            // window.location.href = `https://dev.isy.io${data['auth_uri']}?response_type=${data['type']}&` +
            // `client_id=isyportal-oa2-bdnQJABx4HqeI6W&redirect_uri=${data['redirect_uri']}&state=${data['state']}`
            if (environment.ENV === 'dev') {
              window.location.href = `${data['base_uri']}${data['auth_uri']}?response_type=${data['type']}&` +
              `client_id=${data['client_id']}&redirect_uri=${environment.PG_REDIRECT}&state=${data['state']}`
              } else {
              window.location.href = `${data['base_uri']}${data['auth_uri']}?response_type=${data['type']}&` +
              `client_id=${data['client_id']}&redirect_uri=${data['redirect_uri']}&state=${data['state']}`
            }
          }
        }),
        catchError(this.handleError('getAuthData', []))
      )
      .subscribe(_ => {})
  }

  logout() {
    localStorage.clear()
    this.router.navigate(['/login'])
  }

  getTokens(code, id) {
    this.log(`Getting Tokens with Code ${code}`)
    const headers = new HttpHeaders()
    .set('Content-Type', 'application/json')
    const params = {
      code: code,
      grant_type: 'authorization_code'
    }
    if (id) { params['id'] = id }
    return this.http.post(`${environment.PG_URI}/api/sys/authorize`, params, { headers: headers })
      .pipe(
        tap((profile) => {
          if (profile.hasOwnProperty('id')) {
            this.username.next(profile['username'])
            this.log(`Received token data. Auth_Token: ${profile['id']}`)
            localStorage.setItem('profile', JSON.stringify(profile))
            this.mqttService.start()
          } else {
            this.log(`Did not receive access token from UDI Portal Service.`)
          }
        }),
        catchError(this.handleError('getTokenData', []))
      )
  }

  getRefreshTokens() {
    const userData = JSON.parse(localStorage.getItem('profile')) || {}
    if (!userData.hasOwnProperty('id')) {
      this.log('Cannot refresh token for unknown user.')
      return EMPTY
    }
    this.log(`Getting Refreshed Auth Token for ${userData.username}`)
    const headers = new HttpHeaders()
    .set('Content-Type', 'application/json')
    const params = {
      id: userData.id,
      grant_type: 'refresh_token'
    }
    return this.http.post(`${environment.PG_URI}/api/sys/authorize`, params, { headers: headers })
      .pipe(
        tap(profile => {
          if (profile.hasOwnProperty('id')) {
            this.log(`Received token data. Auth_Token: ${profile['id']}`)
            localStorage.setItem('profile', JSON.stringify(profile))
          } else {
            this.log(`Did not receive access token from UDI Portal Service.`)
          }
        }),
        catchError(this.handleError('getRefreshTokens', []))
      )
  }

  /*
  getUserProfile() {
    let token = this.getToken()
    if (!token) return this.logout()
    this.log(`Getting Profile from Portal`)
    let headers = new HttpHeaders()
    .set('Content-Type', 'application/json')
    return this.http.get(`https://my.isy.io/api/profile`, { headers: headers })
    .pipe(catchError(this.handleError('getUserProfile', [])))
    .subscribe(data => {
      this.log(JSON.stringify(data, null, 2))
    })
  }

  getToken() {
    const profile = JSON.parse(localStorage.getItem('profile')) || {}
    if (profile.hasOwnProperty('access_token')) { return profile.access_token }
  }

  getExpires() {
    const profile = JSON.parse(localStorage.getItem('profile')) || {}
    if (profile.hasOwnProperty('auth_expires')) { return profile.auth_expires }
  }
  */

  getUsername() {
    const profile = JSON.parse(localStorage.getItem('profile')) || {}
    if (profile.hasOwnProperty('username')) { this.username.next(profile.username) }
  }

  getId() {
    const profile = JSON.parse(localStorage.getItem('profile')) || {}
    if (profile.hasOwnProperty('id')) { return profile.id }
  }

  loggedIn() {
    return this.getId() ? true : false
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
      console.error(error) // log to console instead

      // TODO: better job of transforming error for user consumption
      this.log(`${operation} failed: ${error.message}`)

      // Let the app keep running by returning an empty result.
      return throwError(error)
      // return of(result as T)
    }
  }

}
