import Babact from "babact";
import { useForm } from "../contexts/useForm";

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
		...props
	}: {
		label: string,
		field: string,
		images: Image[],
		onChange: (value: string) => void,
		required?: boolean,
		onImageRemove?: (url: string) => void,
		[key: string]: any
	}) {

	const { updateField, updateFieldValidity, fields } = useForm();

	const handleFileChange = (e: any) => {
		const file = e.target.files[0];
		const reader = new FileReader();
		reader.onload = (e: any) => onChange(e);
		reader.readAsDataURL(file);
	}

	const handleImageClick = (url: string) => {
		updateField(field, url);
		updateFieldValidity(field, true);
	}

	return <div className='image-selector' {...props}>
		<label>
			{label}
			{required && <span>*</span>}
		</label>
		<div className='image-selector-container'>
			{
				images.map((image: Image, i: number) => (
					<div className='image-selector-item'>
						<img
							src={image.url} alt={`image-${i}`}
							className={fields[field].value === image.url ? 'selected' : ''}
							onClick={() => handleImageClick(image.url)}
						/>
						{image.isRemovable && <i className="fa-solid fa-trash" onClick={() => onImageRemove(image.url)}/>}
					</div>
				))
			}
			<label>
				<input type="file" onChange={handleFileChange} accept='image/*' />
				<i className="fa-solid fa-plus"></i>
			</label>
		</div>
	</div>
}