import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'


export class BodyPosture {
	canvas: HTMLCanvasElement
	scene: THREE.Scene
	camera: THREE.Camera
	renderer: THREE.WebGLRenderer
	control: OrbitControls
	fbxLoader: FBXLoader
	gltfLoader: GLTFLoader

	constructor(canvas_id: string) {
		const window_aspect = window.innerWidth / window.innerHeight

		this.canvas = <HTMLCanvasElement> document.getElementById(canvas_id)
		this.scene = new THREE.Scene()

		this.camera = new THREE.PerspectiveCamera(50, window_aspect)
		this.camera.position.set(5, 2, 0)

		this.renderer = new THREE.WebGLRenderer({
			canvas: this.canvas,
			antialias: true
		})
		this.renderer.setSize(600, 450)
		this.renderer.shadowMap.enabled = true;

		this.control = new OrbitControls(this.camera, this.renderer.domElement)
		this.fbxLoader = new FBXLoader()
		this.gltfLoader = new GLTFLoader()
	}

	init() {
		this.addGrid()
		this.addFloor()
		this.addLights()
		// this.loadFbxModel('./xbot-light.fbx',
		this.loadGltfModel('./xbot-three.glb',
			(model: THREE.Group, scale: number) => this.addModel(model, scale))
	}

	loadFbxModel(model_path: string, callback: CallableFunction) {
		this.fbxLoader.load(
			model_path,
			model => callback(model, 0.1),
			xhr => console.log((xhr.loaded / xhr.total) * 100 + '% loaded'),
			error => console.log(error)
		)
	}

	loadGltfModel(model_path: string, callback: CallableFunction) {
		this.gltfLoader.load(
			model_path,
			gltf => callback(gltf.scene, 1),
			xhr => console.log((xhr.loaded / xhr.total) * 100 + '% loaded'),
			error => console.log(error)
		)
	}

	addModel(model: THREE.Group, scale: number) {
		model.traverse(function (child) {
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
		model.scale.set(scale, scale, scale)
		this.scene.add(model)
		// this.scene.add(new THREE.SkeletonHelper( model ));
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
		const ambientLight = new THREE.AmbientLight(new THREE.Color(0xffffff), 0.5)
		this.scene.add(ambientLight)

		const light = new THREE.PointLight(new THREE.Color(0xffffff), 0.5)
		light.position.set(10, 10, 0)
		this.scene.add(light)
	}

	animate(callback: FrameRequestCallback) {
		requestAnimationFrame(callback)	
		this.render()	
	}

	render() {
		this.renderer.render(this.scene, this.camera)
	}
}
