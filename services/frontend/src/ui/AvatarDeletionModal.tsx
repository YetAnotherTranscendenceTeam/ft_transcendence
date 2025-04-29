import Babact from "babact";
import Modal from "./Modal";
import Button from "./Button";
import useEscape from "../hooks/useEscape";
import PopHover from "./PopHover";

export default function AvatarDeletionModal({
		isOpen,
		onClose,
		onDelete,
		imageUrl,
		ignore = [],
		ignoreMessage,
	}: {
		isOpen: boolean;
		onClose: () => void;
		onDelete: () => void;
		imageUrl: string;
		ignore?: string[];
		ignoreMessage?: string;
		[key: string]: any;
	}) {

	useEscape(isOpen, onClose);

	const ignoredImage = ignore.find((img) => img === imageUrl);

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
			<PopHover
				content={ignoredImage ? <p className='w-max'>{ignoreMessage}</p> : null}>

			<Button
				disabled={!!ignoredImage}
				className="danger"
				onClick={onDelete}
				>
				Delete <i className="fa-solid fa-trash-can"></i>
			</Button>
			</PopHover>
		</div>

	</Modal>
}