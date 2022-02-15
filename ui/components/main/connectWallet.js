import { useEffect, useState } from 'react';
import useStickyState from '../../lib/useStickyState';
import UserContext from '../../lib/web3/userContext';

function ConnectWallet({ bal, addr }) {
    const [balance, setBalance] = useState(bal);
    const [address, setAddress] = useState(addr);
    const [mobile, setMobile] = useState(false)
    const [user, setUser] = useStickyState({}, "user");

    const connect = async () => {
        await UserContext.user.signin();
        setAddress(UserContext.user.address);
        setBalance(UserContext.user.balance);
        setUser(UserContext.user.account);
        UserContext.setUser(UserContext.user);
    }

    const clear = async () => {
        await UserContext.user.signout();
        setUser({});
        setAddress(null);
        setBalance(0);
        UserContext.setUser({});
    }

    useEffect(e => {
        setBalance(bal);
        setAddress(addr);
    }, [bal, addr])

    const getCompressed = (addr) => {
        const len = addr.length;
        return addr.substring(0, 4) + "..." + addr.substring(len - 3, len);
    }

    useEffect(() => {
      const mobile = window?.innerWidth <= 425;
      setMobile(mobile);
    }, []);


    return (
      <div>
        {!address && (
          <button onClick={connect}>
            <a className="btn btn-info btn-sm rounded-btn">Connect</a>
          </button>
        )}

        {address && (
          <div
            className="text-xs font-thin"
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            {/* {!mobile && (
              <div style={{ padding: "10px", fontSize: "15px" }}>
                {getCompressed(address)} <br />
              </div>
            )} */}
            {!mobile && (
              <div style={{ padding: "10px", fontSize: "15px" }}>
                <b>Balance</b>: {balance} <br />
              </div>
            )}
            <button
              className="btn btn-xs btn-info btn-sm rounded-btn"
              onClick={async (e) => clear()}
              style={{width: "72px"}}
            >
              {getCompressed(address)}
            </button>
          </div>
        )}
      </div>
    );
}

export default ConnectWallet;

