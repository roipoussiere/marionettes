import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'


type OnModelLoaded = (model: THREE.Group) => void;


export class ModelLoader {
	model_path: string
	model_ext: string
	loader: GLTFLoader | FBXLoader
	on_loaded: OnModelLoaded

	constructor(model_path: string, on_loaded: OnModelLoaded = () => {}) {
		this.model_path = model_path
		this.on_loaded = on_loaded

		this.model_ext = <string> this.model_path.split('.').pop()

		if (this.model_ext == 'fbx') {
			this.loader = new FBXLoader()
		} else if (this.model_ext == 'glb' || this.model_ext == 'gltf') {
			this.loader = new GLTFLoader()
		} else {
			throw 'bad model extension: ' + this.model_ext
		}
	}

	loadModel(on_loaded: OnModelLoaded) {
		if (this.model_ext == 'fbx') {
			this.#loadFbxModel(this.model_path, on_loaded)
		} else {
			this.#loadGltfModel(this.model_path, on_loaded)
		}
	}

	#loadFbxModel(model_path: string, on_loaded: OnModelLoaded) {
		this.loader = <FBXLoader> this.loader
		this.loader.load(
			model_path,
			model => {
				this.on_loaded(model)
				on_loaded(model)
			},
			xhr => console.log((xhr.loaded / xhr.total) * 100 + '% loaded'),
			error => console.error(error)
		)
	}

	#loadGltfModel(model_path: string, on_loaded: OnModelLoaded) {
		this.loader = <GLTFLoader> this.loader
		this.loader.load(
			model_path,
			gltf => {
				this.on_loaded(gltf.scene)
				on_loaded(gltf.scene)
			},
			xhr => console.log((xhr.loaded / xhr.total) * 100 + '% loaded'),
			error => console.error(error)
		)
	}
}
