import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Subscription } from 'rxjs/Subscription'
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service'
import { Auth, Hub } from 'aws-amplify'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {

   constructor(
    private router: Router,
    private zone: NgZone,
    public authService: AuthService
  ) {
  }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

}
