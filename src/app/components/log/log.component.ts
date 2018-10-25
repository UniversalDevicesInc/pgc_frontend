import { AfterViewChecked, ElementRef, ViewChild, Component, OnInit, OnDestroy } from '@angular/core'
import { LoggerService } from '../../services/logger.service';

@Component({
  selector: 'app-log',
  templateUrl: './log.component.html',
  styleUrls: ['./log.component.css']
})
export class LogComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('logScroll') private logScrollContainer: ElementRef;

  autoScroll

  constructor(
    public logService: LoggerService
  ) { }

  ngOnInit() {}

  ngOnDestroy() {}

  ngAfterViewChecked() {}

  scrollToTop() {
    this.logScrollContainer.nativeElement.scrollTop = 0
  }

  scrollToBottom() {
    this.logScrollContainer.nativeElement.scrollTop = this.logScrollContainer.nativeElement.scrollHeight
  }

}
