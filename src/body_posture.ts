import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'


export class BodyPosture {
	canvas: HTMLCanvasElement
	model_path: string
	model_ext: string
	scene: THREE.Scene
	camera: THREE.Camera
	renderer: THREE.WebGLRenderer
	control: OrbitControls
	loader: GLTFLoader | FBXLoader

	constructor(canvas_id: string, model_path: string) {
		this.canvas = <HTMLCanvasElement> document.getElementById(canvas_id)
		this.model_path = model_path
		this.model_ext = <string> this.model_path.split('.').pop()

		this.scene = new THREE.Scene()

		const window_aspect = window.innerWidth / window.innerHeight
		this.camera = new THREE.PerspectiveCamera(50, window_aspect)
		this.camera.position.set(5, 2, 0)

		this.renderer = new THREE.WebGLRenderer({
			canvas: this.canvas,
			antialias: true
		})
		this.renderer.setSize(this.canvas.width, this.canvas.height)
		this.renderer.shadowMap.enabled = true;

		this.control = new OrbitControls(this.camera, this.renderer.domElement)

		if (this.model_ext === 'fbx') {
			this.loader = new FBXLoader()
		} else if (this.model_ext === 'glb' || this.model_ext === 'gltf') {
			this.loader = new GLTFLoader()
		} else {
			throw 'bad model extension: ' + this.model_ext
		}
	}

	init() {
		this.addGrid()
		this.addFloor()
		this.addLights()
		this.addModel()
	}

	addModel() {
		let callback: CallableFunction = (model: THREE.Group, scale: number) => {
			this.onModelLoaded(model, scale)
		}

		if (this.model_ext === 'fbx') {
			this.loadFbxModel(this.model_path, callback)
		} else {
			this.loadGltfModel(this.model_path, callback)
		}
	}

	loadFbxModel(model_path: string, callback: CallableFunction) {
		this.loader = <FBXLoader> this.loader
		this.loader.load(
			model_path,
			model => callback(model, 0.01),
			xhr => console.log((xhr.loaded / xhr.total) * 100 + '% loaded'),
			error => console.log(error)
		)
	}

	loadGltfModel(model_path: string, callback: CallableFunction) {
		this.loader = <GLTFLoader> this.loader
		this.loader.load(
			model_path,
			gltf => callback(gltf.scene, 1),
			xhr => console.log((xhr.loaded / xhr.total) * 100 + '% loaded'),
			error => console.log(error)
		)
	}

	onModelLoaded(model: THREE.Group, scale: number) {
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
