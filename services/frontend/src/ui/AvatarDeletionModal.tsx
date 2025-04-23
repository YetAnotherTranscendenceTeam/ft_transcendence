import Babact from "babact";
import Modal from "./Modal";
import Button from "./Button";
import useEscape from "../hooks/useEscape";

export default function AvatarDeletionModal({
		isOpen,
		onClose,
		onDelete,
		imageUrl,
	}: {
		isOpen: boolean;
		onClose: () => void;
		onDelete: () => void;
		imageUrl: string;
		[key: string]: any;
	}) {

	useEscape(isOpen, onClose);

	return <Modal
		isOpen={isOpen}
		onClose={onClose}
		className="avatar-deletion-modal flex flex-col items-center gap-4"
		closeButton={true}
	>
		<h1>Avatar deletion</h1>
		<p>Are you sure you want to delete this avatar ?</p>
		<img src={imageUrl}/>
		<div className="flex justify-end gap-2 w-full">
			<Button
				className="danger"
				onClick={onDelete}
			>
				Delete <i className="fa-solid fa-trash-can"></i>
			</Button>
		</div>

	</Modal>
}