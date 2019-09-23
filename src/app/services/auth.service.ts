import { Injectable, NgZone } from '@angular/core'
import { Router } from '@angular/router'
import { BehaviorSubject, Observable ,  EMPTY, throwError } from 'rxjs'
import { MqttService } from './mqtt.service'
import { Auth, Hub } from 'aws-amplify'
import { SettingsService } from './settings.service'

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
    private mqttService: MqttService,
  ) {
    this.checkLoggedIn()
    const self = this
    Hub.listen('auth', ({ payload: { event, data }}) => {
      if (event === 'signIn') {
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
      this.loggedIn.next(true)
      this.router.navigate(['/dashboard'])
    } catch (err) {
      this.loggedIn.next(false)
      this.router.navigate(['/login'])
    }
  }

  async login() {
    try {
      await Auth.federatedSignIn()
    } catch (err) {
      console.log(err)
      await Auth.signOut()
    }

  }

  async logout() {
    await Auth.signOut().then((res) => {
      this.loggedIn.next(false)
    }).catch(err => {
      console.log(err)
    })
  }

  getUsername() {
    return this.user ? this.user.email : null
  }
}
