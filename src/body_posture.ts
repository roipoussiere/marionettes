import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'


export class BodyPosture {
	canvas: HTMLCanvasElement
	scene: THREE.Scene
	renderer: THREE.WebGLRenderer
	camera: THREE.Camera
	control: OrbitControls
	mesh: THREE.Mesh

	constructor(canvas_id: string) {
		this.canvas = <HTMLCanvasElement> document.getElementById(canvas_id)
		this.scene = new THREE.Scene()

		this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 10)
		this.camera.position.z = 2
	
		this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas })
		this.renderer.setSize(600, 450)
		
		this.control = new OrbitControls(this.camera, this.renderer.domElement)
		
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
