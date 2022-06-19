import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'


export class BodyPosture {
	canvas: HTMLCanvasElement
	scene: THREE.Scene
	camera: THREE.Camera
	renderer: THREE.WebGLRenderer
	control: OrbitControls
	fbxLoader: FBXLoader

	constructor(canvas_id: string) {
		this.canvas = <HTMLCanvasElement> document.getElementById(canvas_id)
		this.scene = new THREE.Scene()
		this.camera = new THREE.PerspectiveCamera(75, 1, 0.5, 20)
		this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas })
		this.control = new OrbitControls(this.camera, this.renderer.domElement)
		this.fbxLoader = new FBXLoader()
	}

	init() {
		this.camera.position.y = 2
		this.camera.position.z = 3
		this.renderer.setSize(600, 450)

		// this.scene.add(THREE.SkeletonHelper( skinnedMesh ));
		this.addFbx('./xbot-light.fbx')
		this.addGrid()
		this.addFloor()
		this.addLights()
	}

	addFbx(model_path: string) {
		this.fbxLoader.load(
			model_path,
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
	}

	addGrid() {
		let grid = new THREE.GridHelper( 4, 20 )
		grid.position.y = 0.01
		this.scene.add(grid)
	}

	addFloor() {
		let floorGeometry = new THREE.PlaneGeometry(5000, 5000, 1, 1);
		let floorMaterial = new THREE.MeshPhongMaterial({
			color: 0xeeeeee,
			shininess: 0
		});

		let floor = new THREE.Mesh(floorGeometry, floorMaterial);
		floor.rotation.x = -0.5 * Math.PI;
		floor.receiveShadow = true;
		floor.position.y = 0;
		this.scene.add(floor);
	}

	addLights() {
		const light = new THREE.PointLight()
		light.position.set(0.8, 1.4, 1.0)
		this.scene.add(light)

		const ambientLight = new THREE.AmbientLight()
		this.scene.add(ambientLight)
	}

	animate(callback: FrameRequestCallback) {
		requestAnimationFrame(callback)	
		this.render()	
	}

	render() {
		this.renderer.render(this.scene, this.camera)
	}
}
