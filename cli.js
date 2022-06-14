#!/usr/bin/env node
'use strict'
import auth from './auth.js'
import { deploy, watch } from './deploy.js'
import clone from './clone.js'
import create from './create.js'
import fork from './fork.js'
import pull from './pull.js'

const action = process.argv[2]

switch (action) {
  case 'auth':
    auth({ secretKey: process.argv[3] })
    break
  case 'clone':
    clone({ combinedPackageSlug: process.argv[3], toPackageSlug: process.argv[4] })
    break
  case 'create':
    create({ toPackageSlug: process.argv[3] })
    break
  case 'deploy':
    deploy()
    break
  case 'fork':
    fork({ combinedPackageSlug: process.argv[3], toPackageSlug: process.argv[4] })
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
