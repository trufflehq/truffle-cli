#!/usr/bin/env node
'use strict'
import { deploy, watch } from './deploy.js'
import download from './download.js'

const action = process.argv[2]

if (action === 'deploy') {
  deploy()
} else if (action === 'download') {
  download()
} else if (action === 'watch') {
  watch()
}
