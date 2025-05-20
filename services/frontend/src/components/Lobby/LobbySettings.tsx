import Babact from "babact";
import Accordion from "../../ui/Accordion";
import SegmentedControl from "../../ui/SegmentedControl";
import { LobbyClient } from "../../contexts/useLobby";
import { GameMode, GameModeType, PongEventType } from "yatt-lobbies";
import Switch from "../../ui/Switch";
import Range from "../../ui/Range";
import { Form } from "../../contexts/useForm";
import Checkbox from "../../ui/Checkbox";

export default function LobbySettings({
	lobby,
}: {
	lobby: LobbyClient
}) {

	const handleModeChange = (value: string) => {
		lobby.changeMode(lobby.mode.name.slice(0, -3) + value);
	}

	const modes = [
		{
			label: '1v1',
			value: '1v1',
			disabled: lobby.mode.type === GameModeType.CUSTOM && lobby.players.length > 2
		}, {
			label: '2v2',
			value: '2v2',
			disabled: lobby.mode.type === GameModeType.CUSTOM && lobby.players.length > 4
		},
	]

	const ballSpeed = [
		{
			label: 'x0.75',
			value: '0.75',
		},
		{
			label: 'x1.0',
			value: '1',
		},
		{
			label: 'x1.25',
			value: '1.25',
		},
	]

	const currentGameMode = lobby.mode.name.slice(-3);

	const [pointToWin, setPointToWin] = Babact.useState(lobby.match_parameters.point_to_win);
	const [ballSpeedValue, setBallSpeedValue] = Babact.useState(lobby.match_parameters.ball_speed.toString());
	const [obstacles, setObstacles] = Babact.useState(lobby.match_parameters.obstacles);
	const [powerUps, setPowerUps] = Babact.useState<PongEventType[]>(lobby.match_parameters.events);

	const handlePowerUpChange = (name: string, value: InputEvent) => {
		const checked = (value.target as HTMLInputElement).checked;
		const powerupType = () => {
			switch (name) {
				case 'multiball':
					return PongEventType.MULTIBALL;
				case 'attractor':
					return PongEventType.ATTRACTOR;
				case 'ice':
					return PongEventType.ICE;
				case 'small-paddle':
					return PongEventType.SMALLPADDLE;
				default:
					return null;
			}
		}
		if (powerupType() !== null) {
			if (checked) {
				setPowerUps([...powerUps, powerupType()]);
			} else {
				setPowerUps([...powerUps.filter((powerup) => powerup !== powerupType())]);
			}
		}
	}

	const handleLobbyParametersChange = () => {
		lobby.changeParameters({
			point_to_win: pointToWin,
			ball_speed: parseFloat(ballSpeedValue),
			obstacles: obstacles,
			events: powerUps,
		})
	}
	
	Babact.useEffect(() => {
		handleLobbyParametersChange();
	}, [pointToWin, ballSpeedValue, obstacles, powerUps]);
	
	return <Accordion
		openButton='Settings'
	>
		<div className='lobby-settings flex flex-col gap-2 scrollbar'>
			<div
				className='lobby-settings-row flex gap-2 items-center justify-between'
			>
				<p className='flex-2'>Team format</p>
				<SegmentedControl
					className='flex-1'
					buttons={modes}
					onChange={(value) => {
						handleModeChange(value);
					}}
					value={currentGameMode}
				/>
			</div>
			<div className='lobby-settings-row flex gap-2 items-center justify-between'>
				<p className='flex-1'>Obstacles</p>
				<Switch
					value={obstacles}
					onChange={(value) => {
						setObstacles(value);
					}}
				/>
			</div>
			<div className='lobby-settings-row flex gap-2 items-center justify-between'>
				<p className='flex-1'>Ball speed</p>
				<SegmentedControl
					className='flex-1'
					buttons={ballSpeed}
					onChange={(value) => {
						setBallSpeedValue(value);
					}}
					value={ballSpeedValue}
				/>
			</div>
			<div className='lobby-settings-row flex gap-2 items-center justify-between'>
				<div className='flex-1 flex justify-between flex-1 items-center gap-2'>
					<p className=''>Point to win</p>
					<p>{pointToWin}</p>
				</div>
					<Range
						className='flex-1'
						value={pointToWin}
						onChange={(value) => {
							setPointToWin(value);
						}}
						min={2}
						max={10}
						step={1}
					/>
			</div>
			<div className='lobby-settings-row lobby-settings-row-powerup flex flex-col gap-2 justify-between'>
				<p className='flex-1 flex items-center'>Power ups</p>
				<Form
					className="flex"
					formFields={['multiball', 'attractor', 'ice', 'small-paddle']}
				>
					<Checkbox
						value={powerUps.includes(PongEventType.MULTIBALL)}
						label="Multiball"
						field="multiball"
						onChange={(e) => handlePowerUpChange('multiball', e)}
					/>
					<Checkbox
						value={powerUps.includes(PongEventType.ATTRACTOR)}
						label="Attractor"
						field="attractor"
						onChange={(e) => handlePowerUpChange('attractor', e)}
					/>
					<Checkbox
						value={powerUps.includes(PongEventType.ICE)}
						label="Ice"
						field="ice"
						onChange={(e) => handlePowerUpChange('ice', e)}
					/>
				</Form>
			</div>
		</div>
	</Accordion>
}