import * as THREE from 'three'


type OnButtonClick = (button: Button) => void


const BUTTONS_BAR_CLASS = 'marionettes-buttons-bar'
const BUTTONS_CLASS = 'marionettes-button'
const BUTTONS_REL_SIZE = 0.05
const BUTTONS_CSS = `
.marionettes-button {
	position: absolute;
	padding: 0px;
	border: none;
	color: #0004;
	background-color: transparent;
	text-align: center;
	vertical-align: middle;
	font-weight: bold;
}
.marionettes-button:hover {
	background-color: #0002;
	cursor: pointer;
}
.marionettes-button.is_activated {
	background-color: #0003;
}
`


export class ButtonsBar {
    dom: HTMLElement
	buttons: Button[]

	constructor() {
		this.dom = document.createElement('div')
		this.buttons = []
	}

	getButton(button_name: string): Button {
        const button = this.buttons.find(button => button.name == button_name)
		if (button) {
			return button 
		} else {
            throw ReferenceError(`Can not find button with name '${ button_name }'.`)
        }
	}

    init() {
		this.dom.classList.add(BUTTONS_BAR_CLASS)

		const style = document.createElement('style');
		style.innerText = BUTTONS_CSS
		this.dom.appendChild(style)

		this.buttons.forEach(button => {
            button.init()
            this.dom.appendChild(button.dom)
		})
    }

	updateGeometry(canvas_size: THREE.Vector2, canvas_pos: THREE.Vector2) {
		const btn_size = Math.round(BUTTONS_REL_SIZE * Math.max(canvas_size.width, canvas_size.height))

		this.buttons.forEach((button, index) => {
			const btn_position = new THREE.Vector2(
				canvas_pos.x,
				canvas_pos.y + canvas_size.height - (this.buttons.length - index) * btn_size
			)
			button.updateGeometry(btn_size, btn_position)
		})
	}

}

export class Button {
	name: string
	on_click: OnButtonClick
	icon: string
	shortcut: string
	tooltip: string

	dom: HTMLElement

	constructor(name: string, on_click: OnButtonClick, icon = '', shortcut = '', tooltip = '') {
		this.name = name
		this.on_click = on_click
		this.icon = icon ? icon : capitalize(this.name.substring(0, 2))
		this.shortcut = shortcut
		this.tooltip = (tooltip ? tooltip : capitalize(this.name)) + (shortcut ? `(${ shortcut })` : '')
		this.dom = document.createElement('button')
	}

	init() {
        this.dom.classList.add(BUTTONS_CLASS)
        this.dom.innerHTML = this.icon
        this.dom.title = this.tooltip
        this.dom.addEventListener('click', () => {
			this.on_click(this)
		})
    }

	updateGeometry(button_size: number, button_pos: THREE.Vector2) {
		this.dom.style.cssText = `
			width: ${ button_size }px;
			height: ${ button_size }px;
			left: ${ button_pos.x }px;
			top: ${ button_pos.y }px;
			font-size: ${ Math.round(0.5 * button_size) }px;
		`
	}
}

function capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1)
}
