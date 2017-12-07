const UPortClient = require('./index.js').UPortMockClient
const deploy = require('./deploy.js')
const EthJS = require('ethjs-query');
const HttpProvider = require('ethjs-provider-http');

const rpcUrl = 'http://127.0.1.0:7545'
const eth = new EthJS(new HttpProvider(rpcUrl))
let uportClient

const createuPortClient = () => {
  return deploy(rpcUrl)
    .then(res => {
      console.log(res)
      const config = Object.assign({  id: '5777', rpcUrl }, res)
      uportClient = new UPortClient(config)
      console.log(uportClient)
      uportClient.initKeys()
      return eth.coinbase()
    .then(address => {
      // Fund device key Transaction
      const fundTx = { to: uportClient.deviceKeys.address,
                       value: 0.1 * 1.0e18,
                       from: address }
      return eth.sendTransaction(fundTx)})
    .then( txHash => {
      console.log('Funded device key')
      return mockClient.initializeIdentity()
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
})
