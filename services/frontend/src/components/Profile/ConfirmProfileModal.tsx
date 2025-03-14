import Babact from "babact";
import Modal from "../../ui/Modal";
import { Form } from "../../contexts/useForm";
import Input from "../../ui/Input";
import './profile.css';
import ImageSelector from "../../ui/ImageSelector";
import Submit from "../../ui/Submit";
import { useAuth } from "../../contexts/useAuth";
import Button from "../../ui/Button";
import useAvatars from "../../hooks/useAvatars";
import useProfile from "../../hooks/useProfile";

export default function ConfirmProfileModal({ ...props}) {

	const { me, logout } = useAuth();

	const { avatars, uploadAvatar, deleteAvatar } = useAvatars();

	const { setSettings, isLoading } = useProfile();

	const handleSubmit = async (fields) => {
		setSettings({
			username: fields['profile-username'].value,
			avatar: fields['profile-avatar'].value
		});
	}

	if (me)
	return <Modal
		className="confirm-profile-modal gap-4 left"
		isOpen={true}
		{...props}
		closeOnBackgroundClick={false}
	>
		<h1>Almost There...</h1>
		<Form formFields={['profile-username*', 'profile-avatar*']}>
			<Input
				field='profile-username'
				label='Username'
				required
				maxlength={15}
				defaultValue={me.username}
			/>

			<ImageSelector
				label='Profile Picture'
				images={avatars}
				onChange={(e: any) => uploadAvatar(e.target.result)}
				field="profile-avatar"
				required
				onImageRemove={deleteAvatar}
				defaultValue={me.avatar}
			/>

			<div className="confirm-profile-modal-footer flex justify-end gap-2">
				<Button className="danger" onClick={() => logout()}>
					Logout <i className="fa-solid fa-arrow-right-from-bracket"></i>
				</Button>
				<Submit fields={['profile-username', 'profile-avatar']} onSubmit={handleSubmit} loading={isLoading}>
					Confirm <i className="fa-solid fa-user-check"></i>
				</Submit>
			</div>
		</Form>
	</Modal>

}