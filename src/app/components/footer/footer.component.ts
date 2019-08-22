import { Component, OnInit, OnDestroy } from '@angular/core';

import { AuthService } from '../../services/auth.service'
import { LoggerService } from '../../services/logger.service'
import { MqttService } from '../../services/mqtt.service'
import { SettingsService } from '../../services/settings.service'

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit, OnDestroy {

  username: string
  currentIsy

  constructor(
    public authService: AuthService,
    private loggerService: LoggerService,
    public mqttService: MqttService,
    private settingsService: SettingsService
  ) { }

  ngOnInit() {
    this.authService.username.subscribe(username => this.username = username)
    this.authService.loggedIn.subscribe(loggedIn => {
      if (loggedIn && !this.mqttService.connected) {
        this.mqttService.start()
      }
    })
    this.settingsService.currentIsy.subscribe(currentIsy => {
      if (currentIsy !== null) {
        this.currentIsy = currentIsy
      }
    })
    this.authService.getUsername()
    //if (this.authService.loggedIn.value) { this.mqttService.start() }
  }

  ngOnDestroy() {
    this.authService.username.unsubscribe()
  }

}
