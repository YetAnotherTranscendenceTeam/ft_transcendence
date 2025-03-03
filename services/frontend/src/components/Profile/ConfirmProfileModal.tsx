import Babact from "babact";
import Modal from "../../ui/Modal";
import { Form } from "../../contexts/useForm";
import Input from "../../ui/Input";
import './profile.css';
import ImageSelector from "../../ui/ImageSelector";
import Submit from "../../ui/Submit";
import useFetch from "../../hooks/useFetch";
import config from "../../config";
import { useAuth } from "../../contexts/useAuth";
import Button from "../../ui/Button";
import useAvatars from "../../hooks/useAvatars";

export default function ConfirmProfileModal({ ...props}) {

	const { refresh, me, logout } = useAuth();

	const { avatars, uploadAvatar, deleteAvatar } = useAvatars();

	const { ft_fetch , isLoading } = useFetch();



	const handleSubmit = async (fields) => {
		const response = await ft_fetch(`${config.API_URL}/settings/profile`, {
			method: 'PATCH',
			body: JSON.stringify({
				username: fields['profile-username'],
				avatar: fields['profile-picture']
			})
		}, {
			show_error: true,	
		});
		if (response)
			refresh();
	}

	if (me)
	return <Modal className="confirm-profile-modal gap-4 left" isOpen={true} onClose={()=>{}} {...props} closeOnBackgroundClick={false}>
		<h1>Almost There...</h1>
		<Form formFields={['profile-username*', 'profile-picture*']}>
			<Input
				field='profile-username'
				label='Username'
				required
				defaultValue={me.username}
			/>

			<ImageSelector
				label='Profile Picture'
				images={avatars}
				onChange={(e: any) => uploadAvatar(e.target.result)}
				field="profile-picture"
				required
				onImageRemove={deleteAvatar}
				defaultValue={me.avatar}
			/>

			<div className="confirm-profile-modal-footer flex justify-end gap-2">
				<Button className="danger" onClick={() => logout()}>
					Logout <i className="fa-solid fa-arrow-right-from-bracket"></i>
				</Button>
				<Submit fields={['profile-username', 'profile-picture']} onSubmit={handleSubmit} loading={isLoading}>
					Confirm <i className="fa-solid fa-user-check"></i>
				</Submit>
			</div>
		</Form>
	</Modal>

}