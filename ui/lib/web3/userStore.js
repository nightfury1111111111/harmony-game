import hmy from './hmy';
import {
    hexToNumber,
    fromWei,
    Units
} from '@harmony-js/utils';
class userStore {

    constructor() {
        this.isOneWallet = window?.onewallet && window.onewallet.isOneWallet;
        this.onewallet = window?.onewallet;
        console.log(this.onewallet, window.onewallet);
    }

    async signout() {
        if (this.onewallet) {
            await this.onewallet.forgetIdentity();
            this.address = null;
            this.account = null;
            this.isAuthorized = false;
            this.balance = 0;
        }
    }

    async signin() {
        console.log("Connect Called");
        const [account] = await window.ethereum.request({ method: "eth_requestAccounts" });

        // console.log(this.onewallet);

        // const getAccount = await this.onewallet.getAccount();

        try {
            await window.ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: "0x6357d2e0" }],
            });
        } catch (error) {
            console.log("switch network error", error);
            if (error.code === 4902) {
                try {
                await window.ethereum.request({
                    method: "wallet_addEthereumChain",
                    params: [
                    {
                        chainName: "Harmony Testnet",
                        nativeCurrency: { name: "ONE", symbol: "ONE", decimals: 18 },
                        chainId: "0x" + Number(1666700000).toString(16),
                        rpcUrls: [`https://api.s0.b.hmny.io`],
                        blockExplorerUrls: ["https://explorer.pops.one/"],
                    },
                    ],
                });
                } catch (addError) {
                console.error("add network error", addError);
                return false;
                }
            }
            console.error("Failed to setup the network in Metamask:", error);
            return false;
        }

        this.address = account;
        this.account = account;
        this.isAuthorized = true;

        const response = await hmy.blockchain.getBalance({
          address: this.address,
        });

        this.balance =
          Math.round(100 * fromWei(hexToNumber(response.result), Units.one)) /
          100;

        // console.log(this.onewallet);

        // const getAccount = await this.onewallet.getAccount();

        // this.address = getAccount.address;
        // this.account = getAccount;
        // this.isAuthorized = true;

        // const response = await hmy.blockchain.getBalance({
        //   address: this.address,
        // });

        // this.balance =
        //   Math.round(100 * fromWei(hexToNumber(response.result), Units.one)) /
        //   100;
    }

    signTransaction(txn) {
        //if (this.isOneWallet) {
            console.log("Signing", txn);
        return this.onewallet.signTransaction(txn);
        //}
    }

    attachToContract(contract) {
        console.log("Attaching contract");
        if (this.onewallet) {
            console.log("one wallet", contract.wallet, contract.wallet.signTransaction);
            contract.wallet.signTransaction = async (tx) => {
                console.log("Requeting to sign a transaction?");
                tx.from = this.address;
                const signTx = await this.signTransaction(tx);
                console.log(signTx);
                return signTx;
            }
        }
        return contract
    }
}

export default userStore