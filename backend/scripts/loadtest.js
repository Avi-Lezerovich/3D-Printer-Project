#!/usr/bin/env node
import autocannon from 'autocannon'

const url = process.env.TARGET || 'http://localhost:8080/api/health'
const duration = Number(process.env.DURATION || 10)
console.log('Starting load test', { url, duration })
const c = autocannon({ url, duration })
autocannon.track(c)
