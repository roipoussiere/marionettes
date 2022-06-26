import { Main } from './main'
import { Marionette } from './marionette'
import { ModelLoader } from './model_loader'
import { Theater } from './theater'


const model_loader = new ModelLoader('./xbot-light.fbx')
// const model_loader = new ModelLoader('./xbot-three.glb')

const base = new Marionette('base')
const theater = new Theater('cv1', base)
const main = new Main(model_loader, [ theater ])

main.init()
let animate = () => main.animate(animate)
animate()
