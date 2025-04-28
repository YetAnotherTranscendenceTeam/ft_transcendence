import Babact from "babact";
import './online.css'
import ModeButton from "./ModeButton";
import { useLobby } from "../../contexts/useLobby";
import { Form } from "../../contexts/useForm";
import Input from "../../ui/Input";
import Submit from "../../ui/Submit";
import useEscape from "../../hooks/useEscape";
import Button from "../../ui/Button";
import useGamemodes from "../../hooks/useGamemodes";
import { GameMode, GameModeType } from "yatt-lobbies";
import SegmentedControl from "../../ui/SegmentedControl";
import Separator from "../../ui/Separator";

export default function SelectModeOverlay({
		isOpen,
		onClose,
	}) {

	const {create, join, lobby } = useLobby();


	const onSelect = (mode) => {
		if (lobby)
			lobby.changeMode(mode);
		else
			create(mode);
		onClose();
	};

	useEscape(isOpen, onClose);


	const gamemodes: GameMode[] = useGamemodes();
	
	if (!gamemodes) return <div>Loading...</div>;

	const [mode, setMode] = Babact.useState<string>('1v1');

	return <div
		className={`online-select-overlay flex flex-col items-center justify-center ${isOpen ? 'open' : ''}`}
		onClick={(e) => e.target === e.currentTarget && onClose()}
	>
		<Button onClick={onClose} className='close icon ghost'><i className="fa-solid fa-xmark"></i></Button>
		<div className='mode-buttons flex flex-col gap-4'>
			<div className='flex flex-col gap-4 items-center'>
				<SegmentedControl
					buttons={[
						{ label: '1v1', value: '1v1' },
						{ label: '2v2', value: '2v2' },
					]}
					onChange={(v) => {
						setMode(v);
					}}
					value={mode}
					className="w-fit"
				/>
				<div className='flex flex-row gap-4'>
					<ModeButton gamemode={gamemodes.find(g => g.name === ("ranked_" + mode))} onSelect={onSelect} />
					<ModeButton gamemode={gamemodes.find(g => g.name === ("unranked_" + mode))} onSelect={onSelect} />
				</div>
			</div>
			<Separator className='w-full' />
			<div className='flex flex-row gap-4'>
				<ModeButton gamemode={gamemodes.find(g => g.name === "custom_1v1")} onSelect={onSelect} />
				<ModeButton gamemode={gamemodes.find(g => g.name === "tournament_1v1")} onSelect={onSelect} />
			</div>
		</div>
		<Form className="online-join-form flex flex-row" formFields={['lobby-code*']}>
			<Input
				placeholder='Enter a code to join a lobby'
				field="lobby-code"
				name="lobby-code"
			/>
			<Submit
				fields={['lobby-code']}
				onSubmit={(fields, clearFields) => {
					join(fields['lobby-code'].value as string);
					clearFields();
					onClose();
				}}
			>
				<i className="fa-solid fa-arrow-right-to-bracket"></i> Join
			</Submit>
		</Form>
	</div>
}