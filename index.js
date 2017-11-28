const { decodeToken, createUnsignedToken, SECP256K1Client, TokenSigner } = require('jsontokens')
const Transaction = require('ethereumjs-tx')
const util = require('ethereumjs-util')
const BN = util.BN
const txutils = require('eth-signer/dist/eth-signer-simple.js').txutils
const EthJS = require('ethjs-query');

const getUrlParams = (url) => (
  url.match(/[^&?]*?=[^&?]*/g)
     .map((param) => param.split('='))
     .reduce((params, param) => {
       params[param[0]] = param[1]
       return params
     }, {}))

const  funcToData = (funcStr) => {
  const name = funcStr.match(/.*\(/g)[0].slice(0, -1)
  const [type, args] = funcStr.match(/\(.*\)/g)[0].slice(1, -1).split(',')
                         .map((str) => str.trim().split(' '))
                         .reduce((arrs, param) => {
                           arrs[0].push(param[0])
                           arrs[1].push(param[1])
                           return arrs
                         }, [[],[]])
  return txutils._encodeFunctionTxData(name, type, args)
}

const intersection = (obj, arr) => Object.keys(obj).filter(key => arr.includes(key))
const filterCredentials = (credentials, keys) => [].concat.apply([], keys.map((key) => credentials[key].map((cred) => cred.jwt)))

class UPortMockClient {
  constructor(config = {}, initState = {}) {
    this.privateKey = config.privateKey || '278a5de700e29faae8e40e366ec5012b5ec63d36ec77e8a2417154cc1d25383f'
    this.publicKey = SECP256K1Client.derivePublicKey(this.privateKey)
    this.address = config.address|| '0x3b2631d8e15b145fd2bf99fc5f98346aecdc394c'
    this.nonce = config.nonce || 0
    // {key: value, ...}
    this.info  = initState.info || { name: 'John Ether'  }
    // this.credentials = {address: [{jwt: ..., json: ....}, ...], ...}
    this.credentials = initState.credentials || { phone: [{ jwt: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJzdWIiOiIweDExMjIzMyIsImNsYWltIjp7ImVtYWlsIjoiYmluZ2JhbmdidW5nQGVtYWlsLmNvbSJ9LCJleHAiOjE0ODUzMjExMzQ5OTYsImlzcyI6IjB4MDAxMTIyIiwiaWF0IjoxNDg1MzIxMTMzOTk2fQ.-mEzVMPYnzqFhOr0O7fs71-dWAacnllVyOdWQY0zh2ZdIt7-30IYTewds4tGlkLmMky-Y1ZjRmIsxmM7xvAgxg',
                                    json: { "sub": '0x3b2631d8e15b145fd2bf99fc5f98346aecdc394c',
                                            "claim": { 'phone': '123-456-7891' },
                                            "exp": 1485321134996,
                                            "iss": '0x5b0abbd37bcebb98a390445b540115f3c819a3b9',
                                            "iat": 1485321133996
                                           }}]}
    const tokenSigner = new TokenSigner('ES256k', this.privateKey)
    this.signer = tokenSigner.sign.bind(tokenSigner)
    this.provider = config.provider || null
    this.ethjs = config.provider ? new EthJS(this.provider) : null;
  }

  sign(payload) {
    const hash = SECP256K1Client.createHash(payload)
    return SECP256K1Client.signHash(hash, this.privateKey)
  }

  addProfileKey(key, value ) {
    this.info[key] = value
  }

  // consume(uri, actions)   actions = ['accept', 'cancel', etc], returns promise to allow for net req options
  consume(uri, actions) {
    return new Promise((resolve, reject) => {
      const params = getUrlParams(uri)
      let response

      if (!!uri.match(/:me\?.*requestToken/g)) {
        // A shareReq in a token
        const token = decodeToken(params.requestToken).payload
        const verified = filterCredentials(this.credentials, intersection(this.credentials, token.requested) )
        const req = params.requestToken
        const info = intersection(this.info, token.requested)
                     .reduce((infoReq, key) => {
                       infoReq[key] = this.info[key]
                       return infoReq
                      }, {})
        const payload = {...info, iss: this.address, iat: new Date().getTime(), verified, type: 'shareReq', req}
        response = this.signer(payload)
        resolve(response)

      } else if (!!uri.match(/:me\?/g)) {
        // A simple request
        response = this.signer({iss: this.address, iat: new Date().getTime(), address: this.address})
        resolve(response)

      } else if (!!uri.match(/:0[xX][0-9a-fA-F]+\?/g)) {
        // Transaction signing request
        const to = uri.match(/0[xX][0-9a-fA-F]+/g)[0]
        const data = params.bytecode || params.function ? funcToData(params.function) : '0x' //TODO whats the proper null value?
        const nonce = this.nonce++
        const value = params.value
        const gas = params.gas ? params.gas : new BN('43092000') // TODO What to default?
        const gasPrice = new BN('20000000000')
        const txObj = {to, value, data, gas, gasPrice, nonce, data}
        const tx = new Transaction(txObj)
        tx.sign(new Buffer(this.privateKey, 'hex'))

        // If given provider send tx to network
        if (this.ethjs) {
          const rawTx = util.bufferToHex(tx.serialize())
          console.log(rawTx)
          this.ethjs.sendRawTransaction(rawTx).then(resolve, reject)
        } else {
          const txHash = util.bufferToHex(tx.hash(true))
          resolve(txHash)
        }

      } else if (!!uri.match(/add\?/g)) {
        // Add attestation request
        const attestations = params.attestations.isArray() ? params.attestations : [params.attestations]

        for (jwt in attestations) {
          const json = decodeToken(jwt).payload
          const key = Object.keys(json.claim)[0]
          this.credentials[key] ? this.credentials[key].append({jwt, json}) : this.credentials[key] = [{jwt, json}]
        }
        // TODO what is the response here? is there one

      } else {
        // Not a valid request
        reject(new Error('Invalid URI Passed'))
        //TODO  what is our error returns from mobile? do we do anything? if not this should maybe throw instead of return error?
      }
    })
  }
}
