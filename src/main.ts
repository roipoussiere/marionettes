import { Theater } from './theater'
import { ModelLoader } from './model_loader'


export class Main {

    model_loader: ModelLoader
	theaters: Theater[]

    constructor(model_loader: ModelLoader, theaters: Theater[]) {
        this.model_loader = model_loader
        this.theaters = theaters
    }

    init() {
		this.theaters.forEach(theater => {
			theater.init()
		})

		this.model_loader.loadModel(model => {
            this.theaters.forEach(theater => theater.onModelLoaded(model))
        })
    }

	animate(callback: FrameRequestCallback) {
		requestAnimationFrame(callback)
		this.theaters.forEach(theater => theater.render())
	}
}