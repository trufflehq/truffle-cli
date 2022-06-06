#!/usr/bin/env node
'use strict'
import { deploy, watch } from './deploy.js'
import clone from './clone.js'

const action = process.argv[2]

if (action === 'clone') {
  clone()
} else if (action === 'deploy') {
  deploy()
} else if (action === 'watch') {
  watch()
}
