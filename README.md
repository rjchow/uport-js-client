## uPort JS Client

uPort JS Client is a minimal javascript implementation of a uPort client in our protocol. Similarly to the uPort mobile app it acts as a data container of identity related information and manages a set of keys. You can use it to initialize new identities on any network. You can then interact with the client through the same interface as the mobile app by passing supported requests as properly formatted URL strings. It comes with additional helper and utility functions related to our protocol to make experimenting with new features and use cases easy. It is highly configurable, allowing it to be used for anything from an actual client in varying contexts and networks, all the way to a test client which mocks varying subsets of functionality.

This is sill in development and still lacks many features, tooling and stability. It does not provide any security related guarantees. Its primary use is for rapid prototyping, experimenting with both new features and new use cases, and for testing across the uPort protocol stack. Future development of this will focus on those uses, while building supporting tooling and reusable pieces of code.

## Client

To use a full uPort client pass in all network configs, these can easily be configured for a test network as well.

```javascript
import { UPortClient } from 'uport-js-client'

// Example configuration with local chain (ganache/testrpc) and local ipfs node
const config = {
        network: {
          id: '5777',
          rpcUrl: 'http://127.0.0.1:7545',
          registry:  '0x.....',
          identityManager: '0x.....'
        },
        ipfsConfig: 'http://127.0.0.1:5001'
      }
```

With a network configuration you can initialize a new client and a new identity.

```javascript
const uportClient = new UPortClient(config)
uportClient.initKeys()
```
For a new identity to be created multiple transactions are relayed to your given network. Your newly created account must have funds to pay for these transactions.

```javascript
// Fund this address before initializing the identity
console.log(uportClient.deviceKeys.address)
```

Lastly the identity can be created.

```javascript
uportClient.initializeIdentity().then(() => {
    // Now you can interact with your client
})
```
All interactions with your client and identity take place through the `consume` function by passing in URL strings, providing an interface similar to the mobile application.

```javascript           
// Create a URI, this one is at transaction request, these can be made with our other libraries.
const uri = 'me.uport:0x829BD824B016326A401d083B33D092293333A830?value=1&function=greeting(string hello)&callback_url=http://myapp.com/home'
uportClient.consume(uri).then(res => {
  // res = '0x1d2c60c30e1ea1758bbee8c73c19ac75fc5c1ddc2273985c29f8443857d943db'
})
```

If you want to initialize a client with an existing identity, identity related state including keys, credentials and configs can also be passed in during initialization or read from a storage layer.

```javascript           
// Coming soon
```
### Example

For a full working example of what is described above see the `examples/clientExample.js` file. If actually running the example (`node examples/clientExample.js`) make sure the network is properly configured for the network you are running it on. By default it can be quickly tried with ganache/testrpc.

### Storage

To persist an instance of a client you can serialize the object and then write it to any storage layer. You can later deserialize the object to use it again.

```javascript           
import { serialize, deserialize, UPortClient } from 'uport-js-client'

const uportClient = ...

const uportClientString = serialize(uportClient)

const uportClientAgain = deserialize(uportClientString)

```

### Contracts

If running this client on a test/local/private network or any network where we don't have our contract infrastructure deployed you can easily deploy your own [instances of our contracts](https://github.com/uport-project/uport-identity).

Either use our cli-tool to run the deployment or use the javascript object.

```bash    
uportclient deploy --rpcUrl [optional] --from [optional]
```

```javascript     
import deploy from './deploy.js'

// Example deploying contracts from local node/accounts
deploy('http://127.0.0.1:7545').then((contracts) => {
  console.log(contracts)
  // { Registry: '0xf25186b5081ff5ce73482ad761db0eb0d25abfbf',
  //   IdentityManager: '0x8f0483125fcb9aaaefa9209d8e9d7b9c8b9fb90f' }
})
```

### uPort Connect

This client can be also used to test your application if you are using uPort connect. It can offer quicker iterations than using the mobile app and it allows you test on networks (especially local test networks) which are not supported in the mobile app.

To use with connect you can configure `uPortClient` similarly to above and also pass in an additional config option so that responses are transported by the same means as the mobile app.

```javascript  
const config = {
        ...,
        responseHandler: 'http'
      }
const uportClient = new UPortClient(config)
uportClient.initKeys()
```

Once you have you a configured `uPortClient` you can configure connect as follows.

```javascript  
import { Connect } from 'uport-connect'

const uport = new Connect('MyDApp', { uriHandler: uPortClient.consume})

```

Now instead of the default connect flow of popping up a QR code, the request will be instantly relayed to the `uPortClient` and then a response returned so that you can continue your flow as if you had used the uPort mobile app for the interaction.

In the future we will offer better tooling to achieve the same when using the non default flows in uport-connect.

For a full working example of using this client with uport-connect see `.....js` file. (Coming soon)

## Mock Client

This client can also be configured as a mock client by not passing in any network configuration. This allows you to mock request/responses from the uPort mobile interface for testing and debugging. The client mocks much functionality and does not make any network requests.

First instantiate a mock client. You can optionally pass in a configuration object and an initial state object.

```javascript
import UPortMockClient from 'uport-js-client'

// You can optionally pass in test state
const initState = { info:  {name: 'John Ether', address: ..., ...},
                    credentials: ['eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJzdWIiOi...', ...]
                  }

const uportMockClient = new UPortMockClient({}, initState)
uportMockClient.initKeys()
```

If you want test state to run your tests against you can generate sets of test data with the client.

```javascript
// Coming soon
```

Once the object is instantiated you can pass in request URIs just as you would to the mobile app and in return receive a response.

```javascript
  // Simple request
  const uri = 'me.uport:me?callback_url=http://myapp.com/home'
  uportMockClient.consume(uri).then(res => {
    // res = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1Nk...'
    const address = decodeToken(res).payload.address
    // address = '0x3b2631d8e15b145fd2bf99fc5f98346aecdc394c'
  })
```      
```javascript      
  // Share Request
  const uri = 'me.uport:me?requestToken= eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJyZXF1ZXN0ZWQiOlsibmFtZSIsInBob25lIl0sInR5cGUiOiJzaGFyZVJlcSIsImlzcyI6IjB4NWIwYWJiZDM3YmNlYmI5OGEzOTA0NDViNTQwMTE1ZjNjODE5YTNiOSIsImlhdCI6MTQ4NTMyMTEzMzk5Nn0.ZvPhqYLJFa3wdETUcmWGk7Gm4MBNZdfe0eksqRcefwCYaMC96JzWUN0Ot42Pn1SX9M5CMQpkLksC5MQC2mYwgg'
  uportMockClient.consume(uri).then(res => {
    // res = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJuYW1lIjoiSm9obiBFdGhlciIsImlzcyI6IjB4M2IyNjMxZDhlMTViMTQ1...'
    const payload = decodeToken(res).payload
    // payload  = { name: 'John Ether',
    //              iss: '0x3b2631d8e15b145fd2bf99fc5f98346aecdc394c',
    //              iat: 1506446765211,
    //              verified: [ 'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJzdWIiO...' ],
    //              type: 'shareReq',
    //              ... }
  })
  ```      
  ```javascript           
  // Transaction Request
  const uri = 'me.uport:0x829BD824B016326A401d083B33D092293333A830?value=1&function=greeting(string hello)&callback_url=http://myapp.com/home'
  uportMockClient.consume(uri).then(res => {
    // res = '0x1d2c60c30e1ea1758bbee8c73c19ac75fc5c1ddc2273985c29f8443857d943db'
  })
  ```      
  ```javascript         
  // Add Attestation Request
  const uri = 'me.uport:add?attestations=eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJzdW...'
  uportMockClient.consume(uri).then(res => {
    // ...
  })
```

### Example

For a working example of what is described above see the `examples/mockClientExample.js` file.
