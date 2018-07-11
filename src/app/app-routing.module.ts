import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './components/login/login.component';
import { LogComponent } from './components/log/log.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { OauthComponent } from './components/oauth/oauth.component';

import { AuthGuard } from './guards/auth.guard';

const appRoutes: Routes = [
  {path: '', component: LoginComponent},
  {path: 'api/oauth/portal', component: OauthComponent},
  {path: 'login', component: LoginComponent},
  {path: 'log', component: LogComponent},
  {path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard]},
  {path: '**', redirectTo: ''}
]

@NgModule({
  imports: [ RouterModule.forRoot(appRoutes) ],
  exports: [ RouterModule ]
})

export class AppRoutingModule { }
