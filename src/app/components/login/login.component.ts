import { Component, OnInit } from '@angular/core';
//import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  public authService: AuthService

  constructor(
   // private router: Router,
    
  ) { }

  ngOnInit() {
  }

}
