import * as THREE from 'three'
import * as BonesConfig from './bones_config'
import * as VectorUtils from './vector_utils'


export const NB_BONE_VALUES = BonesConfig.bones
	.map(bone_config => bone_config.axes)
	.join('')
	.split('_')
	.join('')
	.length

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
		BonesConfig.bones.forEach(bone_config => {
			this.discretized_bones_rot[bone_config.name] = new THREE.Vector3()
				.addScalar(BonesConfig.BASE / 2)
		})
	}

	toString(): string {
		let str = ''
		BonesConfig.bones.forEach(bone_config => {
			const rotation = this.discretized_bones_rot[bone_config.name].clone()
			str += this.boneRotationToString(rotation, bone_config.axes)
		})

		str += this.#vectorToStr(this.discretized_position[0])
		str += this.#vectorToStr(this.discretized_position[1])

		return str
	}

	loadFromString(str: string): void {
		const values: number[] = []
		for (const c of str) {
			values.push(BASE60.indexOf(c))
		}

		let cursor = 0
		BonesConfig.bones.forEach(bone_config => {
			const rotation = new THREE.Vector3(
				bone_config.axes[0] == '_' ? BonesConfig.BASE / 2 : values[cursor++],
				bone_config.axes[1] == '_' ? BonesConfig.BASE / 2 : values[cursor++],
				bone_config.axes[2] == '_' ? BonesConfig.BASE / 2 : values[cursor++],
			)
			this.discretized_bones_rot[bone_config.name].copy(rotation)
		})
	}

	getRotations(): { [id: string] : THREE.Euler } {
		const bones_rotations: { [id: string] : THREE.Euler } = {}
		BonesConfig.bones.forEach(bone_config => {
			const rotation = this.discretized_bones_rot[bone_config.name].clone()
			VectorUtils.continuousRotation(rotation, BonesConfig.BASE)
			bones_rotations[bone_config.name] = new THREE.Euler().setFromVector3(rotation)
		})
		return bones_rotations
	}

	static stringToPosition(str: string): THREE.Vector3 {
		const high_order_pos = new THREE.Vector3(
			BASE60.indexOf(str[0]),
			BASE60.indexOf(str[1]),
			BASE60.indexOf(str[2])
		)

		const low_order_pos = new THREE.Vector3(
			BASE60.indexOf(str[3]),
			BASE60.indexOf(str[4]),
			BASE60.indexOf(str[5])
		)

		return SkeletonSerializer.continuousPosition(high_order_pos, low_order_pos)
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

	getRoundedBoneRotation(bone: THREE.Bone): THREE.Euler {
		if ( ! ( bone.name in this.discretized_bones_rot)) {
			throw new ReferenceError()
		}

		const rotation = new THREE.Vector3().setFromEuler(bone.rotation)

		VectorUtils.discretizeRotation(rotation, BonesConfig.BASE)
		this.discretized_bones_rot[bone.name].copy(rotation)
		VectorUtils.continuousRotation(rotation, BonesConfig.BASE)

		return new THREE.Euler().setFromVector3(rotation)
	}

	discretizePosition(position: THREE.Vector3): THREE.Vector3[] {
		const base_normalized_position = position
			.clone()
			.sub(BonesConfig.MIN_POSITION)
			.divideScalar(- BonesConfig.MIN_POSITION.x + BonesConfig.MAX_POSITION.x)
			.multiplyScalar(BonesConfig.BASE)

		const high_order_pos = base_normalized_position
			.clone()
			.floor()

		const low_order_pos = base_normalized_position
			.clone()
			.sub(high_order_pos)
			.multiplyScalar(BonesConfig.BASE)
			.round()

		return [ high_order_pos, low_order_pos ]
	}

	static continuousPosition(high_order_pos: THREE.Vector3, low_order_pos: THREE.Vector3): THREE.Vector3 {
		const pos = new THREE.Vector3()
			.copy(high_order_pos)
			.divideScalar(BonesConfig.BASE)
			.add(low_order_pos.clone().divideScalar(BonesConfig.BASE * BonesConfig.BASE))
			.multiplyScalar(- BonesConfig.MIN_POSITION.x + BonesConfig.MAX_POSITION.x)
			.add(BonesConfig.MIN_POSITION)

		return pos
	}

	getRoundedPosition(position: THREE.Vector3): THREE.Vector3 {
		const [ high_order_pos, low_order_pos ] = this.discretizePosition(position.clone())

		this.discretized_position[0].copy(high_order_pos)
		this.discretized_position[1].copy(low_order_pos)

		return SkeletonSerializer.continuousPosition(high_order_pos, low_order_pos)
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