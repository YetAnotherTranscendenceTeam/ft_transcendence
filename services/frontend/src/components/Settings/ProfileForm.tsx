import Babact from "babact";
import SettingsSection from "./SettingsSection";
import { Form } from "../../contexts/useForm";
import Input from "../../ui/Input";
import Submit from "../../ui/Submit";
import ImageSelector from "../../ui/ImageSelector";

export default function ProfileForm({ me }: { me: any }) {

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
		{ url: 'https://i.pravatar.cc/150?img=10', isRemovable: false },
		{ url: 'https://i.pravatar.cc/150?img=11', isRemovable: false },
		{ url: 'https://i.pravatar.cc/150?img=12', isRemovable: false },
		{ url: 'https://i.pravatar.cc/150?img=13', isRemovable: false },
		{ url: 'https://i.pravatar.cc/150?img=14', isRemovable: false },
		{ url: 'https://i.pravatar.cc/150?img=15', isRemovable: false },
		{ url: 'https://i.pravatar.cc/150?img=16', isRemovable: false },
		{ url: 'https://i.pravatar.cc/150?img=17', isRemovable: false },
		{ url: 'https://i.pravatar.cc/150?img=18', isRemovable: false },
		{ url: 'https://i.pravatar.cc/150?img=19', isRemovable: false },
	]);

	if (!me)
		return null;
	return <SettingsSection name='Profile'>
		<Form formFields={['profile-username', 'profile-avatar']} className='gap-8'>
			<Input field="profile-username" label='Edit your username' type='email' defaultValue={me.username} placeholder={me.username}/>
			<ImageSelector field="profile-avatar" label='Edit your avatar' defaultValue={me.avatar} images={images} />


			<div className='flex gap-4 justify-end'>
				<Submit fields={['profile-username', 'profile-avatar']}>
					Save
					<i className="fa-regular fa-floppy-disk"></i>
				</Submit>
			</div>
		</Form>
	</SettingsSection>
}