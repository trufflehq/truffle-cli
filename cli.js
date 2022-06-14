#!/usr/bin/env node
'use strict'
import auth from './auth.js'
import { deploy, watch } from './deploy.js'
import clone from './clone.js'
import create from './create.js'
import pull from './pull.js'

const action = process.argv[2]

switch (action) {
  case 'auth':
    auth(process.argv[3]) // secretKey
    break
  case 'clone':
    clone(process.argv[3]) // packageSlug
    break
  case 'create':
    create(process.argv[3]) // packageSlug
    break
  case 'deploy':
    deploy()
    break
  case 'pull':
    pull()
    break
  case 'watch':
    watch()
    break
  default:
    console.log('unknown action')
}
