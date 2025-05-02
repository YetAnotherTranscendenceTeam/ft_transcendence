import Babact from 'babact';
import { usePong } from '../../contexts/usePong';
import { PongState } from 'pong';
import Button from '../../ui/Button';
import Scores from './Scores';
import Timer from './Timer';

export default function GameOverlay({
		onResume,
		onStart
	}: {
		onResume?: () => void;
		onStart?: () => void;
	}) {

	const { overlay } = usePong();

	if (!overlay)
		return;

	const displayBackground = overlay.gameStatus.isFrozen();

	return <div
		className='game-overlay'
	>
		<div className='flex items-center justify-center w-full'>
			<Scores
				scores={overlay.scores}
				timer={overlay.time}
			/>
		</div>
		<div
			className={`game-overlay-content flex items-center justify-center ${displayBackground ? 'background' : ''}`}
		>
			{overlay.countDown > 0 ? <Timer time={overlay.countDown}/> : ''}
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
			{
				overlay.local && overlay.gameStatus.name === PongState.ENDED.name &&
				<Button className="primary" onClick={() => onStart()}>
					<i className="fa-solid fa-play"></i> Play again
				</Button>
			}
		</div>
	</div>

}