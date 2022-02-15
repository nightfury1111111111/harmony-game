import { useRouter } from 'next/router'
import useStickyState from '../../lib/useStickyState';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function GameButton({ game, externalClickHandler, entered, updating }) {

    const router = useRouter();
    const [gameObj, setSelected] = useStickyState(game, "game");

    const handleClick = () => {
        if (externalClickHandler) {
            externalClickHandler(game);
        }
        else {
            setSelected(game);
            router.push("/browse/" + game?.id);
        }
    };
    if (entered && (game?.status !== "completed" && game?.status !== "cancelled")) {
        return (
        <div>
            <button className="btn btn-info flex-1 mt-4">Already Joined</button>
        </div>
        );
    }
    // pending endorsement, active, completed or cancelled
    // 
    return (<div>
        {game?.status !== "cancelled" && game?.status !== "completed" && game?.endorsed &&
            (<button className="btn btn-secondary flex-1 mt-4" onClick={handleClick}>
                {updating && <FontAwesomeIcon icon="spinner" pulse />} Join the Cause
            </button>)
        }
        {game?.status !== "cancelled" && game?.status !== "completed" && !game?.endorsed &&
            (<button className="btn btn-primary flex-1 mt-4" onClick={handleClick}>
               {updating && <FontAwesomeIcon icon="spinner" pulse />} Endorse Game</button>)
        }
        {game?.status === "completed" &&
            (<button className="" onClick={handleClick}><img src="/assets/completed.png" /></button>)
        }
        {game?.status === "cancelled" &&
            (<button className="" onClick={handleClick}><img src="/assets/cancelled.png" /></button>)
        }
    </div>);
}

export default GameButton;