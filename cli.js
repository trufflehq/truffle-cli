#!/usr/bin/env node
'use strict'
import download from './download.js'
import watch from './watch.js'

const action = process.argv[2]

if (action === 'download') {
  download()
} else if (action === 'watch') {
  watch()
}
