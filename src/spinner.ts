const SPINNER_REL_SIZE = 0.3
const CLASS_NAME_SPINNER = 'marionettes-spinner'

const SPINNER_CSS = `
.${ CLASS_NAME_SPINNER } {
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
}
`

export class Spinner {
	relative_size: number
	css: string

	dom: HTMLElement

	constructor(relative_size = 0.3, custom_css = '') {
		this.relative_size = relative_size
		this.css = SPINNER_CSS + custom_css

		this.dom = document.createElement('div')
	}

	init(canvas_size: THREE.Vector2, canvas_position: THREE.Vector2) {
		const style = document.createElement('style');
		style.innerText = this.css
		this.dom.appendChild(style);

		const base_size = Math.min(canvas_size.width, canvas_size.height)
		const spinner_size = Math.round(SPINNER_REL_SIZE * base_size)
		const left = Math.round(canvas_position.x + canvas_size.width  / 2 - spinner_size / 2)
		const top  = Math.round(canvas_position.y + canvas_size.height / 2 - spinner_size / 2)

		this.dom.classList.add(CLASS_NAME_SPINNER)
		this.dom.style.cssText = `
			width: ${ spinner_size }px;
			height: ${ spinner_size }px;
			left: ${ left }px;
			top: ${ top }px;
		`;
	}

	enable() {
		this.dom.style.visibility = 'visible'
	}

	disable() {
		this.dom.style.visibility = 'hidden'
	}
}
