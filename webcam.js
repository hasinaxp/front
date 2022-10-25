export default function Webcam() {
	let ctx;
	const video = document.createElement('video');
	let available = false;
	video.setAttribute('autoplay', true);
	let view = {
		tag: 'canvas',
		classes: 'webcam',
		attributes: {
			willReadFrequently: true
		},
		listeners: {
			init: (ui) => {
				 	navigator.getUserMedia({ video: true, audio: false }, (stream) => {
					video.srcObject = stream;
					available = true;
					ui.update();
				}, (e) => { console.log(e) });
			},
			afterRender: (ui) => {
				const canvas = ui.elem;
				canvas.width = 640;
				canvas.height = Math.floor(canvas.width * 3 / 4);

				if (available) {
					ctx = canvas.getContext('2d', { willReadFrequently: true });

					function captureLoop() {
						ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
						requestAnimationFrame(captureLoop);
						let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
						ctx.clearRect(0, 0, canvas.width, canvas.height);

						const colors = [
							[1, 0, 0],
							[1, 1, 0],
							[0, 1, 0],
							[0, 1, 1],
						];
						let dw = Math.floor(canvas.width / colors.length)
						for (let y = 0; y < canvas.height; y++)
							for (let x = 0; x < canvas.width; x++) {
								let ind = (y * canvas.width + x) * 4;
								let r = imageData.data[ind];
								let g = imageData.data[ind + 1];
								let b = imageData.data[ind + 2];

								let grey = Math.floor((r * 0.3 + g * .59 + b * .11));

								let currentColor = colors[Math.floor(x / dw)]
								imageData.data[ind] = grey * currentColor[0];
								imageData.data[ind + 1] = grey * currentColor[1];
								imageData.data[ind + 2] = grey * currentColor[2];
							}


						ctx.putImageData(imageData, 0, 0);

					}
					captureLoop()
				}
			}
		}
	}
	return view;
}