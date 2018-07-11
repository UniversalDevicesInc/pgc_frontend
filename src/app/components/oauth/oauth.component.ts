import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, of, Observable } from 'rxjs'

import { AuthService } from '../../services/auth.service'
import { LoggerService } from '../../services/logger.service';

@Component({
  selector: 'app-oauth',
  templateUrl: './oauth.component.html',
  styleUrls: ['./oauth.component.css']
})
export class OauthComponent implements OnInit {

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private loggerService: LoggerService
  ) { }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(params => {
      if (params.hasOwnProperty('code')) {
        this.authService.getTokens(params.code).subscribe(() => {
          this.router.navigate(['/dashboard'])
        })
      } else {
        this.loggerService.add('OauthComponent: Did not receive code in redirect.')
        this.router.navigate(['/login'])
      }
    })
  }

}
