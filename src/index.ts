import * as THREE from 'three'
import { Main } from './main'
import { Marionette } from './marionette'
import { ModelLoader } from './model_loader'
import { Theater } from './theater'

const DEFAULT_POSE_BASE  = 'QeeeeeeeeeeeeeeeePeeeceePeeebeeeeeneReeeheeeogredeeeeeeeeeeeeeeeeeeeeeebbeeeeeeeeeeeeeeeeeeeAeA0A'
const DEFAULT_POSE_FLYER = 'teAeeeeeeaedYeXeeeeeeneeeeeeneeeeehnTeeeeeeeoRqeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeedPe3WE'

const MODEL_PATH = './xbot.fbx'
// const MODEL_PATH = './ybot.fbx'
// const MODEL_PATH = './mannequin.fbx'

const BONES_PREFIX = 'mixamorig'
// const BONES_PREFIX = 'mixamorig1'

const params = new URLSearchParams(window.location.search.substring(1))
const base  = new Marionette('base' , params.get('base' ) || DEFAULT_POSE_BASE)
const flyer = new Marionette('flyer', params.get('flyer') || DEFAULT_POSE_FLYER)

const model_loader = new ModelLoader(MODEL_PATH, model => {
	model.scale.setScalar(0.01)

	model.children.find(child => child instanceof THREE.Bone)?.traverse(bone => {
		bone.name = bone.name.substring(BONES_PREFIX.length)
	})

	console.log('Loaded model:', model)
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
	} else if (event.code == 'KeyF') {
		theater.fullscreen = ! theater.fullscreen
	} else if (event.code == 'KeyC') {
		theater.resetPose()
	}
})

document.addEventListener('keyup', () => {
	theater.axe_modifier_id = 0
})
