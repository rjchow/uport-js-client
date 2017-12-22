const UPortClient = require('../index.js')
const { decodeToken } = require('jsontokens')

// By passing in no newtork configurations you can use the client as a mock client,
// where it will make no network resquests for TXs, ipfs, or responses, but rather
// mocks that functionality for testing.
const createuPortMockClient = () => {
  const uportClient = new UPortClient({})
  uportClient.initKeys()
  return uportClient
}

const mockClient = createuPortMockClient()

// A transaction request
// const uri = 'me.uport:0x829BD824B016326A401d083B33D092293333A830?value=100'
// A share request
const uri = 'me.uport:me?requestToken=eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJyZXF1ZXN0ZWQiOlsibmFtZSIsInBob25lIl0sInR5cGUiOiJzaGFyZVJlcSIsImlzcyI6IjB4NWIwYWJiZDM3YmNlYmI5OGEzOTA0NDViNTQwMTE1ZjNjODE5YTNiOSIsImlhdCI6MTQ4NTMyMTEzMzk5Nn0.ZvPhqYLJFa3wdETUcmWGk7Gm4MBNZdfe0eksqRcefwCYaMC96JzWUN0Ot42Pn1SX9M5CMQpkLksC5MQC2mYwgg'

// TODO will add functions to generate test data for clients

mockClient.consume(uri).then(res => {
  console.log(res)
})
