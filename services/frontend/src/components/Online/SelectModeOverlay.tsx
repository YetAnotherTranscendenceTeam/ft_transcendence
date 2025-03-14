import Babact from "babact";
import './online.css'
import ModeButton from "./ModeButton";
import { useLobby } from "../../contexts/useLobby";
import { Form } from "../../contexts/useForm";
import Input from "../../ui/Input";
import Submit from "../../ui/Submit";
import useEscape from "../../hooks/useEscape";

export default function SelectModeOverlay({
		isOpen,
		onClose,
	}) {

	const {create, join, lobby, changeMode } = useLobby();


	const onSelect = (mode) => {
		if (lobby)
			changeMode(mode);
		else
			create(mode);
		onClose();
	};

	useEscape(isOpen, onClose);


	return <div className={`online-select-overlay flex flex-col items-center justify-center ${isOpen ? 'open' : ''}`}>
		<div className='online-select-overlay-content flex flex-col'>
			<div className='mode-buttons flex flex-col'>
				<div className='flex flex-row gap-4'>
					<ModeButton mode='ranked_1v1' onSelect={onSelect} />
					<ModeButton mode='unranked_1v1' onSelect={onSelect} />
					<ModeButton mode='tournament_1v1' onSelect={onSelect} />
				</div>
				<div className='flex flex-row gap-4'>
					<ModeButton mode='ranked_2v2' onSelect={onSelect} />
					<ModeButton mode='unranked_2v2' onSelect={onSelect} />
					<ModeButton mode='tournament_2v2' onSelect={onSelect} />
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