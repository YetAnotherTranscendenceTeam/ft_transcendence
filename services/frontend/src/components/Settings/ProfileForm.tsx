import Babact from "babact";
import SettingsSection from "./SettingsSection";
import { Form } from "../../contexts/useForm";
import Input from "../../ui/Input";
import Submit from "../../ui/Submit";
import ImageSelector from "../../ui/ImageSelector";
import useAvatars from "../../hooks/useAvatars";

export default function ProfileForm({ me }: { me: any }) {

	const { avatars, uploadAvatar, deleteAvatar } = useAvatars();

	if (!me)
		return null;
	return <SettingsSection name='Profile'>
		<Form formFields={['profile-username', 'profile-avatar']} className='gap-8'>
			<Input field="profile-username" label='Edit your username' type='email' defaultValue={me.username} placeholder={me.username}/>
			<ImageSelector
				field="profile-avatar"
				label='Edit your avatar'
				defaultValue={me.avatar}
				images={avatars}
				onChange={(e: any) => uploadAvatar(e.target.result)}
				onImageRemove={deleteAvatar}
			/>


			<div className='flex gap-4 justify-end'>
				<Submit fields={['profile-username', 'profile-avatar']}>
					Save
					<i className="fa-regular fa-floppy-disk"></i>
				</Submit>
			</div>
		</Form>
	</SettingsSection>
}