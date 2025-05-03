import Babact from "babact";
import Key from "../../ui/Key";
import Card from "../../ui/Card";
import Button from "../../ui/Button";
import config from "../../config";
import Timer from "./Timer";

export default function OnlineStartModal({
	playerSide,
	frozen,
	onTimeout
}: {
	playerSide: "left" | "right",
	frozen: boolean,
	onTimeout: () => void
}) {

	// return <div className='local-start-modal flex flex-col gap-4 justify-center items-center'>

	// 	{playerSide == "left" ?
	// 		<Card className="player-hint gap-4 right team1">
	// 			<h2>Left player</h2>
	// 			<div className="flex flex-col gap-2">
	// 				<p><Key key="ArrowUp"/> Move up</p>
	// 				<p><Key key="ArrowDown"/> Move down</p>
	// 			</div>
	// 		</Card>
	// 	:

	// 		<Card className="player-hint gap-4 left team2">
	// 			<h2>Right player</h2>
	// 			<div className="flex flex-col gap-2">
	// 				<p><Key key="ArrowUp"><i className="fa-solid fa-arrow-up"></i></Key> Move up</p>
	// 				<p><Key key="ArrowDown"><i className="fa-solid fa-arrow-down"></i></Key> Move down</p>
	// 			</div>
	// 		</Card>
	// 	}
	// 	{
	// 		frozen ? <> </> :
	// 		<Timer timer={config.START_TIMEOUT} onTimeout={onTimeout}/>
	// 	}
	// </div>
	
}