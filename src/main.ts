import { Theater, SPINNER_CLASS } from './theater'
import { ModelLoader } from './model_loader'


export class Main {

    model_loader: ModelLoader
	theaters: Theater[]

    constructor(model_loader: ModelLoader, theaters: Theater[]) {
        this.model_loader = model_loader
        this.theaters = theaters
    }

    init() {
		this.#addStyle()
		this.theaters.forEach(theater => {
			theater.init()
		})
        this.model_loader.loadModel((model: THREE.Group) => {
            this.theaters.forEach(theater => {                
                theater.onModelLoaded(model)
            })
            Array.from(document.getElementsByClassName(SPINNER_CLASS)).forEach(spinner => {
                spinner.remove()
            })
        })
        
    }

    #addStyle() {
		var style = document.createElement('style');
		style.innerHTML = `
	.${SPINNER_CLASS} {
	position: absolute;
	display: inline-block;
	border: 10px solid #aaa;
	border-top: 10px solid #3498db;
	border-radius: 50%;
	animation: spin 2s linear infinite;
	}
	@keyframes spin {
	0% { transform: rotate(0deg); }
	100% { transform: rotate(360deg); }
	}
		`;
		document.body.appendChild(style);
	}

	animate(callback: FrameRequestCallback) {
		requestAnimationFrame(callback)
		this.theaters.forEach(theater => theater.render())
	}
}