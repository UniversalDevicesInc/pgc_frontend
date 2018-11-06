import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { BehaviorSubject, of, Observable } from 'rxjs'

import { ToastrService } from 'ngx-toastr'
import { NgxSpinnerService } from 'ngx-spinner'

import { AuthService } from '../../services/auth.service'
import { LoggerService } from '../../services/logger.service'

@Component({
  selector: 'app-oauth',
  templateUrl: './oauth.component.html',
  styleUrls: ['./oauth.component.css']
})
export class OauthComponent implements OnInit {

  message = 'Waiting for oauth...'

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private loggerService: LoggerService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.spinner.show()
    this.activatedRoute.queryParams.subscribe(params => {
      if (params.hasOwnProperty('code')) {
        this.authService.getTokens(params.code,
            params.hasOwnProperty('userid') ? params.userid : false).subscribe(() => {
          this.toastr.success('Logged In')
          this.router.navigate(['/dashboard'])
        })
      } else {
        this.loggerService.add('OauthComponent: Did not receive code in redirect.')
        this.router.navigate(['/login'])
      }
      this.spinner.hide()
    })
  }

}
