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
  @ViewChild('nslogScroll') private logScrollContainer: ElementRef
  @Input() title
  @Input() body
  @Input() log

  public autoScroll = true
  public nsLog: string[] = []
  public pipe = new DatePipe('en-US')

  constructor(
    public activeModal: NgbActiveModal,
    public settingsService: SettingsService,
    private mqttService: MqttService,
  ) { }

  ngOnInit() {
    this.mqttService[this.log].subscribe((log) => {
      if (log === null) { return }
      try {
        log = JSON.parse(log)
        // console.log(log['timestamp'])
        const formatData = `${this.pipe.transform(new Date(log['timestamp']), 'M/d/yy HH:mm:ss:SSS')} ` +
                            `[${(log['threadName'] + '      ').slice(0, 10)}]` +
                            `[${(log['levelname'] + '     ').slice(0, 5)}] :: ${log['message']}`
        this.nsLog.push(formatData)
        if (this.autoScroll) { setTimeout(() => { this.scrollToBottom() }, 100) }
      } catch (err) { return }
    })
  }

  ngOnDestroy() {
    // this.mqttService.nsLogs.unsubscribe()
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
