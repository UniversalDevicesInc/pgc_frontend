import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { BehaviorSubject, of, Observable } from 'rxjs'

import { ToastrService } from 'ngx-toastr'
import { NgxSpinnerService } from 'ngx-spinner'

import { MqttService } from '../../services/mqtt.service'
import { LoggerService } from '../../services/logger.service'

@Component({
  selector: 'app-nsoauth',
  templateUrl: './nsoauth.component.html',
  styleUrls: ['./nsoauth.component.css']
})
export class NsoauthComponent implements OnInit {

  message = 'Waiting for oauth...'

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private mqttService: MqttService,
    private loggerService: LoggerService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.spinner.show()
    setTimeout(() => {
      this.activatedRoute.queryParams.subscribe(params => {
        if (params.hasOwnProperty('code') && params.hasOwnProperty('state')) {
          console.log(params)
          this.mqttService.oauthRequest(params.state, params)
          this.toastr.success('Oauth Code received. Sending to nodeserver.')
        } else {
          this.loggerService.add('NSoauthComponent: Did not receive code or state in redirect.')
          setTimeout(() => {
            this.router.navigate(['/dashboard'])
          }, 1000)
        }
        this.spinner.hide()
        setTimeout(() => {
          this.router.navigate(['/dashboard'])
        }, 1000)
      })
    }, 2000)
  }
}
