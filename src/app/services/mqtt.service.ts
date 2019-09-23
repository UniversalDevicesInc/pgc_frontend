import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http'
import { catchError, map, tap } from 'rxjs/operators'
import { BehaviorSubject, Observable, throwError } from 'rxjs'
import * as AWS from 'aws-sdk'
import * as mqtt from 'mqtt/dist/mqtt'
import * as pako from 'pako/dist/pako'
import { ToastrService } from 'ngx-toastr'

import { environment } from '../../environments/environment'

import { LoggerService } from './logger.service'
import { SettingsService } from './settings.service'
import Amplify, { Auth, PubSub } from 'aws-amplify'
import * as signUrl from 'aws-device-gateway-signed-url'

@Injectable({
  providedIn: 'root'
})
export class MqttService {

  public getIsys: BehaviorSubject<object> = new BehaviorSubject(null)
  public getNodeServers: BehaviorSubject<object> = new BehaviorSubject(null)
  public nsUpdate: BehaviorSubject<object> = new BehaviorSubject(null)
  public notification: BehaviorSubject<object> = new BehaviorSubject(null)
  public nsLogs: BehaviorSubject<string> = new BehaviorSubject(null)
  public connected = false
  public gotLogFile = false
  private _iotEndpoint
  private client: any
  private clientId: string
  private topic: string
  private logTopic: string
  private _seq = Math.floor(Math.random() * 90000) + 10000

  constructor(
    private loggerService: LoggerService,
    private toastr: ToastrService,
    private settingsService: SettingsService,
    private http: HttpClient
  ) {}

  /** Log a message with the LoggerService */
  private log(message: string) {
    this.loggerService.add(`MqttService: ${message}`)
  }

  getId() {
    return this.settingsService.id
  }

  getUrl() {
    this.log(`Getting MQTT URL from backend`)
    const headers = new HttpHeaders( { } )
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${this.getId()}`)
    const params = {
      id: this.getId(),
    }
    return this.http.get(`${environment.PG_URI}/api/sys/getioturl`, { params: params, headers: headers })
      .pipe(catchError(this.handleError('getUrl', [])))
  }

  getStore() {
    this.log(`Getting NodeServers from Store`)
    const headers = new HttpHeaders( { } )
    .set('Content-Type', 'application/json')
    return this.http.get(`${environment.STORE_URI}/api/store/list?cloud&sort`, { headers: headers })
      .pipe(catchError(this.handleError('getStore', [])))
  }

  start() {
    this.log(`Starting MQTT Service :: ${environment.STAGE}`)
    //this.getUrl().subscribe(data => this.connect(data['url']))
    this.connect()
  }

  async connect() {
    if (this.connected) { return }
    AWS.config.region = 'us-east-1'
    const creds = await Auth.currentCredentials()
    AWS.config.credentials = creds
    const iot = new AWS.Iot({ credentials: Auth.essentialCredentials(creds) })
    await iot.attachPolicy({
      policyName: 'iot-core',
      target: (await Auth.currentCredentials()).identityId
    }).promise()
    this._iotEndpoint = (await iot.describeEndpoint({ endpointType: 'iot:Data-ATS' }).promise()).endpointAddress
    const options = {
      accessKey: Auth.essentialCredentials(creds).accessKeyId,
      secretKey: Auth.essentialCredentials(creds).secretAccessKey,
      sessionToken: Auth.essentialCredentials(creds).sessionToken,
      regionName: AWS.config.region,
      endpoint: this._iotEndpoint,
      expires: 60
    }
    let url = signUrl(options)

    if (!this.clientId) {
      this.clientId = `pgc-${this.randomString(10)}`
    }
    if (!this.client) {
      this.client = mqtt.connect(url, options)
    } else {
      this.client.reconnect()
    }

    this.client.on('connect', () => {
      this.connected = true
      this.log(`MQTT connected to ${this._iotEndpoint}`)
      this.topic = `${environment.STAGE}/frontend/${this.getId()}/${this.clientId}`
      this.client.subscribe(this.topic, null)
      this.client.subscribe(`${environment.STAGE}/frontend/${this.getId()}`, null)
      this.addSubscribers()
      this.request('getIsys', '')
    })

    this.client.on('message', (topic, message, packet) => {
      if (message === null) { return }
      if (topic.includes('/file')) {
        try {
          const output = pako.inflate(message, {to: 'string'})
          // console.log(output)
          let lines = output.split('\n')
          lines.forEach((line) => {
            if (line) {
              this.nsLogs.next(Object.assign(JSON.parse(line), { file: true }))
            }
          })
          this.gotLogFile = true
        } catch (err) {
          console.error(err.stack)
        }
      } else {
        const msg = JSON.parse(message.toString())
        if (topic.startsWith(`${environment.STAGE}/frontend/${this.getId()}/logs`)) {
          this.nsLogs.next(msg)
        } else {
          for (const key in msg) {
            if (['result', 'userId', 'topic', 'id'].includes(key)) { continue }
            if (this[key]) {
              if (msg.hasOwnProperty('id')) {
                msg[key].id = msg.id
              }
              this[key].next(msg[key])
            }
          }
          // if (msg.node && msg.node.substring(0, 3) === 'pgc') { return }
          // if (topic === 'test') {
          this.log(message)
        }
      }
    })
  }

  addSubscribers() {
    // currentIsy Subscriber
    this.settingsService.currentIsy.subscribe(currentIsy => {
      if (currentIsy !== null) {
        this.request('getNodeServers', { id: currentIsy['id'] })
      }
    })

    // getNodeServers Subscriber
    this.getNodeServers.subscribe(nodeservers => {
      if (nodeservers !== null) {
        if (this.settingsService.currentIsy.value['id'] === nodeservers['id']) {
          delete nodeservers['id']
          this.settingsService.currentNodeServers.next(nodeservers)
          this.settingsService.availableNodeServerSlots = []
          for (let slot = 1; slot <= 25; slot++) {
            if (!nodeservers.hasOwnProperty(slot)) {
              this.settingsService.availableNodeServerSlots.push(slot)
            }
          }
        }
      }
    })

    // nsUpdate incremental updates
    this.nsUpdate.subscribe(update => {
      if (update !== null) {
        if (this.settingsService.currentIsy.value['id'] === update['id']) {
          delete update['id']
          const ns = Object.assign(this.settingsService.currentNodeServers.value, update)
          this.settingsService.currentNodeServers.next(ns)
        }
      }
    })

    // notification Subscriber
    this.notification.subscribe(notice => {
      if (notice !== null) {
        if (notice.hasOwnProperty('type') && notice.hasOwnProperty('msg')) {
          if (typeof this.toastr[notice['type']] === 'function') {
          this.toastr[notice['type']](notice['msg'])
          }
        }
      }
    })
  }

  nsRequest() {
    this.request('getNodeServers', { id: this.settingsService.currentIsy.value['id'] })
  }

  sendMessage(topic, message, retained = false, needResponse = false) {
    if (needResponse) {
      this._seq++
    }
    const msg = JSON.stringify(Object.assign({userId: this.getId(), clientId: this.clientId},
      message, needResponse ? { seq: this._seq } : undefined))
    this.log(msg)
    this.client.publish(topic, msg, { qos: 0, retained: retained})
  }

  logRequest(worker, type) {
    this.gotLogFile = false
    if (type === 'startLogStream') {
      this.client.subscribe(`${environment.STAGE}/frontend/${this.getId()}/logs/${worker}`, null)
      this.client.subscribe(`${environment.STAGE}/frontend/${this.getId()}/logs/${worker}/file`, null)
    } else {
      this.client.unsubscribe(`${environment.STAGE}/frontend/${this.getId()}/logs/${worker}`, null)
      this.client.unsubscribe(`${environment.STAGE}/frontend/${this.getId()}/logs/${worker}/file`, null)
    }
    const payload = {[type]: {}}
    this.sendMessage(`${environment.STAGE}/ns/${worker}`, payload)
  }

  oauthRequest(worker, params) {
    const payload = {oauth: params}
    this.sendMessage(`${environment.STAGE}/ns/${worker}`, payload)
  }

  request(type, data, core = {}) {
    const payload = Object.assign(core, { [type]: data })
    this.sendMessage(`${environment.STAGE}/frontend`, payload)
  }

  /**
   * Generate Random string for client ID
   * @param length - length of randomString
   */
  randomString(length) {
    let text = ''
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return text
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error) // log to console instead

      // TODO: better job of transforming error for user consumption
      this.log(`${operation} failed: ${error.message}`)

      // Let the app keep running by returning an empty result.
      return throwError(error)
      // return of(result as T);
    }
  }
}
