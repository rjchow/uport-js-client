#!/usr/bin/env node
const deploy = require('../deploy.js')
const argv = require('yargs').argv

const command = argv._[0]

switch(command) {
    case 'deploy':
      // TODO read and write configurations locally for reference by client after
      // TODO as part of config allow for contract args and other tx params

      const rpcUrl = argv.rpcUrl || 'http://127.0.0.1:7545'
      const from = argv.from || null

      deploy(rpcUrl, {from}).then(console.log)
      break;

    default:
        console.log('Invalid Command')
}
