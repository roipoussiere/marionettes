import * as THREE from 'three'
import { Main } from './main'
import { Marionette } from './marionette'
import { ModelLoader } from './model_loader'
import { Theater } from './theater'


const DEFAULT_POSE_BASE  = 'QeeeeeeeeeeeeeeeeeNeeeeeeNeeeeeeeeesRdeeefeeetreeeeceeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeAeA0A'
const DEFAULT_POSE_FLYER = 'teAeeeeeeeeeWeeXeeeeeeeeeeeeeeeeeeePPeeeeeeeePteeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeedPe3WE'

const MODEL_PATH = './xbot.fbx'
// const MODEL_PATH = './ybot.fbx'
// const MODEL_PATH = './mannequin.fbx'

const base = new Marionette('base')
const flyer = new Marionette('flyer')

const model_loader = new ModelLoader(MODEL_PATH, model => {
	console.log('Loaded model:', model)

	const params = new URLSearchParams(window.location.search.substring(1))
	
	base .loadFromString(params.get('base' ) || DEFAULT_POSE_BASE)
	flyer.loadFromString(params.get('flyer') || DEFAULT_POSE_FLYER)
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
