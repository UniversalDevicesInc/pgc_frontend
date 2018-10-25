import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'

import { LoginComponent } from './components/login/login.component'
import { LogComponent } from './components/log/log.component'
import { DashboardComponent } from './components/dashboard/dashboard.component'
import { StoreComponent } from './components/store/store.component'
import { OauthComponent } from './components/oauth/oauth.component'
import { DetailsComponent } from './components/details/details.component'

import { AuthGuard } from './guards/auth.guard'

const appRoutes: Routes = [
  {path: '', component: LoginComponent},
  {path: 'api/oauth/portal', component: OauthComponent},
  {path: 'login', component: LoginComponent},
  {path: 'log', component: LogComponent, canActivate: [AuthGuard]},
  {path: 'details/:id', component: DetailsComponent, canActivate: [AuthGuard]},
  {path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard]},
  {path: 'store', component: StoreComponent, canActivate: [AuthGuard]},
  {path: '**', redirectTo: ''}
]

@NgModule({
  imports: [ RouterModule.forRoot(appRoutes) ],
  exports: [ RouterModule ]
})

export class AppRoutingModule { }
