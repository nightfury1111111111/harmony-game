import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import useStickyState from "../../lib/useStickyState";

const providerOptions = {
  /* See Provider Options Section */
};

// // list of charities
// const charities = [
//     {
//         "id": "123",
//         "organisation": "PAWS Society of Malaysia",
//         "organisationBanner": "/charities/1.png", // url of image
//         "description": `PAWS (PAWS Animal Welfare Society) is a non-profit animal shelter in Petaling Jaya
//         that has been in operation since 1987. We receive the surrender of unwanted dogs and
//         cats which we will vaccinate, deworm, neuter/spay, and put up for adoption. Currently,
//         there are over 250 dogs and 250 cats under the care of the shelter.`,
//         "story": `PAWS (PAWS Animal Welfare Society) is a non-profit animal shelter in Petaling Jaya that has been in operation since 1987. We receive the surrender of unwanted dogs and cats which we will vaccinate, deworm, neuter/spay, and put up for adoption. Currently, there are over 250 dogs and 250 cats under the care of the shelter.

//         The shelter and all costs involved in running it are entirely funded by the generous donations of the public as well as proceeds from charitable events. The PAWS team consists of four office staff, a number of part-time veterinarians, one vet assistant, six kennel workers, and one driver. PAWS is a registered Society under the Registry of Societies of Malaysia that is led by an elected committee.`,
//         "icon": "",
//         "heroImages": ["/charities/1.banner.jpg", "https://picsum.photos/id/501/256/144", "https://picsum.photos/id/502/256/144", "https://picsum.photos/id/503/256/144"], // URL of images to show
//         "publicKey": "",
//         "contactDetails": {
//             "email": "",
//             "site": "",
//             "twitter": "",
//             "facebook": "",
//             "phone": ""
//         },
//         "verified": true
//     },
// ];

// // list of active games
// const games = [
//     {
//         "organisation": "123",
//         "id": "1",
//         "status": "active",
//         "organisationName": "PAWS Malaysia",
//         "title": "Save the Kitties",
//         "entries": "520",
//         "totalParticipants": "1000",
//         "costPerEntry": "100",
//         "banner": "/charities/1.campaign.cat.png",
//         "endorsed": true,
//         "totalEndorsers": "100",
//         "currentEndorsers": "100",
//         "about": `The branch aims to help cats and kittens both in branch care and working with communities to help stray or community cats and feral cats.

//         As a volunteer-run branch, we do not have a central adoption centre or base. The cats in our care are looked after by fosterers in either purpose built pens in their garden or dedicated foster rooms within their homes. Cats in branch care are never allowed to roam freely around houses or mix with other cats. This is to ensure we can clean the rooms and pens properly between cats and ensure effective disease control. To find out more about the welfare standards you can expect to find if you are adopting from the branch, please visit out welfare pages.

//         We are run entirely by volunteers and we couldn’t do any of the above without our brilliant band of volunteers who give up their time to keep the branch running. We are always looking to recruit new volunteers, please check out our volunteer page to find out more.`,
//         "heroImages": ["/charities/1.campaign.cat.png", "/charities/1.banner.jpg", "https://picsum.photos/id/501/256/144", "https://picsum.photos/id/502/256/144", "https://picsum.photos/id/503/256/144"], // URL of images to show

//     }, {
//         "organisation": "123",
//         "id": "3",
//         "status": "completed",
//         "organisationName": "PAWS Malaysia",
//         "title": "Save the Kitties",
//         "entries": "1000",
//         "totalParticipants": "1000",
//         "costPerEntry": "100",
//         "banner": "/charities/1.campaign.cat.png",
//         "endorsed": true,
//         "totalEndorsers": "100",
//         "currentEndorsers": "100",
//         "about": `The branch aims to help cats and kittens both in branch care and working with communities to help stray or community cats and feral cats.

//         As a volunteer-run branch, we do not have a central adoption centre or base. The cats in our care are looked after by fosterers in either purpose built pens in their garden or dedicated foster rooms within their homes. Cats in branch care are never allowed to roam freely around houses or mix with other cats. This is to ensure we can clean the rooms and pens properly between cats and ensure effective disease control. To find out more about the welfare standards you can expect to find if you are adopting from the branch, please visit out welfare pages.

//         We are run entirely by volunteers and we couldn’t do any of the above without our brilliant band of volunteers who give up their time to keep the branch running. We are always looking to recruit new volunteers, please check out our volunteer page to find out more.`,
//         "heroImages": ["/charities/1.campaign.cat.png", "/charities/1.banner.jpg", "https://picsum.photos/id/501/256/144", "https://picsum.photos/id/502/256/144", "https://picsum.photos/id/503/256/144"], // URL of images to show

//     }, {
//         "organisation": "123",
//         "id": "2",
//         "status": "pending",
//         "organisationName": "PAWS Malaysia",
//         "title": "Save the Kitties",
//         "entries": "0",
//         "totalParticipants": "1000",
//         "costPerEntry": "100",
//         "banner": "/charities/1.campaign.cat.png",
//         "endorsed": false,
//         "totalEndorsers": "100",
//         "currentEndorsers": "20",
//         "about": `The branch aims to help cats and kittens both in branch care and working with communities to help stray or community cats and feral cats.

//         As a volunteer-run branch, we do not have a central adoption centre or base. The cats in our care are looked after by fosterers in either purpose built pens in their garden or dedicated foster rooms within their homes. Cats in branch care are never allowed to roam freely around houses or mix with other cats. This is to ensure we can clean the rooms and pens properly between cats and ensure effective disease control. To find out more about the welfare standards you can expect to find if you are adopting from the branch, please visit out welfare pages.

//         We are run entirely by volunteers and we couldn’t do any of the above without our brilliant band of volunteers who give up their time to keep the branch running. We are always looking to recruit new volunteers, please check out our volunteer page to find out more.`,
//         "heroImages": ["/charities/1.campaign.cat.png", "/charities/1.banner.jpg", "https://picsum.photos/id/501/256/144", "https://picsum.photos/id/502/256/144", "https://picsum.photos/id/503/256/144"], // URL of images to show

//     }, {
//         "organisation": "123",
//         "id": "4",
//         "status": "cancelled",
//         "organisationName": "PAWS Malaysia",
//         "title": "Save the Kitties",
//         "entries": "120",
//         "totalParticipants": "1000",
//         "costPerEntry": "100",
//         "banner": "/charities/1.campaign.cat.png",
//         "endorsed": true,
//         "totalEndorsers": "100",
//         "currentEndorsers": "100",
//         "about": `The branch aims to help cats and kittens both in branch care and working with communities to help stray or community cats and feral cats.

//         As a volunteer-run branch, we do not have a central adoption centre or base. The cats in our care are looked after by fosterers in either purpose built pens in their garden or dedicated foster rooms within their homes. Cats in branch care are never allowed to roam freely around houses or mix with other cats. This is to ensure we can clean the rooms and pens properly between cats and ensure effective disease control. To find out more about the welfare standards you can expect to find if you are adopting from the branch, please visit out welfare pages.

//         We are run entirely by volunteers and we couldn’t do any of the above without our brilliant band of volunteers who give up their time to keep the branch running. We are always looking to recruit new volunteers, please check out our volunteer page to find out more.`,
//         "heroImages": ["/charities/1.campaign.cat.png", "/charities/1.banner.jpg", "https://picsum.photos/id/501/256/144", "https://picsum.photos/id/502/256/144", "https://picsum.photos/id/503/256/144"], // URL of images to show
//     }, {
//         "organisation": "123",
//         "id": "5",
//         "status": "cancelled",
//         "organisationName": "PAWS Malaysia",
//         "title": "Save the Kitties",
//         "entries": "0",
//         "totalParticipants": "1000",
//         "costPerEntry": "100",
//         "banner": "/charities/1.campaign.cat.png",
//         "endorsed": false,
//         "totalEndorsers": "100",
//         "currentEndorsers": "0",
//         "about": `The branch aims to help cats and kittens both in branch care and working with communities to help stray or community cats and feral cats.

//         As a volunteer-run branch, we do not have a central adoption centre or base. The cats in our care are looked after by fosterers in either purpose built pens in their garden or dedicated foster rooms within their homes. Cats in branch care are never allowed to roam freely around houses or mix with other cats. This is to ensure we can clean the rooms and pens properly between cats and ensure effective disease control. To find out more about the welfare standards you can expect to find if you are adopting from the branch, please visit out welfare pages.

//         We are run entirely by volunteers and we couldn’t do any of the above without our brilliant band of volunteers who give up their time to keep the branch running. We are always looking to recruit new volunteers, please check out our volunteer page to find out more.`,
//         "heroImages": ["/charities/1.campaign.cat.png", "/charities/1.banner.jpg", "https://picsum.photos/id/501/256/144", "https://picsum.photos/id/502/256/144", "https://picsum.photos/id/503/256/144"], // URL of images to show
//     }
// ];

export default function Home() {
  const [web3Modal, setModal] = useState(null);
  const router = useRouter();
  const [latest, setLatest] = useState(0);
  const [cards, setCards] = useState(null);
  const [charitiesObj, setCharitiesObj] = useStickyState([], "charities");
    const [mobile, setMobile] = useState(false);

  // useEffect(() => {
  //     setLatest(2); // read from the registry contract
  //     // save the charity details into the localStorage
  //     if (charitiesObj.length === 0) {
  //         setCharitiesObj(charities);
  //     }
  //     if (gamesObj.length === 0) {
  //         setGamesObj(games);
  //     }
  // }, []);

    useEffect(() => {
      const mobile = window?.innerWidth <= 425;
      setMobile(mobile);
    }, []);

  useEffect(() => {
    setCards(
      charitiesObj.map((charity) => {
        return (
          <div
            key={charity.id}
            style={{ width: "256px", height: "392px",  margin: "20px"}}
            className="card transition duration-500 ease-in-out hover:-translate-y-1 hover:scale-10 bg-neutral shadow-md"
          >
            <figure className="bg-neutral">
              <img src={charity.organisationBanner} className="h-32" />
            </figure>
            <div className="card-body">
              {charity.verified && (
                <p className="san-serif text-green-500">✓ VERIFIED</p>
              )}
              {!charity.verified && (
                <p className="san-serif text-blue-500">? UNVERIFIED</p>
              )}
              <p className="font-thin overflow-ellipsis">
                {charity.description.substring(0, 200) +
                  (charity.description.length > 200 ? "..." : "")}
              </p>
              <div className="justify-end card-actions">
                <button
                  title={charity.description}
                  className="btn btn-secondary"
                  onClick={(e) =>
                    router.push("/charities/details/" + charity.id)
                  }
                >
                  More info
                </button>
              </div>
            </div>
          </div>
        );
      })
    );
  }, [latest, charitiesObj]);

  return (
    <div
      className="container md mx-auto overflow-visible h-screen md:py-20 py-12 md:px-40 px-8 w-screen"
      style={{
        display: "flex",
        flexDirection: mobile ? "column": "row",
        justifyContent: "center",
        alignItems: mobile && "center",
        overflow: "auto",
      }}
    >
      {/* <div className="grid grid-flow-row md:grid-cols-3 md:grid-rows-2 md:gap-8"> */}
      {cards}
      {/* {cards} */}
      {/* </div> */}
    </div>
  );
}
