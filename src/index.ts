import { Main } from './main'
import { Marionette } from './marionette'
import { ModelLoader } from './model_loader'
import { Theater } from './theater'


const base = new Marionette('base')
const flyer = new Marionette('flyer')

// const model_loader = new ModelLoader('./xbot-three.glb'), () => {
const model_loader = new ModelLoader('./xbot-light.fbx', () => {
	base.loadFromString('eeeeeejkeeheeeeheeOeeoeeeeeeeeeeeeeeeXeeeeeeeeeleeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeegPwXAW')
	flyer.loadFromString('eeeeeeeeeeeeeeeeeeeeeeeeeQeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeRP0iAx')
})

const theater = new Theater('cv1', [ base, flyer ], (marionette: Marionette) => {
	console.log(`${marionette.name}: ${marionette.serializer.skeletonToString()}`)
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
	} else if (event.code == 'KeyT') {
		theater.translate_mode = ! theater.translate_mode
	}
})

document.addEventListener('keyup', () => {
	theater.axe_modifier_id = 0
})
