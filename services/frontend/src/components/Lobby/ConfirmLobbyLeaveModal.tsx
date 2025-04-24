import Babact from "babact";
import Modal from "../../ui/Modal";
import { LobbyClient } from "../../contexts/useLobby";
import Button from "../../ui/Button";

export default function ConfirmLobbyLeaveModal({
		isOpen,
		onClose,
		onConfirm,
		lobby
	}: {
		isOpen: boolean;
		onClose: () => void;
		onConfirm: () => void;
		lobby: LobbyClient;
		[key: string]: any;
	}) {

	return <Modal
		isOpen={isOpen}
		onClose={() => onClose()}
		className="lobby-leave-modal flex flex-col gap-4"
	>
		<h1>
			Are you sure you want to leave the lobby?
		</h1>
		<div
			className="flex gap-4 justify-between items-center"
		>
			<Button
				onClick={() => onClose()}
			>
				Cancel
			</Button>
			<Button
				className="danger"
				onClick={() => {
					lobby.leave();
					onConfirm();
					onClose();
				}}
			>
				<i className="fa-solid fa-person-walking-arrow-right"></i> Leave
			</Button>
		</div>

	</Modal>
}