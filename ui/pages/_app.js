import 'tailwindcss/tailwind.css'
import React, { useEffect, useState } from "react";
import Link from 'next/link';
import ActiveLink from '../components/activeLink';
import Head from 'next/head';
import { getGames, getOrganisations, getReporting } from '../lib/web3/token';
import useStickyState from '../lib/useStickyState';
import ConnectWallet from '../components/main/connectWallet';
import UserContext from '../lib/web3/userContext';
import userStore from '../lib/web3/userStore';

function MyApp({ Component, pageProps }) {

  // load the information necessary for our website to begin

  const [games, setGames] = useStickyState([], "games");
  const [charities, setCharities] = useStickyState([], "charities");
  const [user, setUser] = useState({});
  const [reporting, setReporting] = useStickyState({
    gamesPlayed: 0,
    organisations: 0,
    moneyRaised: 0,
    ticketsPurchased: 0
  }, "overallReport");

  useEffect(async e=>{
    console.log("Full-scale refresh triggered");
    UserContext.setUser = setUser; //(new userStore());
    UserContext.user = new userStore();
    // setUser(UserContext.user);
    setGames(await getGames());
    setCharities(await getOrganisations());
    setReporting(await getReporting());
  }, []);

  console.log("User details is", user);

  return (<div className="text-white bg-gradient-to-r from-gray-600 to-gray-800">
    <Head>
        <title>Social Harmony - Donate for a Greater Good</title>
    </Head>
    <div className="navbar shadow-lg w-screen bg-black bg-opacity-80 text-neutral-content rounded-box" style={{ position: "absolute", top: "0px", zIndex: "1000" }}>
      <div className="flex-none px-2 mx-2">
        <Link href="/">
          <a className="flex justify-start">
            <img className="object-scale-down h-6 px-2" src="/harmony-one.svg" />
            <span className="text-lg font-bold float">
              CHARITY LUV
          </span>
          </a>
        </Link>
      </div>
      <div className="flex-1 px-2 mx-2">
        <div className="items-stretch hidden lg:flex">
          <ActiveLink href="/charities">
            Crypto Causes
            
          </ActiveLink>
          <ActiveLink href="/browse">
            Browse 🕹️
            
          </ActiveLink>
          
        </div>
      </div>
      <div className="flex-none">
        <ConnectWallet bal={user.balance} addr={user.address}/>
      </div>
      
    </div>
      <Component {...pageProps} />
  </div>);
}

export default MyApp
