import { enableProdMode } from '@angular/core'
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic'

import { AppModule } from './app/app.module'
import { environment } from './environments/environment'

import Amplify from '@aws-amplify/core'
import Auth from '@aws-amplify/auth'
import awsconfig from './aws-exports'
Amplify.configure(awsconfig)

const oauth = {
  // Domain name
  domain : 'pgc-test.auth.us-east-1.amazoncognito.com',

  // Authorized scopes
  scope : ['email', 'profile', 'openid','aws.cognito.signin.user.admin'],

  // Callback URL
  redirectSignIn : 'https://localhost:8080', // or 'exp://127.0.0.1:19000/--/', 'myapp://main/'

  // Sign out URL
  redirectSignOut : 'https://localhost:8080', // or 'exp://127.0.0.1:19000/--/', 'myapp://main/'

  // 'code' for Authorization code grant,
  // 'token' for Implicit grant
  // Note that REFRESH token will only be generated when the responseType is code
  responseType: 'code',

  // optional, for Cognito hosted ui specified options
  options: {
      // Indicates if the data collection is enabled to support Cognito advanced security features. By default, this flag is set to true.
      AdvancedSecurityDataCollectionFlag : false
  }
}

Auth.configure({
  oauth: oauth
})

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
