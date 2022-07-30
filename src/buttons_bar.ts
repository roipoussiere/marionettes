import * as THREE from 'three'


type ButtonAction = (button: Button) => void


const CLASS_NAME_BUTTONS_BAR = 'marionettes-buttons-bar'
const CLASS_NAME_BUTTON = 'marionettes-button'
const CLASS_NAME_BUTTON_ACTIVATED = 'is-activated'

const DEFAULT_CSS = `
.${ CLASS_NAME_BUTTON } {
	position: absolute;
	padding: 0px;
	border: none;
	color: #0004;
	background-color: #4441;
	text-align: center;
	vertical-align: middle;
	font-weight: bold;
}
.${ CLASS_NAME_BUTTON }.${ CLASS_NAME_BUTTON_ACTIVATED } {
	background-color: #0002;
}
.${ CLASS_NAME_BUTTON }:hover {
	background-color: #0003;
	cursor: pointer;
}
`


export class ButtonsBar {
	relative_size: number
	css: string

	dom: HTMLElement
	buttons: Button[]

	constructor(relative_size = 0.05, custom_css = '') {
		this.relative_size = relative_size
		this.css = DEFAULT_CSS + custom_css

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
		this.dom.classList.add(CLASS_NAME_BUTTONS_BAR)

		const style = document.createElement('style');
		style.innerText = this.css
		this.dom.appendChild(style)

		this.buttons.forEach(button => {
            button.init()
			this.dom.appendChild(button.dom)
		})
    }

	updateGeometry(canvas_size: THREE.Vector2, canvas_pos: THREE.Vector2) {
		const base_size = Math.max(canvas_size.width, canvas_size.height)
		const btn_size = Math.round(this.relative_size * base_size)

		this.buttons.forEach((button, index) => {
			const btn_position = new THREE.Vector2(
				canvas_pos.x,
				canvas_pos.y + canvas_size.height - (this.buttons.length - index) * btn_size
			)
			button.updateGeometry(btn_size, btn_position)
		})
	}

	triggerActionsOnEnabled() {
		this.buttons.forEach(button => {
			if (button.is_checkbox && button.is_enabled) {
				button.is_enabled = false
				button.trigger()
			}
		})
	}
}

export class Button {
	name: string
	is_checkbox: boolean
	action: ButtonAction
	shortcut: string
	is_enabled: boolean
	icon: string
	tooltip: string

	dom: HTMLElement


	constructor(name: string, is_checkbox: boolean, action: ButtonAction, shortcut = '', is_enabled = false, icon = '', tooltip = '') {
		this.name = name
		this.is_checkbox = is_checkbox
		this.action = action
		this.shortcut = shortcut
		this.is_enabled = is_enabled
		this.icon = icon ? icon : capitalize(this.name.substring(0, 2))
		this.tooltip = (tooltip ? tooltip : capitalize(this.name)) + (shortcut ? ` (${ shortcut })` : '')

		this.dom = document.createElement('button')
	}

	init() {
        this.dom.classList.add(CLASS_NAME_BUTTON)
        this.dom.innerHTML = this.icon
        this.dom.title = this.tooltip
        this.dom.addEventListener('click', () => {
			this.trigger()
		})
		document.addEventListener('keydown', event  => {
			if (event.code == 'Key' + this.shortcut) {
				this.trigger()
			}
		})
		if (this.is_checkbox && this.is_enabled) {
			this.dom.classList.add(CLASS_NAME_BUTTON_ACTIVATED)
		}
    }

	enable() {
		this.is_enabled = true
		this.dom.classList.add(CLASS_NAME_BUTTON_ACTIVATED)
	}

	disable() {
		this.is_enabled = false
		this.dom.classList.remove(CLASS_NAME_BUTTON_ACTIVATED)
	}

	trigger() {
		if (this.is_checkbox) {
			this.is_enabled = ! this.is_enabled
		}
		if (this.is_enabled) {
			this.enable()
		} else {
			this.disable()
		}
		this.action(this)
	}

	updateGeometry(button_size: number, button_pos: THREE.Vector2) {
		this.dom.style.cssText = `
			width: ${ button_size }px;
			height: ${ button_size }px;
			left: ${ button_pos.x }px;
			top: ${ button_pos.y }px;
			font-size: ${ Math.round(0.618 * button_size) }px;
		`
	}
}

function capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1)
}
