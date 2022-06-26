import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'


type ModelLoadedCallback = (model: THREE.Group) => void;


export class ModelLoader {
	model_path: string
	model_ext: string
	loader: GLTFLoader | FBXLoader

	constructor(model_path: string) {
		this.model_path = model_path
		this.model_ext = <string> this.model_path.split('.').pop()

		if (this.model_ext == 'fbx') {
			this.loader = new FBXLoader()
		} else if (this.model_ext == 'glb' || this.model_ext == 'gltf') {
			this.loader = new GLTFLoader()
		} else {
			throw 'bad model extension: ' + this.model_ext
		}
	}

	loadModel(on_model_loaded: ModelLoadedCallback) {
		if (this.model_ext == 'fbx') {
			this.#loadFbxModel(this.model_path, on_model_loaded)
		} else {
			this.#loadGltfModel(this.model_path, on_model_loaded)
		}
	}

	#loadFbxModel(model_path: string, callback: ModelLoadedCallback) {
		this.loader = <FBXLoader> this.loader
		this.loader.load(
			model_path,
			model => {
				model.scale.setScalar(0.01)
				callback(model)
			},
			xhr => console.log((xhr.loaded / xhr.total) * 100 + '% loaded'),
			error => console.error(error)
		)
	}

	#loadGltfModel(model_path: string, callback: ModelLoadedCallback) {
		this.loader = <GLTFLoader> this.loader
		this.loader.load(
			model_path,
			gltf => callback(gltf.scene),
			xhr => console.log((xhr.loaded / xhr.total) * 100 + '% loaded'),
			error => console.error(error)
		)
	}
}
