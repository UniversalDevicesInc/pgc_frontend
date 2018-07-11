import { Component, OnInit, OnDestroy } from '@angular/core';

import { AuthService } from '../../services/auth.service'

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit, OnDestroy {

  username: string

  constructor(
    public authService: AuthService
  ) { }

  ngOnInit() {
    this.authService.getUsername()
    this.authService.username.subscribe((username) => { this.username = username })
  }

  ngOnDestroy() {
    this.authService.username.unsubscribe()
  }

}
