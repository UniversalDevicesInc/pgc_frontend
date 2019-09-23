// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  PG_URI: 'https://pxu4jgaiue.execute-api.us-east-1.amazonaws.com/test',
  STORE_URI: 'https://hsl7p7mdal.execute-api.us-east-1.amazonaws.com/prod',
  STAGE: 'test',
  //PG_REDIRECT: 'https://localhost:8080',
  //AUTH_URI: 'https://pgc-test-auth.isy.io/login?response_type=code&client_id=ab6rn30rre6bjdtggnkbjjh73&redirect_uri=https://localhost:8080&state=abc123',
  ENV: 'dev'
}

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
