import Babact from "babact";
import './online.css'
import ModeButton from "./ModeButton";
import { useLobby } from "../../contexts/useLobby";
import { Form } from "../../contexts/useForm";
import Input from "../../ui/Input";
import Submit from "../../ui/Submit";

export default function SelectModeOverlay({
		isOpen,
		onClose,
	}) {

	const {create, join} = useLobby();

	const onSelect = (mode) => {
		create(mode);
		onClose();
	};


	return <div className={`online-select-overlay flex flex-col items-center justify-center ${isOpen ? 'open' : ''}`}>
		<div className='online-select-overlay-content flex flex-col'>
			<div className='mode-buttons flex gap-4'>
			<ModeButton mode='ranked_1v1' image='https://cdn-0001.qstv.on.epicgames.com/ISfvNqRrgZJYiukxUk/image/landscape_comp.jpeg' onSelect={onSelect} />
			<ModeButton mode='ranked_2v2' image='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNTKPQNODV6msbJoT0UQtvOLOO1ANGjZdJuA&s' onSelect={onSelect} />
			<ModeButton mode='unranked_1v1' image='https://cdn-0001.qstv.on.epicgames.com/ISfvNqRrgZJYiukxUk/image/landscape_comp.jpeg' onSelect={onSelect} />
			<ModeButton mode='unranked_2v2' image='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNTKPQNODV6msbJoT0UQtvOLOO1ANGjZdJuA&s' onSelect={onSelect} />
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