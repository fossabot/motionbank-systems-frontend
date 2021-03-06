/* global Primus */

import primus from '@feathersjs/primus-client'
import createClient from './index'

export default function (host, mbAuth) {
  return createClient(primus(new Primus(host)), mbAuth.auth)
}
