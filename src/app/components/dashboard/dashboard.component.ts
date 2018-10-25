import { Component, OnInit, OnDestroy } from '@angular/core'
import { Router } from '@angular/router'

import { NgbModal } from '@ng-bootstrap/ng-bootstrap'

import { ToastrService } from 'ngx-toastr'
import { NgxSpinnerService } from 'ngx-spinner'

import { AuthService } from '../../services/auth.service'
import { LoggerService } from '../../services/logger.service'
import { MqttService } from '../../services/mqtt.service'
import { SettingsService } from '../../services/settings.service'
import { ModalConfirmComponent } from '../modal-confirm/modal-confirm.component'

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {

  currentIsy
  // nodeServers = []
  nodeServers = {}
  public objectValues = Object.values
  public objectKeys = Object.keys

  constructor(
    private authService: AuthService,
    private mqttService: MqttService,
    private loggerService: LoggerService,
    private settingsService: SettingsService,
    private toastr: ToastrService,
    private modal: NgbModal,
    private spinner: NgxSpinnerService,
    private router: Router
  ) { }

  ngOnInit() {
    this.spinner.show()
    this.settingsService.currentIsy.subscribe(currentIsy => {
      if (currentIsy !== null) {
        this.currentIsy = currentIsy
      }
    })
    this.settingsService.currentNodeServers.subscribe(currentNodeServers => {
      if (currentNodeServers !== null) {
        this.nodeServers = currentNodeServers
        /*
        const props = Object.keys(currentNodeServers)
        for (const prop of props) {
          this.nodeServers.push(currentNodeServers[prop])
        }
        this.nodeServers.sort((a, b) => {
          return parseInt(a.profileNum, 10) - parseInt(b.profileNum, 10)
        }) */
        this.spinner.hide()
      }
    })
  }

  showConfirm(ns) {
    const modalRef = this.modal.open(ModalConfirmComponent, { centered: true })
    modalRef.componentInstance.title = `Remove NodeServer`
    modalRef.componentInstance.body = `Are you sure you want to remove ${ns.name}?`
    modalRef.result.then((result) => {
      if (result) {
        this.mqttService.request('removeNodeServer', { profileNum: ns.profileNum, isy: this.settingsService.currentIsy.value })
      }
    }).catch((error) => {})
  }

  details(ns) {
    this.router.navigate(['/details', ns])
  }

  ngOnDestroy() {
  }
}
