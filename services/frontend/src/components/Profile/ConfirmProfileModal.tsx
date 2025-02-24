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

export default function ConfirmProfileModal({ ...props}) {

	const { refresh, me } = useAuth();

	const [images, setImages] = Babact.useState([
		{ url: 'https://i.pravatar.cc/150?img=1', isRemovable: false },
		{ url: 'https://i.pravatar.cc/150?img=2', isRemovable: false },
		{ url: 'https://i.pravatar.cc/150?img=3', isRemovable: false },
		{ url: 'https://i.pravatar.cc/150?img=4', isRemovable: false },
		{ url: 'https://i.pravatar.cc/150?img=5', isRemovable: false },
		{ url: 'https://i.pravatar.cc/150?img=6', isRemovable: false },
		{ url: 'https://i.pravatar.cc/150?img=7', isRemovable: false },
		{ url: 'https://i.pravatar.cc/150?img=8', isRemovable: false },
		{ url: 'https://i.pravatar.cc/150?img=9', isRemovable: false },
	]);

	const { ft_fetch , isLoading } = useFetch();

	const handleFileChange = (e) => {
		const newImages = [...images];
		newImages.push({url: e.target.result, isRemovable: true});
		console.log(e.target.result);
		setImages(newImages);
	}

	const handleImageRemove = (url) => {
		console.log(url);
		const newImages = images.filter(image => image.url !== url);
		setImages(newImages);
	}

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
				images={images}
				onChange={handleFileChange}
				field="profile-picture"
				required
				onImageRemove={handleImageRemove}
				defaultValue={me.avatar}
			/>

			<div className="confirm-profile-modal-footer flex justify-end">
				<Submit fields={['profile-username', 'profile-picture']} onSubmit={handleSubmit}>
					Confirm my profile <i className="fa-solid fa-user-check"></i>
				</Submit>
			</div>
		</Form>
	</Modal>

}