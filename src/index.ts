import { BodyManager } from './manager'


// const body_posture = new BodyManager('./xbot-light.fbx')
const body_posture = new BodyManager('./xbot-three.glb')
body_posture.addScene('cv1')
body_posture.init()
let animate = () => body_posture.animate(animate)
animate()
