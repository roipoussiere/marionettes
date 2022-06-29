import * as THREE from 'three'
import { bones_config, BONES_NAME_PREFIX } from './bones_config'


const TAU = Math.PI * 2.0
const BASE = 60 // must be a multiple of 2
const BASE60 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz01234567'


export class SkeletonSerializer {

	discretized_bones_rot: { [id: string] : THREE.Vector3 }

	constructor() {
		this.discretized_bones_rot = {}
		bones_config.forEach(bone_config => {
			this.discretized_bones_rot[bone_config.name] = new THREE.Vector3().addScalar(BASE / 2)
		})
	}

	skeletonToString(): string {
		let str = ''
		bones_config.forEach(bone_config => {
			const rotation = this.discretized_bones_rot[bone_config.name]
			str += this.boneRotationToString(rotation, bone_config.axes)
		})

		return str
	}

	boneRotationToString(rotation: THREE.Vector3, axes: string): string {
		let str = ''

		if (axes[0] != '_') {
			str += this.#valueToStr(rotation.x)
		}
		if (axes[1] != '_') {
			str += this.#valueToStr(rotation.y)
		}
		if (axes[2] != '_') {
			str += this.#valueToStr(rotation.z)
		}
		return str
	}

	#valueToStr(value: number): string {
		return BASE60.charAt(value)
	}

	discretizeVector(rotation: THREE.Vector3, range: number = BASE) {
		rotation
			.multiplyScalar(range)
			.divideScalar(TAU)
			.addScalar(range / 2)
			.round()
	}

	continuousVector(rotation: THREE.Vector3, range: number = BASE) {
		rotation
			.subScalar(range / 2)
			.multiplyScalar(TAU)
			.divideScalar(range)
	}

	getRoundedBoneRotation(bone: THREE.Bone): THREE.Euler {
		const bone_name = bone.name.substring(BONES_NAME_PREFIX.length)
		const rotation = new THREE.Vector3().setFromEuler(bone.rotation)

		this.discretizeVector(rotation)
		this.discretized_bones_rot[bone_name].copy(rotation)
		this.continuousVector(rotation)

		return new THREE.Euler().setFromVector3(rotation)
	}
}