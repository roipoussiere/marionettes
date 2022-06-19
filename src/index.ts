import { BodyPosture } from './body_posture'


const body_posture = new BodyPosture('three')
body_posture.init()
let animate = () => body_posture.animate(animate)
animate()
