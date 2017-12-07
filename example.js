const UPortClient = require('./index.js')
const deploy = require('./deploy.js')
const EthJS = require('ethjs-query');
const HttpProvider = require('ethjs-provider-http');
const { decodeToken } = require('jsontokens')

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

// By passing in no newtork configurations you can use the client as a mock client,
// where it will make no network resquests for TXs, ipfs, or responses, but rather
// mocks that functionality for testing.
const creatuPortMockClient = () => {
  uportClient = new UPortClient()
  uportClient.initKeys()
  return uportClient
}

const mockClient = creatuPortMockClient()
// const uri = 'me.uport:0x829BD824B016326A401d083B33D092293333A830?value=100'
const uri = 'me.uport:me?requestToken=eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJyZXF1ZXN0ZWQiOlsibmFtZSIsInBob25lIl0sInR5cGUiOiJzaGFyZVJlcSIsImlzcyI6IjB4NWIwYWJiZDM3YmNlYmI5OGEzOTA0NDViNTQwMTE1ZjNjODE5YTNiOSIsImlhdCI6MTQ4NTMyMTEzMzk5Nn0.ZvPhqYLJFa3wdETUcmWGk7Gm4MBNZdfe0eksqRcefwCYaMC96JzWUN0Ot42Pn1SX9M5CMQpkLksC5MQC2mYwgg'

mockClient.consume(uri).then(res => {
  console.log(decodeToken(res).payload)
})
