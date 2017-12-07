const UPortClient = require('./index.js')
const deploy = require('./deploy.js')
const EthJS = require('ethjs-query');
const HttpProvider = require('ethjs-provider-http');

const rpcUrl = 'http://127.0.0.1:7545'
const eth = new EthJS(new HttpProvider(rpcUrl))
let uportClient

const createuPortClient = () => {
  return deploy(rpcUrl)
    .then(res => {
      const config = { network: { id: '5777', rpcUrl, registry: res.Registry, identityManager: res.IdentityManager } }
      uportClient = new UPortClient(config)
      uportClient.initKeys()
      return eth.coinbase()
    .then(address => {
      // Fund device key Transaction
      const fundTx = { to: uportClient.deviceKeys.address,
                       value: 0.5 * 1.0e18,
                       from: address,
                       data: '0x' }
      return eth.sendTransaction(fundTx)})
    .then( txHash => {
      console.log('Funded device key')
      return uportClient.initializeIdentity()
    }).then(res => {
      console.log('Identity Created')
      return uportClient
    })
  })
}

createuPortClient().then(client => {
  console.log(client)
  // Create a request
  // const uri =
  // Send to client
  // return client.consume(uri)
}).then(res => {
  // Handle Response
}).catch(console.log)
