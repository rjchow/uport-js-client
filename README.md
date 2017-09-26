## uport-mock-client

Mocks uPort mobile API. Allowing you to mock requests/responses in your unit tests and to debug requests/response.


First instantiate a mock client. You can optionally pass in a configuration object and an initial state object.

```javascript
import UPortMockClient from 'uport-mock-client'

const config = { privateKey: ...,
                 address:    ...,
                 nonce:      ... }

const initState = { info:  {name: 'John Ether', address: ..., ...},
                    credentials: ['eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJzdWIiOi...', ...]
                  }

const uportMockClient = new UPortMockClient(config, initState)
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
