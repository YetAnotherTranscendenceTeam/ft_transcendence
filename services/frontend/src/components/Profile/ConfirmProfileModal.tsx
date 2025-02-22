import Babact from "babact";
import Modal from "../../ui/Modal";
import { FormProvider } from "../../contexts/useForm";
import Input from "../../ui/Input";
import './profile.css';
import ImageSelector from "../../ui/ImageSelector";

export default function ConfirmProfileModal({ isOpen, onClose, ...props}) {

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

	const handleFileChange = (e) => {
		const newImages = [...images];
		newImages.push({url: e.target.result, isRemovable: true});
		console.log(e.target.result);
		setImages(newImages);
	}

	return <Modal className="confirm-profile-modal gap-4" isOpen={isOpen} onClose={onClose} {...props}>
		<h1>Your profile needs a few more details...</h1>
		<FormProvider formFields={['profile-username*', 'profile-picture*']}>
			<Input field='profile-username' label='Username' required/>

			<ImageSelector label='Profile Picture' images={images} onChange={handleFileChange} field="profile-picture" required/>
			{/* <div className='profile-picture flex flex-col gap-1'>
				<label htmlFor="profile-picture">Profile picture</label>
				<div className='confirm-profile-pictures'>
					{
						images.map((image, i) => <img
							src={image} alt={`profile-${i}`}
							onClick={() => setSelectedImage(i)}
							className={selectedImage === i ? 'selected' : ''}
						/>)
					}
					<label id="profile-picture">
						<input type="file" id="profile-picture" name="profile-picture" onChange={handleFileChange} />
						<i className="fa-solid fa-plus"></i>
					</label>
				</div>
			</div> */}
		</FormProvider>
	</Modal>

}