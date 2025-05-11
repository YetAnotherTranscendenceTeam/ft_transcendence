import Babact from 'babact';
import { usePong } from '../../contexts/usePong';
import { PongState } from 'pong';
import Button from '../../ui/Button';
import Scores from './Scores';
import Timer from './Timer';
import WinnerRoundOverlay from './WinnerRoundOverlay';
import WinnerMatchOverlay from './WinnerMatchOverlay';
import WaitingPlayerOverlay from './WaitingPlayerOverlay';

export default function GameOverlay({
		onResume,
		onStart,
		onRestart
	}: {
		onResume?: () => void;
		onStart?: () => void;
		onRestart?: () => void;
	}) {

	const { overlay } = usePong();

	if (!overlay)
		return;

	const displayBackground = overlay.gameStatus.isFrozen();

	return <div
		className='game-overlay'
	>
		<div className='flex items-center justify-center w-full'>
			<Scores />
		</div>
		<div
			className={`game-overlay-content flex flex-col gap-4 items-center justify-center ${displayBackground ? 'background' : ''}`}
		>
			{overlay.lastWinner !== null && <WinnerRoundOverlay />}
			{overlay.countDown > 0 && overlay.gameStatus.name !== PongState.RESERVED.name ? <Timer time={overlay.countDown}/> : ''}
			{overlay.gameStatus.name === PongState.RESERVED.name && !overlay.local && <WaitingPlayerOverlay />}
			{overlay.gameStatus.name === PongState.ENDED.name && <WinnerMatchOverlay key='match-overlay'/>}
			{
				overlay.local && overlay.gameStatus.name === PongState.RESERVED.name &&
				<Button className="primary" onClick={() => onStart()}>
					<i className="fa-solid fa-play"></i> Start Game
				</Button>
			}
			{
				overlay.local && overlay.gameStatus.name === PongState.PAUSED.name &&
				<Button className="primary" onClick={() => onResume()}>
					<i className="fa-solid fa-play"></i> Resume
				</Button>
			}
		</div>
	</div>

}