import Babact from "babact";
import Modal from "./Modal";
import Button from "./Button";

export default function WebcamModal({
		isOpen,
		onClose,
		onCapture
	}: {
		isOpen: boolean,
		onClose: () => void,
		onCapture: (e) => void
	}) {
	
	const [error, setError] = Babact.useState(null);
	Babact.useEffect(() => {
		const video = document.getElementById('webcam') as HTMLVideoElement;

		if (!video) return;

		navigator.mediaDevices.getUserMedia({ video: true })
		.then(stream => {
			video.srcObject = stream;
			video.play();
		})
		.catch((error) => {
			console.error('Error accessing media devices.', error.message);
			setError(error.message);
		});

		return () => {
			const stream = video.srcObject as MediaStream;
			if (stream && stream.getTracks) {
				stream.getTracks().forEach((track) => track.stop());
			}
		};
	}, [isOpen]);

	const takePhoto = () => {
		const video = document.getElementById("webcam") as HTMLVideoElement;
		const canvas = document.createElement("canvas");
		const context = canvas.getContext("2d");

		if (video && context) {
			canvas.width = video.videoWidth;
			canvas.height = video.videoHeight;
			context.drawImage(video, 0, 0, canvas.width, canvas.height);
			const image = canvas.toDataURL("image/png");
			onCapture({target: { result: image}});
			onClose();
		}
	};


	return <Modal className="webcam-modal gap-4" isOpen={isOpen} onClose={onClose}>
		{error && <p className='error'><i className="fa-solid fa-circle-exclamation"></i> {error}</p>}
		<video id='webcam'/>
		<div className='flex justify-end gap-4'>
			<Button onClick={onClose}>Cancel</Button>
			<Button onClick={takePhoto} disabled={error} className="primary"><i className="fa-solid fa-camera"></i> Capture</Button>
		</div>
	</Modal>

}