import { Injectable, NgZone } from '@angular/core'
import { Router } from '@angular/router'
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http'
import { Subject, BehaviorSubject, Observable ,  EMPTY, throwError } from 'rxjs'
import { fromPromise } from 'rxjs/observable/fromPromise'
import { catchError, map, tap } from 'rxjs/operators'
import { of } from 'rxjs/observable/of'
import { environment } from '../../environments/environment'
import { LoggerService } from './logger.service'
import { MqttService } from './mqtt.service'
import { AmplifyService } from 'aws-amplify-angular'
import { Auth, Hub } from 'aws-amplify'
import { CognitoUser, CognitoUserAttribute } from 'amazon-cognito-identity-js'
import { SettingsService } from './settings.service'

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json'
  })
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public loggedIn: BehaviorSubject<boolean> = new BehaviorSubject(false)
  private _auth: any
  public user: any
  public username: BehaviorSubject<string> = new BehaviorSubject(null)

  constructor(
    private router: Router,
    private ngZone: NgZone,
    private settingService: SettingsService,
    // private http: HttpClient,
    // private loggerService: LoggerService,
    private mqttService: MqttService,
    // private amplifyService: AmplifyService
  ) {
    //this.isAuthenticated().subscribe(_ => {})
    this.checkLoggedIn()
    const self = this
    Hub.listen('auth', ({ payload: { event, data }}) => {
      console.log(event)
      if (event === 'signIn') {
        console.log('dostuff')
        this.ngZone.run(() => {
          this.checkLoggedIn()
        })
      }
    })
  }

  public async checkLoggedIn() {
    try {
      this._auth = await Auth.currentAuthenticatedUser()
      this.user = (await Auth.currentUserInfo()).attributes
      this.username.next(this.user.email)
      this.settingService.id = this.user['custom:id']
      console.log(this.user)
      this.loggedIn.next(true)
      this.router.navigate(['/dashboard'])
    } catch (err) {
      this.loggedIn.next(false)
      this.router.navigate(['/login'])
    }
    /*
      .then((user) => {
        console.log(user)
        return user
      })
      .then
      .pipe(
        map(result => {
          console.log(result)
          this.loggedIn.next(true)
          return true
        }),
        catchError(error => {
          this.loggedIn.next(false)
          return of(false)
        })
      ); */
  }

  /** Log a message with the LoggerService
  private log(message: string) {
    this.loggerService.add('AuthService: ' + message)
  } */

  login() {
    const url = environment.AUTH_URI
    window.location.assign(url)
  }

  async logout() {
    await Auth.signOut().then((res) => {
      this.loggedIn.next(false)
      //this.router.navigate(['/login'])
    }).catch(err => {
      console.log(err)
    })
  }

  getUsername() {
    return this.user ? this.user.email : null
  }

  /*
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

  getTokensCognito(code, id) {
    this.log(`Getting Cognito Tokens with Code ${code}`)
    const headers = new HttpHeaders()
    .set('Content-Type', 'application/x-www-form-urlencoded')
    const params = new URLSearchParams()
    params.set('code', code)
    params.set('grant_type', 'authorization_code')
    params.set('client_id', '3lm35h1q1kv8rqcif6p22fclut')
    params.set('redirect_uri', 'https://localhost:8080/api/oauth/cognito')
    return this.http.post(`https://pgc-test.auth.us-east-1.amazoncognito.com/oauth2/token`, params.toString(), { headers: headers })
      .pipe(
        tap((profile) => {
          if (profile.hasOwnProperty('id_token')) {
            let userData = JSON.parse(window.atob(profile['id_token'].split('.')[1]))
            console.log(userData)
            this.username.next(userData['email'])
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
      console.log(`${operation} failed: ${error.message}`)

      // Let the app keep running by returning an empty result.
      return throwError(error)
      // return of(result as T)
    }
  }

}
