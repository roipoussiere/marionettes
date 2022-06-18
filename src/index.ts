import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'


export class BodyPosture {
	scene: THREE.Scene
	mesh: THREE.Mesh
	renderer: THREE.WebGLRenderer
	camera: THREE.PerspectiveCamera

	constructor() {
		this.scene = new THREE.Scene()

		this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 10)
		this.camera.position.z = 2
		
		const canvas1 = document.getElementById('tc1') as HTMLCanvasElement
		
		this.renderer = new THREE.WebGLRenderer({ canvas: canvas1 })
		this.renderer.setSize(600, 450)
		
		new OrbitControls(this.camera, this.renderer.domElement)
		
		const geometry = new THREE.BoxGeometry()
		const material = new THREE.MeshBasicMaterial({
			color: 0x00ff00,
			wireframe: true,
		})
		
		this.mesh = new THREE.Mesh(geometry, material)
		this.scene.add(this.mesh)
	}

	animate(callback: FrameRequestCallback) {
		requestAnimationFrame(callback)
		this.mesh.rotation.x += 0.01
		this.mesh.rotation.y += 0.01
	
		this.render()	
	}

	render() {
		this.renderer.render(this.scene, this.camera)
	}
}

const body_posture = new BodyPosture()
let animate = () => body_posture.animate(animate)
animate()
