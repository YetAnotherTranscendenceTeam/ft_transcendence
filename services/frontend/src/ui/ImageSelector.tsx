import Babact from "babact";
import { useForm } from "../contexts/useForm";
import useToast, { ToastType } from "../hooks/useToast";
import WebcamModal from "./WebcamModal";
import Spinner from "./Spinner";
import PopHover from "./PopHover";
import AvatarDeletionModal from "./AvatarDeletionModal";

export type Image = {
	url: string,
	isRemovable: Boolean
}

export default function ImageSelector({
		label,
		field,
		images,
		onChange,
		required,
		onImageRemove,
		defaultValue,
		webcam = false,
		limit,
		help,
		tooltip,
		...props
	}: {
		label: string,
		field: string,
		images: Image[],
		onChange?: (value: string) => void,
		required?: boolean,
		onImageRemove?: (url: string) => Promise<any>,
		defaultValue?: string,
		webcam?: boolean,
		limit?: number,
		help?: string,
		tooltip?: string,
		[key: string]: any
	}) {

	const { createToast } = useToast();

	const { updateField, updateFieldValidity, fields } = useForm();

	const [webcamModalOpen, setWebcamModalOpen] = Babact.useState<boolean>(false);
	const [deleteImage, setDeleteImage] = Babact.useState<string>(null);

	const handleFileChange = (e: any) => {
		const file = e.target.files[0];
		const reader = new FileReader();
		reader.onload = (e: any) => {
			if (e.target.result.length > 5 * 1024 * 1024) {
				createToast('File too large', ToastType.DANGER, 7000);
				return;
			}
			onChange(e)
		};
		reader.readAsDataURL(file);
		e.target.value = '';
	}

	const handleImageClick = (url: string) => {
		updateField(field, url);
		updateFieldValidity(field, true);
	}

	const [inDeletion, setInDeletion] = Babact.useState<string>(null);

	const handleImageRemove = async (url: string) => {
		setInDeletion(url);
		await onImageRemove(url);
		setInDeletion(null);
	};

	Babact.useEffect(() => {
		if (defaultValue)
			updateField(field, defaultValue);
	}, []);

	return <div className='image-selector' {...props}>
		{label &&
			<div className='flex gap-2'>
				<label>
					{label}
					{props.required && <span>*</span>}
				</label>
				{tooltip && <PopHover
					content={tooltip}
				>
					<i className="fa-solid fa-circle-info"></i>
				</PopHover>}
			</div>
		}
		{help && <p className='input-help'>
			{help}
		</p>}
		<div className='image-selector-container scrollbar'>
			{ (images.filter(i => i.isRemovable).length < limit || !limit) &&  <label
				key='file'
			>
				<input type="file" onChange={handleFileChange} accept='image/*' />
				<i className="fa-solid fa-plus"></i>
			</label>}
			{ (images.filter(i => i.isRemovable).length < limit || !limit) && webcam && <label
				key='webcam'
				onClick={() => setWebcamModalOpen(true)}
			>
				<i className="fa-solid fa-camera" ></i>
			</label>}
			{
				images.map((image: Image, i: number) => (
					<div className={`image-selector-item ${inDeletion === image.url ? 'loading' : ''}`} key={image.url}>
						<img
							src={image.url} alt={`image-${i}`}
							className={fields[field].value === image.url ? 'selected' : ''}
							onClick={() => handleImageClick(image.url)}
						/>
						{image.isRemovable && !inDeletion && <i className="fa-solid fa-trash" onClick={() => setDeleteImage(image.url)}/>}
						<Spinner />
					</div>
				))
			}
		</div>
		<WebcamModal
			isOpen={webcamModalOpen}
			onClose={() => setWebcamModalOpen(false)}
			onCapture={onChange}
		/>
		<AvatarDeletionModal
			isOpen={deleteImage !== null}
			onClose={() => setDeleteImage(null)}
			onDelete={async () => {
				await handleImageRemove(deleteImage);
				setDeleteImage(null);
			}}
			imageUrl={deleteImage}
		/>
	</div>
}