// hero banner for the initiative [ok]
// game details (number of participants, total prize pool, cost per entry)
// Current stats (how many participants have entered the game) [ok]
// list of active participants
// Details about the organisation (e.g. PAWs)
// Details about how the money will be spent (include placeholder for milestones and attesters, etc)
// Analysis of participants per day over time (line)
// See a breakdown of winners vs DAO (pie)


import React, { useEffect, useState } from "react";
import { useRouter } from 'next/router';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons'
import useStickyState from "../../lib/useStickyState";
import OrgDetails from "../../components/main/orgDetails";
import GameButton from "../../components/main/gameButton";
import UserContext from "../../lib/web3/userContext";
import { claimPrize, getGame, getWinners, particpatingInGame, playGame } from "../../lib/web3/token";
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const MySwal = withReactContent(Swal)

library.add(fab, fas);

export default function Home() {
    const router = useRouter();
    const [tab, setTab] = useState(0);

    const { id } = router.query;
    const [selected, selectedGamesObj] = useStickyState(null, "game");
    const [games, setGames] = useStickyState([], "games");
    const [charities, setCharities] = useStickyState([], "charities");
    const [charity, setCharity] = useState({});
    const [entered, setEntered] = useState(false);
    const [user, setUser] = useStickyState({}, "user");
    const [buttonUpdating, setUpdating] = useState(false);
    const [winners, setWinners] = useState({});

    let color = "warning";
    let percent = 0;
    if (selected?.status === "pending" || selected?.status === "cancelled" && !selected?.endorsed) { // endorsement
        percent = 100 * (+selected?.currentEndorsers) / (+selected?.totalEndorsers + 1);
    }
    else { // 
        percent = 100 * (+selected?.entries) / (+selected?.totalParticipants + 1);
    }

    // if (percent < 30) color = "warning";
    // else if (percent < 60) color = "info";

    useEffect(() => {
        if (!id || !games || games.length === 0) return;
        if (selected) return;

        const sel = games.filter(e => e.id === id)[0];
        selectedGamesObj(sel);

        const c = sel.organisation;
        setCharity(charities.filter(e => e.id === c)[0]);

    }, [selected, games, id]);

    useEffect(() => {
        if (UserContext.user.isAuthorized && selected) {
            particpatingInGame(selected.id).then(result => {
                if (result.daoEscrow !== "0") {
                    // already entered the game
                    setEntered(true);
                }
            });
        }
        if (!UserContext.user.isAuthorized) {
            setEntered(false);
        }
    }, [UserContext.user.isAuthorized, selected]);

    useEffect(() => {
        console.log(selected?.status);
        async function handleResults() {
            if (selected && selected?.status === "completed") {
                const results = await getWinners(selected.id);
                console.log(results);
                setWinners(results);
            }
        }
        handleResults();
    }, [selected?.status]);

    const handleClick = async (game) => {
        // game completed/cancelled? ignore
        if (game.status !== "active") {
            return; // should change the button as well
        }
        setUpdating(true);
        
        if (!UserContext.user.isAuthorized) {
            await UserContext.user.signin();
            UserContext.setUser(UserContext.user);
        }

        const result = await playGame(game.id);
        console.log(result);
        if (result.status === "rejected") {
            // tell user they already entered the game ...
            Swal.fire(
                'Already Joined!',
                'You have already joined the game! Only one address per entry.',
                'error'
            );
        }
        else {
            // indicate they have already entered this game!

            // refresh selected game
            const gameObj = await getGame(game.id);
            selectedGamesObj(gameObj);

            Swal.fire(
                'Success',
                'You have successfully joined the social game!',
                'success'
            );
        }
        setUpdating(false);
        setEntered(true);
    }

    const handleClaimed = async () => {
        setUpdating(true);
        const result = await claimPrize(selected.id);

        if (result.results.status !== "called") {
            Swal.fire(
                'Error claiming prize',
                "An error occurred while trying to claim the prize, please check your wallet address and try again",
                "error"
            );
        } 
        else {
            Swal.fire(
                'Succesfully claimed the prize',
                `Before claiming the prize, you had ${result.before} ONE. After claiming the prize you now have ${result.after} ONE. Thanks for playing!`,
                'success'
            )
        }

        setUpdating(false);
    }

    const entries = (+(selected?.totalParticipants)) * (+(selected?.costPerEntry));
    const total = entries * 6.40; // note - use price from exchange, currently hardcoded

    return (
        <div className="container md mx-auto overflow-visible md:py-20 md:px-40 px-12 py-12 w-screen h-full">
            <div className="flex">
                <div className="h-16 flex-grow">
                    <p className="text-sm font-thin">
                        <a className="link link-hover text-green-300">{selected?.organisationName}</a>
                    </p>
                    <p className="text-3xl">

                        {selected?.title}
                    </p>
                </div>
            </div>
            <div className="flex md:flex-row flex-col md:gap-0 gap-4">
                <div className="flex-grow">
                    <div className="w-full carousel rounded-box">
                        {
                            selected?.heroImages?.map(img => {
                                return (
                                    <div key={img} className="w-full carousel-item">
                                        <img src={img} className="w-full" />
                                    </div>
                                )
                            })
                        }
                    </div>

                    <div className={"card bordered bg-gray-800 flex-grow compact mt-4"}>
                        <div className="card-body">
                            <div className="card-title">
                                About the Campaign
                            </div>
                            {
                                selected?.about?.split("\n").map((e, i) => {
                                    return <p key={i} className="font-thin leading-relaxed pb-4">{e}</p>
                                })
                            }
                            <div className="justify-start">
                                <GameButton game={selected} entered={entered} externalClickHandler={handleClick} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex-none md:w-1/4 md:ml-4">
                    <div className="card bordered bg-gray-800 compact">
                        <div className="card-body divide-y">
                            <div className="pb-4">
                                {selected && selected?.status !== "pending" && <h2 className="card-title">{selected?.entries} Participants</h2>}
                                {selected && selected?.status !== "pending" && <progress className={"progress progress-" + color} value={+selected?.entries} max={+selected?.totalParticipants}></progress>}
                                {selected && selected?.status !== "pending" && <p className="text-xs text-gray-400 font-thin leading-relaxed">Of {selected?.totalParticipants} Participants Goal</p>}
                                {selected && selected?.status !== "pending" && <p className="font-thin">@ {selected?.costPerEntry} ONE per entry <span className="text-gray-400">($6.40)</span></p>}
                                {selected && selected?.status !== "pending" && <p className="py-2">Goal {entries} ONE <span className="text-gray-400">(${total})</span></p>}

                                {selected && selected?.status === "pending" && <h2 className="card-title">{selected?.currentEndorsers} Endorsers</h2>}
                                {selected && selected?.status === "pending" && <progress className={"progress progress-" + color} value={+selected?.currentEndorsers} max={+selected?.totalEndorsers}></progress>}
                                {selected && selected?.status === "pending" && <p className="text-xs text-gray-400 font-thin leading-relaxed">Of {selected?.totalEndorsers} Endorser Goal</p>}
                            </div>
                            <div className="pt-4">
                                {selected?.status !== "pending" && selected?.endorsed && (<p className="san-serif text-green-500">
                                    ✓ ENDORSED
                                </p>)}
                                {selected?.status === "pending" && (<p className="san-serif text-blue-500">
                                    ? PENDING ENDORSEMENT
                                </p>)}
                                {selected?.status === "completed" && (<p className="san-serif text-blue-500">
                                    ✓ GAME COMPLETE
                                </p>)}
                                {selected?.status === "cancelled" && (<p className="san-serif text-red-500">
                                    x GAME CANCELLED
                                </p>)}

                                {!selected?.status === "active" && <p className="font-thin text-xs italic">Game must be endorsed before starting</p>}
                                <br />
                            </div>
                            {selected?.status === "completed" && <div className="pt-4">
                                <p className="py-2">The Winners {buttonUpdating && <FontAwesomeIcon icon="spinner" pulse />}</p>
                                <table>
                                    <tbody>
                                        <tr>
                                            <td>
                                                <svg height="32.069" width="33.448" xmlns="http://www.w3.org/2000/svg"><g data-name="1st badge"><g fill="#f8db4b" data-name="Path 24159"><path d="M27.127 10.458L27.11 21.58l-10.407 5.634L6.32 21.61l.017-11.123 10.407-5.633 10.384 5.603z"></path><path d="M7.32 21.015l9.382 5.063 9.409-5.093.015-9.93-9.383-5.062-9.409 5.093-.015 9.93m-2.001 1.192l.018-12.316 11.405-6.174 11.387 6.144-.018 12.315-11.405 6.174-11.388-6.144z"></path></g><g fill="#1f2c40" data-name="Path 24160"><path d="M26.722 10.237L16.707 26.445 6.745 10.267l10-5.412 9.977 5.382z"></path><path d="M16.709 24.541l8.605-13.926-8.568-4.624-8.596 4.652 8.56 13.899m-.004 3.808L5.338 9.89l11.405-6.173L28.13 9.861 16.706 28.35z" fill="#f8db4b"></path></g></g></svg>
                                            </td>
                                            <td>
                                                <div className="font-thin text-xs">
                                                {winners?.first}<br/>
                                                <p className="text-xs text-gray-400 font-thin leading-relaxed">Won {entries * 0.2} ONE {winners?.firstClaimed && <span className="font-thin text-green-300">Claimed!</span>} {!winners?.firstClaimed && winners?.first === UserContext.user.address && <button onClick={handleClaimed} className="btn btn-primary btn-xs font-thin">Claim!</button>}</p>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <svg height="32.069" width="33.448" xmlns="http://www.w3.org/2000/svg"><g data-name="2nd badge"><g fill="#c2c2c2" data-name="Path 24161"><path d="M27.128 10.459l-.017 11.121-10.407 5.634L6.32 21.612l.017-11.123 10.407-5.633 10.384 5.602z"></path><path d="M7.32 21.015l9.383 5.063 9.409-5.092.015-9.93-9.383-5.063-9.41 5.093-.014 9.93m-2.001 1.192l.018-12.316 11.405-6.174 11.387 6.144-.019 12.316-11.404 6.173-11.388-6.144z"></path></g><g fill="#1f2c40" data-name="Path 24162"><path d="M26.721 10.237L16.707 26.445 6.744 10.267l10-5.412 9.977 5.382z"></path><path d="M16.708 24.54l8.605-13.925-8.568-4.624-8.596 4.652 8.56 13.898m-.004 3.809L5.338 9.89l11.404-6.172 11.387 6.143L16.705 28.35z" fill="#c2c2c2"></path></g></g></svg>                                        </td>
                                            <td>
                                                <div className="font-thin text-xs">
                                                {winners?.second}<br/>
                                                <p className="text-xs text-gray-400 font-thin leading-relaxed">Won {entries * 0.1} ONE {winners?.secondClaimed && <span className="font-thin text-green-300">Claimed!</span>} {!winners?.secondClaimed && winners?.second === UserContext.user.address && <button onClick={handleClaimed} className="btn btn-primary btn-xs font-thin">Claim!</button>}      </p>
                                                </div>

                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <svg height="32.069" width="33.448" xmlns="http://www.w3.org/2000/svg"><g data-name="3rd badge"><g fill="#987630" data-name="Path 24161"><path d="M27.128 10.459l-.017 11.121-10.407 5.634L6.32 21.612l.017-11.123 10.407-5.633 10.384 5.602z"></path><path d="M7.32 21.015l9.383 5.063 9.409-5.092.015-9.93-9.383-5.063-9.41 5.093-.014 9.93m-2.001 1.192l.018-12.316 11.405-6.174 11.387 6.144-.019 12.316-11.404 6.173-11.388-6.144z"></path></g><g fill="#1f2c40" data-name="Path 24162"><path d="M26.721 10.237L16.707 26.445 6.744 10.267l10-5.412 9.977 5.382z"></path><path d="M16.708 24.54l8.605-13.925-8.568-4.624-8.596 4.652 8.56 13.898m-.004 3.809L5.338 9.89l11.404-6.172 11.387 6.143L16.705 28.35z" fill="#987630"></path></g></g></svg>

                                            </td>
                                            <td>
                                                <div className="font-thin text-xs">
                                                    {winners?.third}<br/>
                                                    <p className="text-xs text-gray-400 font-thin leading-relaxed">Won {entries * 0.05} ONE {winners?.thirdClaimed && <span className="font-thin text-green-300">Claimed!</span>} {!winners?.thirdClaimed && winners?.third === UserContext.user.address && <button onClick={handleClaimed} className="btn btn-primary btn-xs font-thin">Claim!</button>}</p>
                                                </div>

                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>}
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <GameButton game={selected} updating={buttonUpdating} entered={entered} externalClickHandler={handleClick} />
                    </div>
                    <OrgDetails charity={charity} />
                </div>
            </div>
        </div >
    );
}
