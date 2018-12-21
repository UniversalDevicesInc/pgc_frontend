import { Component, OnInit, OnDestroy } from '@angular/core'
import { Router } from '@angular/router'

import { AuthService } from '../../services/auth.service'
import { MqttService } from '../../services/mqtt.service'
import { SettingsService } from '../../services/settings.service'

import { environment } from '../../../environments/environment'

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {

  isCollapsed = true
  username: string
  environment: any
  isys = []
  dashboard = 'Dashboard'

  constructor(
    private router: Router,
    public authService: AuthService,
    private settingsService: SettingsService,
    private mqttService: MqttService
  ) { this.environment = environment }

  ngOnInit() {
    this.mqttService.getIsys.subscribe(isys => {
      if (isys !== null) {
        this.isys = []
        this.settingsService.isys = isys
        const props = Object.keys(isys)
        for (const prop of props) {
          this.isys.push(isys[prop])
        }
        const currentIsy = localStorage.getItem('currentIsy')
        if (!currentIsy) {
          const profile = JSON.parse(localStorage.getItem('profile'))
          if (profile.preferredIsy === 'none') {
            console.log(`No preferred ISY Found. Using first in list.`)
            if (props.length > 0) {
              localStorage.setItem('currentIsy', props[0])
              if (isys.hasOwnProperty(props[0])) {
                this.settingsService.currentIsy.next(isys[props[0]])
              }
            }
          } else if (props.includes(profile.preferredIsy)) {
            localStorage.setItem('currentIsy', profile.preferredIsy)
            if (isys.hasOwnProperty(profile.preferredIsy)) {
              this.settingsService.currentIsy.next(isys[profile.preferredIsy])
            }
          }
        } else {
          if (isys.hasOwnProperty(currentIsy)) {
            this.settingsService.currentIsy.next(isys[currentIsy])
          }
        }
        this.dashboard = currentIsy ? `${isys[currentIsy].alias} Dashboard` : 'Dashboard'
      }
    })
  }

  updateCurrentIsy(isy) {
    if (isy && isy.hasOwnProperty('id')) {
      if ((this.settingsService.currentIsy.value)['alias'] === isy.alias) { return }
      localStorage.setItem('currentIsy', isy.id)
      this.settingsService.currentIsy.next(this.settingsService.isys[isy.id])
      this.dashboard = this.settingsService.currentIsy ? `${isy.alias} Dashboard` : 'Dashboard'
    }
  }

  refreshIsys() {
    this.mqttService.request('getIsys', '')
  }

  ngOnDestroy() {
    this.mqttService.getIsys.unsubscribe()
  }

}
