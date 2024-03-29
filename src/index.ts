import * as THREE from 'three'
import { Main } from './main'
import { Marionette } from './marionette'
import { ModelLoader } from './model_loader'
import { Theater } from './theater'

const DEFAULT_POSE_BASE  = 'J0000000000000000K000300K000500000f0I0006000g4j010000000000000000000000550000000000000000000ZL00Z'
const DEFAULT_POSE_FLYER = 'l0Z000000701B0C000000f000000f000006fG0000000gIi000000000000000000000000000000000000000000000Z2U0Z'
const DEFAULT_CAM_POS = 'oqDHai320'

const MODEL_PATH = './xbot.fbx'
// const MODEL_PATH = './ybot.fbx'
// const MODEL_PATH = './mannequin.fbx'

const BONES_PREFIX = 'mixamorig'
// const BONES_PREFIX = 'mixamorig1'

const params = new URLSearchParams(window.location.search.substring(1))
const base  = new Marionette('base' , params.get('_base' ) || DEFAULT_POSE_BASE)
const flyer = new Marionette('flyer', params.get('_flyer') || DEFAULT_POSE_FLYER)
const cam_pos = params.get('cam') || DEFAULT_CAM_POS

const mat = new THREE.Mesh(
	new THREE.BoxGeometry(1, 0.03, 2),
	new THREE.MeshPhongMaterial({ color: 0xc399c8 })
)

const model_loader = new ModelLoader(MODEL_PATH, model => {
	model.scale.setScalar(0.01)

	model.children.find(child => child instanceof THREE.Bone)?.traverse(bone => {
		bone.name = bone.name.substring(BONES_PREFIX.length)
	})

	console.info('Loaded model:', model)
})

const theater = new Theater('cv1', [ base, flyer ], () => {
	const params: string[] = []

	params.push('cam=' + theater.camera_pos)
	Object.values(theater.marionettes).map(marionette => {
		params.push('_' + marionette.name + '=' + marionette.toString())
	})

	const new_url = window.location.pathname + '?' + params.join('&')
	window.history.pushState({}, '', new_url)
})
theater.camera_pos = cam_pos
theater.scene.add(mat)

const main = new Main(model_loader, [ theater ])
main.init()
const animate = () => main.animate(animate)
animate()

document.addEventListener('keydown', event  => {
	if (event.ctrlKey) {
		theater.axe_modifier_id = 1
	} else if (event.shiftKey) {
		theater.axe_modifier_id = 2
	}
})

document.addEventListener('keyup', () => {
	theater.axe_modifier_id = 0
})
