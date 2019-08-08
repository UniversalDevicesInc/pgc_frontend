import { BrowserModule } from '@angular/platform-browser'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http'
import { NgbModule } from '@ng-bootstrap/ng-bootstrap'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { ToastrModule } from 'ngx-toastr'
import { NgxSpinnerModule } from 'ngx-spinner'

import { Authinterceptor } from './interceptors/authinterceptor'

import { SafePipe } from './pipes/safe.pipe'

import { AppComponent } from './app.component'
import { DashboardComponent } from './components/dashboard/dashboard.component'
import { OauthComponent } from './components/oauth/oauth.component'
import { AppRoutingModule } from './/app-routing.module'
import { LoginComponent } from './components/login/login.component'
import { NavbarComponent } from './components/navbar/navbar.component'
import { FooterComponent } from './components/footer/footer.component'
import { LogComponent } from './components/log/log.component'
import { StoreComponent } from './components/store/store.component'
import { DetailsComponent } from './components/details/details.component'
import { ModalConfirmComponent } from './components/modal-confirm/modal-confirm.component'
import { ModalAddnodeserverComponent } from './components/modal-addnodeserver/modal-addnodeserver.component'
import { ModalLogComponent } from './components/modal-log/modal-log.component';
import { NsoauthComponent } from './components/nsoauth/nsoauth.component'


@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    OauthComponent,
    LoginComponent,
    NavbarComponent,
    FooterComponent,
    LogComponent,
    StoreComponent,
    ModalConfirmComponent,
    SafePipe,
    ModalAddnodeserverComponent,
    DetailsComponent,
    ModalLogComponent,
    NsoauthComponent,
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    FormsModule,
    NgbModule,
    AppRoutingModule,
    BrowserAnimationsModule, // required animations module
    ToastrModule.forRoot({
      positionClass: 'toast-bottom-right',
      progressBar: true,
      enableHtml: true,
      closeButton: true,
      timeOut: 5000
    }), // ToastrModule added
    NgxSpinnerModule
  ],
  providers: [{
    provide: HTTP_INTERCEPTORS,
    useClass: Authinterceptor,
    multi: true
  }],
  bootstrap: [AppComponent],
  entryComponents: [
    ModalConfirmComponent,
    ModalAddnodeserverComponent,
    ModalLogComponent
  ]
})

export class AppModule { }
