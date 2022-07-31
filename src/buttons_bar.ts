import * as THREE from 'three'


type ButtonAction = (button: Button) => void


const SVG_NAMESPACE = 'http://www.w3.org/2000/svg'
const CLASS_NAME_BUTTONS_BAR = 'marionettes-buttons-bar'
const CLASS_NAME_BUTTON = 'marionettes-button'
const CLASS_NAME_BUTTON_ACTIVATED = 'is-activated'

const clean_str = (str: string) => str.replace(new RegExp('[\n\t]', 'g'), ' ')

const DEFAULT_CSS = clean_str(`
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
`)

const ICON_CSS = clean_str(`
fill: none;
stroke: #222;
stroke-linecap: round;
stroke-linejoin: round;
stroke-width: 30px;
`)

export class ButtonsBar {
	relative_size: number
	icons_file: string
	css: string

	dom: HTMLElement
	icons_svg: HTMLElement
	buttons: Button[]

	constructor(relative_size = 0.05, icons_file = '', custom_css = '') {
		this.relative_size = relative_size
		this.icons_file = icons_file
		this.css = DEFAULT_CSS + custom_css

		this.dom = document.createElement('div')
		this.icons_svg = document.createElement('svg')
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

		if (this.icons_file) {
			fetch(this.icons_file)
			.then(response => response.text())
			.then(svg => {
				this.icons_svg.innerHTML = svg
				this.buttons.forEach(button => {
					const icon_path = <HTMLElement> this.icons_svg.querySelector('#' + button.icon_id)
					button.icon_path = <string> icon_path.getAttribute('d')
				})
				this.#initButtons()
			})
		} else {
			this.#initButtons()
		}
	}

	redraw(canvas_size: THREE.Vector2, canvas_pos: THREE.Vector2) {
		const base_size = Math.max(canvas_size.width, canvas_size.height)
		const btn_size = Math.round(this.relative_size * base_size)
		const visible_buttons = this.buttons.filter(button => button.is_visible)

		visible_buttons.forEach((button, index) => {
			const btn_position = new THREE.Vector2(
				canvas_pos.x,
				canvas_pos.y + canvas_size.height - (visible_buttons.length - index) * btn_size
			)
			button.redraw(btn_size, btn_position)
		})

		this.buttons.filter(button => ! button.is_visible).forEach(button => {
			button.dom.style.cssText = 'display: none'
		})
	}

	#initButtons() {
		this.buttons.forEach(button => {
			button.init()
			this.dom.appendChild(button.dom)
		})
	}
}

export class Button {
	name: string
	is_checkbox: boolean
	action: ButtonAction
	icon_id: string
	shortcut: string
	is_enabled: boolean
	is_visible: boolean
	tooltip: string

	dom: HTMLElement
	icon_path: string
	icon_text: string

	constructor(name: string, is_checkbox: boolean, action: ButtonAction, icon_id = '', shortcut = '', is_enabled = false, is_visible = true, tooltip = '') {
		this.name = name
		this.is_checkbox = is_checkbox
		this.action = action
		this.icon_id = icon_id
		this.shortcut = shortcut
		this.is_enabled = is_enabled
		this.is_visible = is_visible
		this.icon_text = capitalize(this.name.substring(0, 2))
		this.tooltip = (tooltip ? tooltip : capitalize(this.name)) + (shortcut ? ` (${ shortcut })` : '')

		this.dom = document.createElement('button')
		this.icon_path = ''
	}

	init(): Button {
		this.dom.classList.add(CLASS_NAME_BUTTON)
		if (this.icon_id) {
			const path = document.createElementNS(SVG_NAMESPACE, 'path')
			path.setAttribute('d', this.icon_path)

			const group = document.createElementNS(SVG_NAMESPACE, 'g')
			group.style.cssText = ICON_CSS
			group.appendChild(path)

			const svg = document.createElementNS(SVG_NAMESPACE, 'svg')
			svg.setAttribute('viewBox', '0 0 512 512')
			svg.appendChild(group)

			this.dom.appendChild(svg)
		} else {
			this.dom.innerText = this.icon_text
		}
		this.dom.title = this.tooltip

		this.dom.addEventListener('click', () => {
			this.switch()
			this.trigger()
		})

		document.addEventListener('keydown', event  => {
			if (event.code == 'Key' + this.shortcut) {
				this.switch()
				this.trigger()
			}
		})

		if (this.is_checkbox && this.is_enabled) {
			this.dom.classList.add(CLASS_NAME_BUTTON_ACTIVATED)
		}

		return this
	}

	enable(): Button {
		this.is_enabled = true
		this.dom.classList.add(CLASS_NAME_BUTTON_ACTIVATED)
		return this
	}

	disable(): Button {
		this.is_enabled = false
		this.dom.classList.remove(CLASS_NAME_BUTTON_ACTIVATED)
		return this
	}

	trigger(): Button {
		this.action(this)
		return this
	}

	switch(): Button {
		if (this.is_checkbox) {
			this.is_enabled = ! this.is_enabled

			if (this.is_enabled) {
				this.enable()
			} else {
				this.disable()
			}
		}

		return this
	}

	redraw(button_size: number, button_pos: THREE.Vector2): Button {
		this.dom.style.cssText = clean_str(`
			width: ${ button_size }px;
			height: ${ button_size }px;
			left: ${ button_pos.x }px;
			top: ${ button_pos.y }px;
			font-size: ${ Math.round(0.618 * button_size) }px;
		`)
		return this
	}
}

function capitalize(text: string): string {
	return text.charAt(0).toUpperCase() + text.slice(1)
}
