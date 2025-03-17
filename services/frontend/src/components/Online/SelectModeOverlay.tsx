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
import { GameMode } from "yatt-lobbies";

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

	return <div
		className={`online-select-overlay flex flex-col items-center justify-center ${isOpen ? 'open' : ''}`}
		onClick={(e) => e.target === e.currentTarget && onClose()}
	>
		<Button onClick={onClose} className='close icon ghost'><i className="fa-solid fa-xmark"></i></Button>
		<div className='online-select-overlay-content flex flex-col'>
			<div className='mode-buttons flex flex-col'>
				<div className='flex flex-row gap-4'>
					{
						gamemodes.filter((mode) => mode.team_size === 1).map((mode, i) => (
							<ModeButton gamemode={mode} onSelect={onSelect} />))
					}
				</div>
				<div className='flex flex-row gap-4'>
					{
						gamemodes.filter((mode) => mode.team_size === 2).map((mode, i) => (
							<ModeButton gamemode={mode} onSelect={onSelect} />))
					}
				</div>
			</div>
		</div>
		<Form className="online-join-form flex flex-row" formFields={['lobby-code*']}>
			<Input placeholder='Enter a code to join a lobby' field="lobby-code"/>
			<Submit
				fields={['lobby-code']}
				onSubmit={(fields, clearFields) => {
					join(fields['lobby-code'].value);
					clearFields();
					onClose();
				}}
			>
				<i className="fa-solid fa-arrow-right-to-bracket"></i> Join
			</Submit>
		</Form>
	</div>
}