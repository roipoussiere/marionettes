import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { Theater, SPINNER_CLASS } from './theater'


export class Puppeteer {
	model_path: string
	model_ext: string
	loader: GLTFLoader | FBXLoader
	theaters: Array<Theater>

	constructor(model_path: string) {
		this.#addStyle()
		this.model_path = model_path
		this.theaters = []
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
		this.#addStyle()
		this.#addModel()
		// this.#addGrid()
		// this.#addFloor()
		this.#addLights()
	}

	addScene(canvas_id: string) {
		this.theaters.push(new Theater(canvas_id))
	}

    animate(callback: FrameRequestCallback) {
		requestAnimationFrame(callback)	
		this.theaters.forEach(theater => theater.render())
	}

	#addToAllScenes(object: THREE.Object3D) {
		this.theaters.forEach(theater => theater.addObject(object))
	}

	#addStyle() {
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

	#addModel() {
		let callback: CallableFunction = (model: THREE.Group, scale: number) => {
			this.#onModelLoaded(model, scale)
		}

		if (this.model_ext === 'fbx') {
			this.#loadFbxModel(this.model_path, callback)
		} else {
			this.#loadGltfModel(this.model_path, callback)
		}
	}

	#loadFbxModel(model_path: string, callback: CallableFunction) {
		this.loader = <FBXLoader> this.loader
		this.loader.load(
			model_path,
			model => callback(model, 0.01),
			xhr => console.log((xhr.loaded / xhr.total) * 100 + '% loaded'),
			error => console.error(error)
		)
	}

	#loadGltfModel(model_path: string, callback: CallableFunction) {
		this.loader = <GLTFLoader> this.loader
		this.loader.load(
			model_path,
			gltf => callback(gltf.scene, 1),
			xhr => console.log((xhr.loaded / xhr.total) * 100 + '% loaded'),
			error => console.error(error)
		)
	}

	#onModelLoaded(model: THREE.Group, scale: number) {
		model.scale.set(scale, scale, scale)
		model.name = 'model'
		this.#addToAllScenes(model)

		Array.from(document.getElementsByClassName(SPINNER_CLASS)).forEach(spinner => {
			spinner.remove()
		})
		this.theaters.forEach(theater => theater.init())
		// this.scene.add(new THREE.SkeletonHelper( model ));
	}

	#addGrid() {
		let grid = new THREE.GridHelper( 4, 20 )
		grid.name = 'grid'
		grid.position.y = 0.01
		this.#addToAllScenes(grid)
	}

	#addFloor() {
		let floorGeometry = new THREE.PlaneGeometry(5000, 5000, 1, 1);
		let floorMaterial = new THREE.MeshPhongMaterial({
			color: 0xeeeeee,
			shininess: 0
		});

		let floor = new THREE.Mesh(floorGeometry, floorMaterial);
		floor.name = 'floor'
		floor.rotation.x = -0.5 * Math.PI;
		floor.receiveShadow = true;
		floor.position.y = 0;
		this.#addToAllScenes(floor)
	}
		
	#addLights() {
		const ambientLight = new THREE.AmbientLight(new THREE.Color(0xffffff), 0.5)
		this.#addToAllScenes(ambientLight)

		const light = new THREE.PointLight(new THREE.Color(0xffffff), 0.5)
		light.position.set(10, 10, 0)
		this.#addToAllScenes(light)
	}
}
