import Babact from "babact";
import Accordion from "../../ui/Accordion";
import SegmentedControl from "../../ui/SegmentedControl";
import { LobbyClient } from "../../contexts/useLobby";
import { GameMode, GameModeType } from "yatt-lobbies";

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

	const currentGameMode = lobby.mode.name.slice(-3);

	return <Accordion
		openButton='Settings'
	>
		<div className='lobby-settings flex flex-col gap-2'>
			<div
				className='flex gap-2 items-center justify-between'
			>
				<p>Team size</p>
				<SegmentedControl
					buttons={modes}
					onChange={(value) => {
						handleModeChange(value);
					}}
					value={currentGameMode}
				/>
			</div>
		</div>
	</Accordion>
}