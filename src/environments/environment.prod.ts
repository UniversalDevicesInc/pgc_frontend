import { version } from '../../package.json'

export const environment = {
  production: true,
  PG_URI: 'https://lgpz727w3j.execute-api.us-east-1.amazonaws.com/prod',
  STORE_URI: 'https://hsl7p7mdal.execute-api.us-east-1.amazonaws.com/prod',
  STAGE: 'prod',
  PG_REDIRECT: '',
  ENV: '',
  VERSION: version
}
