const Contract = require('truffle-contract')
const uportIdentity = require('uport-identity')
const registryArtifact = require('uport-registry')
const identityManagerArtifact = uportIdentity.IdentityManager.v1

// TODO need way to configure networks
const HttpProvider = require('ethjs-provider-http');
// const provider = new HttpProvider('http://127.0.0.1:7545')
const provider = new HttpProvider('http://localhost:7545')

const Registry = Contract(registryArtifact)
Registry.setProvider(provider)
const IdentityManager = Contract(identityManagerArtifact)
IdentityManager.setProvider(provider)

// IdentityManager Config
const userTimeLock = 50;
const adminTimeLock = 200;
const adminRate = 50;

// TODO handle args appropriately, pass in provider as well.
const deploy = (args) => {
  let resObj = {}

  return Registry.new({from: '0x627306090abaB3A6e1400e9345bC60c78a8BEf57', gas: 6000000, gasPrice: 3000000})
          .then(instance => {
            resObj.Registry = instance.address
            return IdentityManager.new(userTimeLock, adminTimeLock, adminRate, {from: '0x627306090abaB3A6e1400e9345bC60c78a8BEf57', gas: 6000000, gasPrice: 3000000})
          }).then(instance => {
            resObj.IdentityManager = instance.address
            return resObj
          })
}


module.exports = deploy
