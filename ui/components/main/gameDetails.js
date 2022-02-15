import { useRouter } from 'next/router'
import GameButton from './gameButton';

function GameDetails({ game }) {

    const router = useRouter();

    let color = "warning";
    let percent = 0;
    if (game?.status === "pending" || game?.status === "cancelled" && !game?.endorsed) { // endorsement
        percent = 100 * (+game?.currentEndorsers) / (+game?.totalEndorsers + 1);
    }
    else { // 
        percent = 100 * (+game?.entries) / (+game?.totalParticipants + 1);
    }
    
    // if (percent < 30) color = "warning";
    // else if (percent < 60) color = "success";

    // pending endorsement, active, completed or cancelled
    // 
    return (<div className="card bordered compact bg-gray-600 shadow-2xl">
        <figure>
            <img src={game?.banner} />
        </figure>
        <div className="card-body">

            <p className="text-xs font-thin leading-relaxed">{game?.organisationName}</p>
            <p className="text-lg leading-relaxed">{game?.title}</p>
            <p className="text-sm font-thin leading-relaxed">{game?.costPerEntry} One/$6.20 per entry</p>
            {game?.status !== "pending" && <p className="text-sm font-thin leading-relaxed mt-2">{game?.entries} Participants</p>}
            {game?.status !== "pending" && <progress className={"progress progress-" + color} value={+game?.entries} max={+game?.totalParticipants}></progress>}
            {game?.status !== "pending" && <p className="text-xs text-gray-400 font-thin leading-relaxed">Of {game?.totalParticipants} Participants Goal</p>}

            {game?.status === "pending" && <p className="text-sm font-thin leading-relaxed mt-2">{game?.currentEndorsers} Endorsers</p>}
            {game?.status === "pending" && <progress className={"progress progress-" + color} value={+game?.currentEndorsers} max={+game?.totalEndorsers}></progress>}
            {game?.status === "pending" && <p className="text-xs text-gray-400 font-thin leading-relaxed">Of {game?.totalEndorsers} Endorser Goal</p>}
            
            <GameButton game={game} />
        </div>
    </div>);
}

export default GameDetails;