import * as THREE from 'three'
import { Euler, Vector3 } from 'three'
import { bones_config, BONES_NAME_PREFIX, MIN_POSITION, MAX_POSITION } from './bones_config'


const TAU = Math.PI * 2.0
const BASE = 60 // must be a multiple of 2
const BASE60 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz01234567'


export class SkeletonSerializer {

	discretized_position: THREE.Vector3[]
	discretized_bones_rot: { [id: string] : THREE.Vector3 }

	constructor() {
		this.discretized_position = [
			new THREE.Vector3(),
			new THREE.Vector3()
		]

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

		str += this.#vectorToStr(this.discretized_position[0])
		str += this.#vectorToStr(this.discretized_position[1])

		return str
	}

	static stringToBonesRotations(str: string): { [id: string] : THREE.Euler } {
		const values: number[] = []
		for (const c of str) {
			values.push(BASE60.indexOf(c))
		}

		const bones_rotations: { [id: string] : THREE.Euler } = {}
		let cursor = 0

		bones_config.forEach(bone_config => {
			const rotation = new Vector3(
				bone_config.axes[0] == '_' ? 0 : values[cursor++],
				bone_config.axes[1] == '_' ? 0 : values[cursor++],
				bone_config.axes[2] == '_' ? 0 : values[cursor++],
			)
			SkeletonSerializer.continuousRotation(rotation)
			bones_rotations[bone_config.name] = new Euler().setFromVector3(rotation)
		})

		return bones_rotations
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

	static discretizeRotation(rotation: THREE.Vector3) {
		rotation
			.multiplyScalar(BASE)
			.divideScalar(TAU)
			.addScalar(BASE / 2)
			.round()
	}

	static continuousRotation(rotation: THREE.Vector3) {
		rotation
			.subScalar(BASE / 2)
			.multiplyScalar(TAU)
			.divideScalar(BASE)
	}

	getRoundedBoneRotation(bone: THREE.Bone): THREE.Euler {
		const bone_name = bone.name.substring(BONES_NAME_PREFIX.length)
		const rotation = new THREE.Vector3().setFromEuler(bone.rotation)

		SkeletonSerializer.discretizeRotation(rotation)
		this.discretized_bones_rot[bone_name].copy(rotation)
		SkeletonSerializer.continuousRotation(rotation)

		return new THREE.Euler().setFromVector3(rotation)
	}

	discretizePosition(position: THREE.Vector3): THREE.Vector3[] {
		const base_normalized_position = position
			.clone()
			.sub(MIN_POSITION)
			.divideScalar(- MIN_POSITION.x + MAX_POSITION.x)
			.multiplyScalar(BASE)
			
		const high_order_pos = base_normalized_position
			.clone()
			.floor()

		const low_order_pos = base_normalized_position
			.clone()
			.sub(high_order_pos)
			.multiplyScalar(BASE)
			.round()

		return [ high_order_pos, low_order_pos ]
	}

	continuousPosition(high_order_pos: THREE.Vector3, low_order_pos: THREE.Vector3): THREE.Vector3 {
		const pos = new THREE.Vector3()
			.copy(high_order_pos)
			.divideScalar(BASE)
			.add(low_order_pos.clone().divideScalar(BASE * BASE))
			.multiplyScalar(- MIN_POSITION.x + MAX_POSITION.x)
			.add(MIN_POSITION)

		return pos
	}

	getRoundedPosition(position: THREE.Vector3): THREE.Vector3 {
		const [ high_order_pos, low_order_pos ] = this.discretizePosition(position)

		this.discretized_position[0] = high_order_pos
		this.discretized_position[1] = low_order_pos
		return this.continuousPosition(high_order_pos, low_order_pos)
	}

	#valueToStr(value: number): string {
		return BASE60.charAt(value)
	}

	#vectorToStr(vector: THREE.Vector3): string {
		return BASE60.charAt(vector.x)
		     + BASE60.charAt(vector.y)
			 + BASE60.charAt(vector.z)
	}

}