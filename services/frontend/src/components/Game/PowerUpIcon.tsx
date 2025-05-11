import Babact from "babact";
import { MapSide } from "pong";
import { PongEventType } from "yatt-lobbies";

export interface PowerUp {
	type: PongEventType,
	time: number,
	isGlobal: boolean,
	team: MapSide,
}

export default function PowerUpIcon({ powerUp, hidden }: { powerUp: PowerUp, [key: string]: any }) {

	const getPowerUpIcon = () => {
		switch (powerUp.type) {
			case PongEventType.MULTIBALL:
				return <i>⚾️</i>;
			case PongEventType.ATTRACTOR:
				return <i>🧲</i>;
			case PongEventType.SMALLPADDLE:
				return <i>🔽</i>;
			case PongEventType.ICE:
				return <i>❄️</i>;
			default:
				return <i>❓</i>;
		}
	}

	return <div className={`powerup flex items-center justify-center ${hidden ? 'hidden' : ''} ${powerUp.isGlobal ? 'global' : ''} ${powerUp.team === MapSide.LEFT ? 'left' : 'right'} ${powerUp.time < 5 ? 'warning' : ''}`}>
		{getPowerUpIcon()}
		{Math.floor(powerUp.time)}
	</div>
}