import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'


export class BodyPosture {
	canvas: HTMLCanvasElement
	scene: THREE.Scene
	renderer: THREE.WebGLRenderer
	camera: THREE.Camera
	control: OrbitControls

	constructor(canvas_id: string) {
		this.canvas = <HTMLCanvasElement> document.getElementById(canvas_id)
		this.scene = new THREE.Scene()

		this.camera = new THREE.PerspectiveCamera(75, 1, 0.5, 20)
		this.camera.position.y = 2
		this.camera.position.z = 3
	
		this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas })
		this.renderer.setSize(600, 450)
		
		this.control = new OrbitControls(this.camera, this.renderer.domElement)

		const light = new THREE.PointLight()
		light.position.set(0.8, 1.4, 1.0)
		this.scene.add(light)

		const ambientLight = new THREE.AmbientLight()
		this.scene.add(ambientLight)

		this.scene.add(new THREE.GridHelper( 2, 10 ))

		const fbxLoader = new FBXLoader()
		fbxLoader.load(
			'./xbot-light.fbx',
			object => {
				object.traverse(function (child) {
					if (child.type == 'Bone') {
						child = <THREE.Bone> child
						child.rotateX(Math.random() * 0.3);
						child.rotateY(Math.random() * 0.3);
						child.rotateZ(Math.random() * 0.3);
						console.log('bone:', child.name)
					} else {
						console.log('other:', child)
					}
				})
				object.scale.set(.01, .01, .01)
				this.scene.add(object)
			},
			xhr => console.log((xhr.loaded / xhr.total) * 100 + '% loaded'),
			error => console.log(error)
		)
		// this.scene.add(THREE.SkeletonHelper( skinnedMesh ));

	}

	animate(callback: FrameRequestCallback) {
		requestAnimationFrame(callback)	
		this.render()	
	}

	render() {
		this.renderer.render(this.scene, this.camera)
	}
}
