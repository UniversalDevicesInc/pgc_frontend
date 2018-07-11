import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service'

import { environment } from '../../../environments/environment'

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {

  isCollapsed: boolean = true
  username: string
  environment: any

  constructor(
    private router: Router,
    private authService: AuthService
  ) { this.environment = environment }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

}
