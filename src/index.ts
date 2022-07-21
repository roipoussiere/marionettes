import { Main } from './main'
import { Marionette } from './marionette'
import { ModelLoader } from './model_loader'
import { Theater } from './theater'


const base = new Marionette('base')
const flyer = new Marionette('flyer')

// const model_loader = new ModelLoader('./mannequin.fbx', () => {
// const model_loader = new ModelLoader('./xbot-light.fbx', () => {
// const model_loader = new ModelLoader('./xbot.fbx', () => {
// const model_loader = new ModelLoader('./ybot.fbx', () => {
const model_loader = new ModelLoader('./xbot-light.fbx', () => {
	const string_url = window.location.search.substring(1)
	const params = new URLSearchParams(string_url).entries()

	base .loadFromString('QeeeeeeeeeeeeeeeeeNeeeeeeNeeeeeeeeesRdeeefeeetreeeeceeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeAeA0A')
	flyer.loadFromString('teAeeeeeeeeeWeeXeeeeeeeeeeeeeeeeeeePPeeeeeeeePteeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeedPe3WE')
	for(const [param_key, param_value] of params) {
		if(param_key in theater.marionettes) {
			theater.marionettes[param_key].loadFromString(param_value)
		}
	}
})

const theater = new Theater('cv1', [ base, flyer ], marionette => {
	let new_url = window.location.pathname + '?' + theater.getPoseAsUrlString()
	window.history.pushState({}, '', new_url)
})
const main = new Main(model_loader, [ theater ])

main.init()
let animate = () => main.animate(animate)
animate()

document.addEventListener('keydown', event  => {
	if (event.ctrlKey) {
		theater.axe_modifier_id = 1
	} else if (event.shiftKey) {
		theater.axe_modifier_id = 2
	} else if (event.code == 'KeyH') {
		theater.handles_visibility = ! theater.handles_visibility
	} else if (event.code == 'KeyR') {
		theater.rotate_mode = ! theater.rotate_mode
	} else if (event.code == 'KeyT') {
		theater.translate_mode = ! theater.translate_mode
	}
})

document.addEventListener('keyup', () => {
	theater.axe_modifier_id = 0
})
