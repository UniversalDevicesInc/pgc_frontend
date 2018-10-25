import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  logs: string[] = []
  constructor() { }

  add(message: string) {
    // if (!environment.production) {
      console.log(message)
      this.logs.push(message)
    // }
  }

  clear() {
    this.logs = []
  }
}
