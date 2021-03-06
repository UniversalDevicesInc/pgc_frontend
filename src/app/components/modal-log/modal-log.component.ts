import { ElementRef, ViewChild, Component, OnInit, OnDestroy, Input } from '@angular/core'
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap'
import { DatePipe } from '@angular/common'

import { MqttService } from '../../services/mqtt.service'
import { SettingsService } from '../../services/settings.service'

@Component({
  selector: 'app-modal-log',
  templateUrl: './modal-log.component.html',
  styleUrls: ['./modal-log.component.css']
})
export class ModalLogComponent implements OnInit, OnDestroy {
  @ViewChild('nslogScroll', { static: true }) private logScrollContainer: ElementRef
  @Input() title
  @Input() body
  @Input() log
  @Input() name

  public autoScroll = true
  public nsLog: string[] = []
  public logWait: string[] = []
  private processingWait = false
  public pipe = new DatePipe('en-US')
  public nsLogsSub

  constructor(
    public activeModal: NgbActiveModal,
    public settingsService: SettingsService,
    private mqttService: MqttService,
  ) { }

  ngOnInit() {
    this.nsLogsSub = this.mqttService[this.log].subscribe((log) => {
      if (log === null) { return }
      if (this.mqttService.gotLogFile && this.logWait.length > 0) {
        if (!this.processingWait) {
          this.processingWait = true
          while (this.logWait.length) {
            this.nsLog.push(this.logWait.shift())
          }
          this.logWait = []
          this.processingWait = false
        }
      }
      try {
        /*
        const formatData = `${this.pipe.transform(new Date(log['timestamp']), 'M/d/yy HH:mm:ss:SSS')} ` +
                            `[${(log['threadName'] + '      ').slice(0, 10)}]` +
                            `[${(log['levelname'] + '     ').slice(0, 5)}] :: ${log['message']}` */
        if (this.mqttService.gotLogFile) {
          this.nsLog.push(log.endsWith('\n') ? log : `${log}\n`)
        } else {
          this.logWait.push(log.endsWith('\n') ? log : `${log}\n`)
        }
        if (this.autoScroll) { setTimeout(() => { this.scrollToBottom() }, 100) }
      } catch (err) {
        console.log(err)
        return
      }
    })
  }

  ngOnDestroy() {
    this.nsLogsSub.unsubscribe()
  }

  download() {
    //let download = this.mqttService[this.log].subscribe((text) => {
    const element = document.createElement('a')
    const fileType = 'text/plain'
    element.setAttribute('href', `data:${fileType};charset=utf-8,${encodeURIComponent(this.nsLog.join(''))}`)
    element.setAttribute('download', `${this.name}.txt`)
    var event = new MouseEvent("click");
    element.dispatchEvent(event);
    //})
    //download.unsubscribe()
  }

  cancel() {
    this.activeModal.dismiss()
  }

  confirm() {
    this.activeModal.dismiss()
  }

  scrollToTop() {
    this.logScrollContainer.nativeElement.scrollTop = 0
  }

  scrollToBottom() {
    this.logScrollContainer.nativeElement.scrollTop = this.logScrollContainer.nativeElement.scrollHeight
  }


}
