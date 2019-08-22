import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs'

import { LoggerService } from './logger.service'

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  public currentIsy: BehaviorSubject<object> = new BehaviorSubject(null)
  public currentNodeServers: BehaviorSubject<object> = new BehaviorSubject(null)
  public isys
  public nodeServers
  public id
  public availableNodeServerSlots = []

  constructor(
    private loggerService: LoggerService
  ) { }

  /** Log a message with the LoggerService */
  private log(message: string) {
    this.loggerService.add(`SettingsService: ${message}`)
  }



}
