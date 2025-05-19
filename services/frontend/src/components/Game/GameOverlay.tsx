import Babact from 'babact';
import { usePong } from '../../contexts/usePong';
import { PongState } from 'pong';
import Button from '../../ui/Button';
import Scores from './Scores';
import Timer from './Timer';
import WinnerRoundOverlay from './WinnerRoundOverlay';
import WinnerMatchOverlay from './WinnerMatchOverlay';
import WaitingPlayerOverlay from './WaitingPlayerOverlay';
import PowerUpIcon from './PowerUpIcon';
import Card from '../../ui/Card';
import KeyHint from './KeyHint';

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

	const globalEvents = overlay.activeEvents.filter(e => e.isGlobal);

	return <div
		className='game-overlay flex '
	>
		<div className='flex items-center justify-center w-full'>
			<Scores />
		</div>
		{ overlay.spectatorCount > 0 && 
				<Card className="spectator-count flex flex-row gap-2">
					<i className="fa-solid fa-eye"></i> {overlay.spectatorCount}
				</Card>
		}
		<div
			className={`game-overlay-content flex flex-col gap-4 items-center justify-center ${displayBackground ? 'background' : ''}`}
		>
			{overlay.lastWinner !== null && <WinnerRoundOverlay />}
			{overlay.countDown > 0 && overlay.gameStatus.name !== PongState.RESERVED.name ? <Timer time={overlay.countDown}/> : ''}
			{overlay.gameStatus.name === PongState.RESERVED.name && !overlay.local && <WaitingPlayerOverlay />}
			{overlay.gameStatus.name === PongState.ENDED.name && <WinnerMatchOverlay key='match-overlay'/>}
			{
				overlay.local && overlay.gameStatus.name === PongState.RESERVED.name && overlay.spectatorCount === null &&
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
			{globalEvents.length > 0 &&
				<div className='game-overlay-powerups flex items-center justify-center gap-2'>
					{globalEvents.map((p) => <PowerUpIcon powerUp={p} key={p.type} />)}
				</div>
			}
			{ overlay.local && (overlay.gameStatus.name === PongState.RESERVED.name || overlay.local && overlay.gameStatus.name === PongState.PAUSED.name) && <div className='game-overlay-local-keyhint flex w-full align-center'>
				<KeyHint
					keybinds={[{
						keybind: 'W',
						description: 'Move Up'
					}, {
						keybind: 'S',
						description: 'Move Down'
					}]}
					title='Left Player'
					team={0}
				/>
				<KeyHint
					keybinds={[{
						keybind: 'ArrowUp',
						icon: <i className="fa-solid fa-arrow-up"></i>,
						description: 'Move Up'
					}, {
						keybind: 'ArrowDown',
						icon: <i className="fa-solid fa-arrow-down"></i>,
						description: 'Move Down'
					}]}
					title='Right Player'
					team={1}
				/>
			</div>}
		</div>
	</div>

}