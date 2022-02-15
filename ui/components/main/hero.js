import { useRouter } from 'next/router'
import { useEffect, useState } from 'react';
import useStickyState from '../../lib/useStickyState';
import { getReporting } from '../../lib/web3/token';

function Hero() {
    const router = useRouter();

    const [backgroundNum, setBackgroundNum] = useState(1);
    const [mobile, setMobile] = useState(false);

    const [reporting, setReporting] = useStickyState({
      gamesPlayed: 0,
      organisations: 0,
      moneyRaised: 0,
      ticketsPurchased: 0
    }, "overallReport");

    useEffect(async e=>{
      setReporting(await getReporting());
    }, []);

    // useEffect(() => {
    //   console.log("component")
    //   const bgInterval = setInterval(() => {
    //     setBackgroundNum(backgroundNum + 1);
    //   }, 3000);

    //   return () => {
    //     console.log("Did unmount")
    //     clearInterval(bgInterval);
    //   }
    // }, [])

    useEffect(() => {
      const mobile = window?.innerWidth <= 425;
      setMobile(mobile)
    }, [])

    console.log("backgroundNum: ", backgroundNum);


    return (
      <div
        className="flex w-screen bg-cover card h-screen bg-neutral"
        style={{
          overflow: "auto",
          backgroundImage:
            "url('" + `unsplash-charity-${backgroundNum}.jpeg` + "')",
        }}
      >
        <div className="hero md:min-h-screen bg-neutral bg-opacity-60 md:mt-0 mt-20">
          <div className="flex-col hero-content lg:flex-row-reverse">
            <img
              style={ mobile ? {width: "200px"} : {}}
              src="/social-harmony.png"
              className="max-w-sm bg-neutral bg-opacity-70 rounded-lg shadow-2xl hero-img"
            />
            <div>
              <h1 className="mb-5 md:text-5xl font-bold text-2xl">
                A NEW WAY TO SHOW A CRYPTO CAUSE LUV 💙
              </h1>
              <p className="mb-5 md:text-lg text-md">
                Choose a game, enter the draw, and win while also supporting
                your favorite crypto causes.
              </p>
              <button
                className="btn btn-info"
                onClick={(e) => router.push("/charities/")}
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
        <div className="flex md:px-8 md:mx-8 py-8 justify-center w-screen md:absolute block bottom-0">
          <div
            className="stats shadow bg-gradient-to-r from-green-400 to-blue-500 object-bottom md:p5"
            style={{ zIndex: "1000" }}
          >
            <div className="stat bg-opacity-0">
              <div className="stat-title text-xs">Charities</div>
              <div className="stat-value">{reporting.organisations}</div>
            </div>
            <div className="stat bg-opacity-0">
              <div className="stat-title text-xs">Games Played</div>
              <div className="stat-value">{reporting.gamesPlayed}</div>
            </div>
            <div className="stat bg-opacity-0">
              <div className="stat-title text-xs">Tickets Bought</div>
              <div className="stat-value">{reporting.ticketsPurchased}</div>
            </div>
            <div className="stat bg-opacity-0">
              <div className="stat-title text-xs">ONE Donated</div>
              <div className="stat-value">{reporting.moneyRaised}</div>
            </div>
          </div>
        </div>
      </div>
    );
}

export default Hero;