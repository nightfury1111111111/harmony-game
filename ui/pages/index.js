import react from "react";
import Hero from '../components/main/hero';


const providerOptions = {
  /* See Provider Options Section */
};


export default function Home() {

  // useEffect(e => {
  //   setModal(new Web3Modal({
  //     network: "mainnet", // optional
  //     cacheProvider: true, // optional
  //     providerOptions // required
  //   }));
  // });

  // useEffect(() => {
  //   themeChange(false)
  //   // 👆 false parameter is required for react project
  // }, []);

  return (
    <div className="container w-screen md:overflow-visible text-white">
      <Hero />
    </div>
  )
}
