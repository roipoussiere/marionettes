import { BodyPosture } from './body_posture'


const body_posture = new BodyPosture('three', './xbot-three.glb')
// const body_posture = new BodyPosture('three', './xbot-light.fbx')
body_posture.init()
let animate = () => body_posture.animate(animate)
animate()
