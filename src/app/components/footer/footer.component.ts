import { Component, OnInit, OnDestroy } from '@angular/core';

import { AuthService } from '../../services/auth.service'
import { LoggerService } from '../../services/logger.service'
import { MqttService } from '../../services/mqtt.service'
import { SettingsService } from '../../services/settings.service'
import { environment } from '../../../environments/environment'

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit, OnDestroy {

  username: string
  currentIsy
  version: string = environment.VERSION
  stage: string = environment.STAGE
  year = new Date().getFullYear()

  constructor(
    public authService: AuthService,
    private loggerService: LoggerService,
    public mqttService: MqttService,
    private settingsService: SettingsService
  ) { }

  ngOnInit() {
    this.authService.username.subscribe(username => this.username = username)
    this.settingsService.currentIsy.subscribe(currentIsy => {
      if (currentIsy !== null) {
        this.currentIsy = currentIsy
      }
    })
    this.authService.getUsername()
    if (this.authService.loggedIn()) { this.mqttService.start() }
  }

  ngOnDestroy() {
    this.authService.username.unsubscribe()
  }

}
