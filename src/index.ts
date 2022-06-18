import { BodyPosture } from './body_posture'


const body_posture = new BodyPosture('three')
let animate = () => body_posture.animate(animate)
animate()
