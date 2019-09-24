import { Component, OnInit, OnDestroy, ViewEncapsulation, HostListener } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { DatePipe } from '@angular/common'

import { NgbModal } from '@ng-bootstrap/ng-bootstrap'
import { NgxSpinnerService } from 'ngx-spinner'
import { ToastrService } from 'ngx-toastr'

import { MqttService } from '../../services/mqtt.service'
import { SettingsService } from '../../services/settings.service'
import { ModalConfirmComponent } from '../modal-confirm/modal-confirm.component'
import { ModalLogComponent } from '../modal-log/modal-log.component'

import { environment } from '../../../environments/environment'

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class DetailsComponent implements OnInit, OnDestroy {
  public profileNum
  public nodeServer
  public numNodes
  public uptimeInterval
  public uptime
  public currentlyEnabled: any
  public objectKeys = Object.keys
  public objectValues = Object.values
  public objectEntries = Object.entries
  public customParams = {}
  public newKey
  public newValue
  public dirtyCustom = []
  public STAGE = environment.STAGE
  public devMode = false

  constructor(
    private settingsService: SettingsService,
    private mqttService: MqttService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private modal: NgbModal,
    private router: Router
  ) {
    this.route.params.subscribe((params) => {
      if (params && params.hasOwnProperty('id')) {
        this.profileNum = params['id']
      }
    })
  }

  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    console.log("Processing beforeunload...")
    this.mqttService.logRequest(this.nodeServer.worker, 'stopLogStream')
    // Do more processing...
    // event.returnValue = false // popup are you sure?
  }

  ngOnInit() {
    this.spinner.show()
    this.settingsService.currentNodeServers.subscribe(currentNodeServers => {
      if (currentNodeServers !== null) {
        if (currentNodeServers.hasOwnProperty(this.profileNum)) {
          this.nodeServer = currentNodeServers[this.profileNum]
          try {
            this.numNodes = Object.keys(this.nodeServer.nodes).length
            this.devMode = this.nodeServer.development || false
          } catch (err) {
            this.numNodes = 0
          }
          this.spinner.hide()
          this.checkCustomUpdate()
          if (!this.uptimeInterval && this.nodeServer.timeStarted) {
            this.uptimeInterval = setInterval(() => {
              this.calculateUptime()
            }, 1000)
          }
        }
      }
    })
  }

  ngOnDestroy() {
    if (this.uptimeInterval) { clearInterval(this.uptimeInterval) }
    this.mqttService.logRequest(this.nodeServer.worker, 'stopLogStream')
  }

  showControl(type) {
    if (this.currentlyEnabled === type) { return this.currentlyEnabled = null }
    this.currentlyEnabled = type
    this.dirtyCustom = []
  }

  showLog() {
    this.mqttService.logRequest(this.nodeServer.worker, 'startLogStream')
    const modalRef = this.modal.open(ModalLogComponent, { size: 'lg', centered: true, windowClass: 'huge' })
    modalRef.componentInstance.title = `${this.nodeServer.name} Log (Last 5000 lines)`
    modalRef.componentInstance.body = ``
    modalRef.componentInstance.log = `nsLogs`
    modalRef.componentInstance.name = this.nodeServer.worker
    modalRef.result.then((result) => {
      this.mqttService.logRequest(this.nodeServer.worker, 'stopLogStream')
    }).catch((error) => {
      this.mqttService.logRequest(this.nodeServer.worker, 'stopLogStream')
    })
  }

  deleteNode(node) {
    const modalRef = this.modal.open(ModalConfirmComponent, { centered: true, container: 'nb-layout' })
    modalRef.componentInstance.title = `Remove Node`
    modalRef.componentInstance.body = `Are you sure you want to remove ${node.name} (${node.address})?`
    modalRef.result.then((result) => {
      if (result) {
        this.mqttService.request('removenode', { address: node.address,
          profileNum: this.profileNum, isy: this.settingsService.currentIsy.value })
      }
    }).catch((error) => {})
  }

  savePolls(shortPoll, longPoll) {
    if (Number(shortPoll) === this.nodeServer.shortPoll && Number(longPoll) === this.nodeServer.longPoll) {
      return this.toastr.error(`Nothing changed.`)
    }
    if (Number(shortPoll) < Number(longPoll)) {
      const updatedPolls = {
        shortPoll: Number(shortPoll),
        longPoll: Number(longPoll)
      }
      updatedPolls['profileNum'] = this.profileNum
      updatedPolls['isy'] = this.settingsService.currentIsy.value
      this.mqttService.request('polls', updatedPolls)
      this.toastr.success(`Sent updated polls to NodeServer`)
    } else {
      this.toastr.error(`shortPoll must be smaller than longPoll`)
    }
  }

  checkCustomUpdate() {
    if (!this.nodeServer.customParams) { return }
    for (const [key, value] of Object.entries(this.nodeServer.customParams)) {
      if (!this.dirtyCustom.includes(key)) {
        this.customParams[key] = value
      }
    }
  }

  onChangeCustom(key: string, value: any) {
    this.dirtyCustom.push(key)
    this.customParams[key] = value
    console.log(this.customParams)
  }

  addCustom() {
    const params = JSON.parse(JSON.stringify(this.customParams))
    params[this.newKey] = this.newValue
    this.sendCustom(params)
    this.newKey = null
    this.newValue = null
  }

  removeCustom(key: string) {
    const params = JSON.parse(JSON.stringify(this.customParams))
    delete params[key]
    this.sendCustom(params)
  }

  saveCustom() {
    if (!(this.dirtyCustom.length > 0)) {
      return this.toastr.error(`Nothing changed.`)
    }
    const params = JSON.parse(JSON.stringify(this.customParams))
    this.sendCustom(params)
    this.dirtyCustom = []
  }

  sendCustom(params) {
    params['profileNum'] = this.profileNum
    params['isy'] = this.settingsService.currentIsy.value
    this.mqttService.request('customparams', params)
    this.toastr.success(`Sent customParams to NodeServer`)
  }

  removeNotice(key: string) {
    const params = JSON.parse(JSON.stringify(this.nodeServer.notices))
    delete params[key]
    this.sendNotices(params)
  }

  sendNotices(params) {
    params['profileNum'] = this.profileNum
    params['isy'] = this.settingsService.currentIsy.value
    this.mqttService.request('notices', params)
  }

  calculateUptime() {
    // var seconds = Math.floor(()/1000)
    let d = Math.abs(+ new Date() - this.nodeServer.timeStarted) / 1000
    const r = {}
    const s = {
        'Year(s)': 31536000,
        'Month(s)': 2592000,
        'Week(s)': 604800,
        'Day(s)': 86400,
        'Hour(s)': 3600,
        'Minute(s)': 60,
        'Second(s)': 1
    }

    Object.keys(s).forEach(function(key) {
        r[key] = Math.floor(d / s[key])
        d -= r[key] * s[key]
    })
    let uptime = ''
    for (const key in r) {
      if (r[key] !== 0 ) {
        uptime += `${r[key]} ${key} `
      }
    }
    this.uptime = uptime
  }

  showDelete(ns) {
    const modalRef = this.modal.open(ModalConfirmComponent, { centered: true })
    modalRef.componentInstance.title = `Remove NodeServer`
    modalRef.componentInstance.body = `Are you sure you want to remove ${ns.name}?`
    modalRef.result.then((result) => {
      if (result) {
        this.mqttService.request('removeNodeServer', { profileNum: ns.profileNum, isy: this.settingsService.currentIsy.value })
        this.currentlyEnabled = false
        this.router.navigate(['/dashboard'])
      }
    }).catch((error) => {})
  }

  sendControl(command) {
    if (['startNodeServer', 'stopNodeServer', 'restartNodeServer'].includes(command)) {
      this.mqttService.request(command, {
        profileNum: this.profileNum,
        isy: this.settingsService.currentIsy.value,
        ns: this.nodeServer
      })
    }
  }
}
