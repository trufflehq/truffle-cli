#!/usr/bin/env node
'use strict'
import auth from './auth.js'
import { deploy, watch } from './deploy.js'
import clone from './clone.js'
import create from './create.js'
import install from './install.js'
import fork from './fork.js'
import pull from './pull.js'
import regeneratePackageApiKey from './regenerate.js'
const action = process.argv[2]

;(async () => {
  try {
    switch (action) {
      case 'auth':
        await auth({ secretKey: process.argv[3] })
        break
      case 'clone':
        await clone({ packagePath: process.argv[3], toPackageSlug: process.argv[4] })
        break
      case 'create':
        await create({ toPackageSlug: process.argv[3] })
        break
      case 'deploy':
        await deploy({ shouldUpdateDomain: true })
        break
      case 'fork':
        await fork({ packagePath: process.argv[3], toPackageSlug: process.argv[4] })
        break
      case 'regenerate-api-key':
        await regeneratePackageApiKey()
        break
      case 'install':
        await install({ installedPackageVersionPath: process.argv[3] })
        break
      case 'pull':
        await pull()
        break
      case 'watch':
        await watch()
        break
      default:
        console.log('unknown action')
    }
  } catch (err) {
    console.error(err.message)
  }
})()
