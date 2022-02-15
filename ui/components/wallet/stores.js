import config from '../config'
import async from 'async'

import { OneWalletConnector } from '@harmony-react/onewallet-connector'
import { MathWalletConnector } from '@harmony-react/mathwallet-connector'

import { Hmy } from '@harmony-utils/wrappers'

class Store {
  constructor() {
    const hmy = new Hmy(config.network)
    const onewallet = new OneWalletConnector({ chainId: hmy.client.chainId })
    const mathwallet = new MathWalletConnector({ chainId: hmy.client.chainId })

    this.store = {
      currentBlock: 0,
      universalGasPrice: '70',
      account: {},
      hmy: hmy,
      web3: null,
      web3context: null,
      connectorsByName: {
        OneWallet: onewallet,
        MathWallet: mathwallet,
      }
    }
  }

  getStore(index) {
    return(this.store[index])
  }

  setStore(obj) {
    this.store = {...this.store, ...obj}
  }

  configure = async () => {
    const hmy = store.getStore('hmy')
    let currentBlock = await hmy.getBlockNumber()

    store.setStore({ currentBlock: currentBlock })
  }

  getBalances = () => {
    const tokens = store.getStore('tokens')
    const account = store.getStore('account')
    const hmy = store.getStore('hmy')

    async.map(tokens, (token, callback) => {
      async.parallel([
        (callback) => { this.getERC20Balance(hmy, token, account, callback) }
      ], (err, data) => {
        if(err) {
          console.log(err)
          return callback(err)
        }

        token.balance = data[0]
        callback(null, token)
      })
    }, (err, tokenData) => {
      if(err) {
        console.log(err)
        return -1;
      }
      store.setStore({tokens: tokenData})
    })
  }
}

const store = new Store()
const stores = {
  store: store
}
export default stores