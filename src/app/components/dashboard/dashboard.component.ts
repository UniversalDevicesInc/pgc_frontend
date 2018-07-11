import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service'
import { LoggerService } from '../../services/logger.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {

  constructor(
    private authService: AuthService,
    private loggerService: LoggerService
  ) { }

  ngOnInit() {
    this.authService.getUserProfile()
  }

  ngOnDestroy() {

  }

  refreshClick() {
    this.authService.getRefreshTokens().subscribe(_ => {})
  }

  urlClick() {
    this.authService.getUrl().subscribe(_ => {})
  }

}
