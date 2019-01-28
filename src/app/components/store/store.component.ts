import { Component, OnInit, OnDestroy } from '@angular/core'
import { Router } from '@angular/router'

import { NgbModal } from '@ng-bootstrap/ng-bootstrap'

import { ToastrService } from 'ngx-toastr'
import { NgxSpinnerService } from 'ngx-spinner'

import { LoggerService } from '../../services/logger.service'
import { MqttService } from '../../services/mqtt.service'
import { SettingsService } from '../../services/settings.service'
import { ModalAddnodeserverComponent } from '../modal-addnodeserver/modal-addnodeserver.component'

import { environment } from '../../../environments/environment'

@Component({
  selector: 'app-store',
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.css']
})
export class StoreComponent implements OnInit, OnDestroy {

  public nsList
  public received = false
  public slots

  constructor(
    private mqttService: MqttService,
    private toastr: ToastrService,
    private loggerService: LoggerService,
    private settingsService: SettingsService,
    private router: Router,
    private modal: NgbModal,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit() {
    this.getStore()
    this.slots = this.settingsService.availableNodeServerSlots
  }

  ngOnDestroy() {
    // this.settingsService.currentIsy.unsubscribe()
  }

  getStore() {
    this.spinner.show()
    this.mqttService.getStore().subscribe(data => {
      this.nsList = data
      this.received = true
      this.toastr.success('Retrieved NodeServers from Store')
      this.spinner.hide()
    })
  }

  openModal(ns) {
    const modalRef = this.modal.open(ModalAddnodeserverComponent, { centered: true })
    modalRef.componentInstance.environment = environment
    modalRef.componentInstance.title = `Install NodeServer`
    modalRef.componentInstance.body = `
      <h6 class="text-white">NodeServer:</h6>
      <table class="table table-striped table-bordered table-hover" style="font-size: 12px;">
        <tbody>
          <tr>
            <th width="25%" style="vertical-align:middle"><b>Name</b></th>
              <td style="vertical-align:middle">${ns.name}</td>
          </tr>
          <tr>
            <th style="vertical-align:middle"><b>Language</b></th>
              <td style="vertical-align:middle">${ns.language}</td>
          </tr>
          <tr>
            <th style="vertical-align:middle"><b>Version</b></th>
              <td style="vertical-align:middle">${ns.version}</td>
          </tr>
        </tbody>
      </table>
      <h6 class="text-white">Target ISY:</h6>
      <table class="table table-striped table-bordered table-hover" style="font-size: 12px;">
        <tbody>
          <tr>
            <th width="25%" style="vertical-align:middle"><b>Alias</b></th>
              <td style="vertical-align:middle">${this.settingsService.currentIsy.value['alias']}</td>
          </tr>
          <tr>
            <th style="vertical-align:middle"><b>Model</b></th>
              <td style="vertical-align:middle">${this.settingsService.currentIsy.value['isyData']['model']}</td>
          </tr>
          <tr>
            <th style="vertical-align:middle"><b>UUID</b></th>
              <td style="vertical-align:middle">${this.settingsService.currentIsy.value['id']}</td>
          </tr>
          <tr>
            <th style="vertical-align:middle"><b>Firmware</b></th>
              <td style="vertical-align:middle">${this.settingsService.currentIsy.value['isyData']['firmware']}</td>
          </tr>
        </tbody>
      </table>
       Do you wish to install this NodeServer on to the target device? <br><br>
      <b>NOTE</b>: If you are trying to upgrade a NodeServer that is already installed,
      stop and re-start it from the dashboard. It will automatically load the newest version available.
    `
    modalRef.result.then((data) => {
      if (this.settingsService.currentIsy.value['isyData']['firmware'][0] !== '5') {
        return this.toastr.error(`You must have ISY Firmware version 5.x and above to install NodeServers.`)
      }
      if (data.profileNum) {
        this.addNodeServer(data.profileNum, data.devMode, ns)
        setTimeout(() => {
          this.router.navigate(['/dashboard'])
        }, 1000)
      }
    }).catch((error) => {})
  }

  addNodeServer(profileNum, devMode, ns) {
    this.mqttService.request('addNodeServer', { profileNum: profileNum, development: devMode, ns: ns, isy: this.settingsService.currentIsy.value })
  }


}
