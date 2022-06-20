import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'


const SPINNER_CLASS = 'body-posture-spinner'

export class BodyScene {
	canvas: HTMLCanvasElement
	renderer: THREE.WebGLRenderer
	camera: THREE.Camera
	scene: THREE.Scene
	control: OrbitControls

	constructor(canvas_id: string) {
		this.canvas = <HTMLCanvasElement> document.getElementById(canvas_id)
		this.addSpinner()

		this.renderer = new THREE.WebGLRenderer({
			canvas: this.canvas,
			antialias: true
		})
		this.renderer.setSize(this.canvas.width, this.canvas.height)
		this.renderer.shadowMap.enabled = true;

		const window_aspect = window.innerWidth / window.innerHeight
		this.camera = new THREE.PerspectiveCamera(50, window_aspect)
		this.camera.position.set(5, 2, 0)

		this.scene = new THREE.Scene()

		this.control = new OrbitControls(this.camera, this.renderer.domElement)
	}

	addSpinner() {
		const canvasBRect = this.canvas.getBoundingClientRect();
		const size = Math.round(0.3 * Math.min(canvasBRect.width, canvasBRect.height))
		const left = Math.round(canvasBRect.left + canvasBRect.width  / 2 - size / 2)
		const right = Math.round(canvasBRect.top  + canvasBRect.height / 2 - size / 2)

		const spinner = document.createElement('div');
		spinner.classList.add(SPINNER_CLASS)
		spinner.style.cssText = `width: ${ size }px; height: ${ size  }px;`
		                      + `left: ${  left }px; top: ${    right }px;`;
		document.body.appendChild(spinner);
	}

	addObject(object: THREE.Object3D) {
		this.scene.add(object)
	}

	render() {
		this.renderer.render(this.scene, this.camera)
	}
}

export class BodyManager {
	model_path: string
	model_ext: string
	loader: GLTFLoader | FBXLoader
	scenes: { [key: string]: BodyScene }

	constructor(model_path: string) {
		this.addStyle()
		this.model_path = model_path
		this.scenes = {}
		this.model_ext = <string> this.model_path.split('.').pop()

		if (this.model_ext === 'fbx') {
			this.loader = new FBXLoader()
		} else if (this.model_ext === 'glb' || this.model_ext === 'gltf') {
			this.loader = new GLTFLoader()
		} else {
			throw 'bad model extension: ' + this.model_ext
		}
	}

	init() {
		this.addStyle()
		this.addGrid()
		this.addFloor()
		this.addLights()
		this.addModel()
	}

	addScene(canvas_id: string) {
		this.scenes[canvas_id] = new BodyScene(canvas_id)
		return this.scenes[canvas_id]
	}

	addToAllScenes(object: THREE.Object3D) {
		Object.values(this.scenes).forEach(scene => {
			scene.addObject(object)
		});
	}

	addStyle() {
		var style = document.createElement('style');
		style.innerHTML = `
.${SPINNER_CLASS} {
	position: absolute;
	display: inline-block;
	border: 10px solid #aaa;
	border-top: 10px solid #3498db;
	border-radius: 50%;
	animation: spin 2s linear infinite;
}
@keyframes spin {
	0% { transform: rotate(0deg); }
	100% { transform: rotate(360deg); }
}
		`;
		document.body.appendChild(style);
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

		this.addToAllScenes(model)

		Array.from(document.getElementsByClassName(SPINNER_CLASS)).forEach(spinner => {
			spinner.remove()
		})
		// this.scene.add(new THREE.SkeletonHelper( model ));
	}

	addGrid() {
		let grid = new THREE.GridHelper( 4, 20 )
		grid.position.y = 0.01
		this.addToAllScenes(grid)
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
		this.addToAllScenes(floor)
	}

	addLights() {
		const ambientLight = new THREE.AmbientLight(new THREE.Color(0xffffff), 0.5)
		this.addToAllScenes(ambientLight)

		const light = new THREE.PointLight(new THREE.Color(0xffffff), 0.5)
		light.position.set(10, 10, 0)
		this.addToAllScenes(light)
	}

	animate(callback: FrameRequestCallback) {
		requestAnimationFrame(callback)	
		Object.values(this.scenes).forEach(scene => {
			scene.render()
		})
	}
}
