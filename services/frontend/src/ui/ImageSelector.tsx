import Babact from "babact";
import { useForm } from "../contexts/useForm";
import useToast, { ToastType } from "../hooks/useToast";
import WebcamModal from "./WebcamModal";
import Spinner from "./Spinner";

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
		[key: string]: any
	}) {

	const { createToast } = useToast();

	const { updateField, updateFieldValidity, fields } = useForm();

	const [webcamModalOpen, setWebcamModalOpen] = Babact.useState<boolean>(false);

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
		<label>
			{label}
			{required && <span>*</span>}
		</label>
		<div className='image-selector-container scrollbar'>
			<label
				key='file'
			>
				<input type="file" onChange={handleFileChange} accept='image/*' />
				<i className="fa-solid fa-plus"></i>
			</label>
			{webcam && <label
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
						{image.isRemovable && !inDeletion && <i className="fa-solid fa-trash" onClick={() => handleImageRemove(image.url)}/>}
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
	</div>
}