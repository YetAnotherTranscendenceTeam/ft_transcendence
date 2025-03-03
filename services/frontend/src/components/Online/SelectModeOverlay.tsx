import Babact from "babact";
import './online.css'
import ModeButton from "./ModeButton";

export default function SelectModeOverlay({
		isOpen,
		onClose,
		onSelect
	}) {

	return <div className={`online-select-overlay flex items-center justify-center ${isOpen ? 'open' : ''}`}>
		<div className='online-select-overlay-content flex flex-col'>
			<h1>Select a game mode</h1>
			<div className='mode-buttons flex gap-4'>
				<ModeButton mode='classic' selected={true} image='https://cdn-0001.qstv.on.epicgames.com/ISfvNqRrgZJYiukxUk/image/landscape_comp.jpeg' onSelect={onSelect} />
				<ModeButton mode='speed' selected={false} image='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNTKPQNODV6msbJoT0UQtvOLOO1ANGjZdJuA&s' onSelect={onSelect} />
			</div>
		</div>
	</div>	
}