import * as THREE from 'three'
import { Vector3 } from 'three'
import * as BonesConfig from './bones_config'
import * as VectorUtils from './vector_utils'


const NB_BONE_VALUES = BonesConfig.bones
	.map(bone_config => bone_config.axes)
	.join('')
	.split('_')
	.join('')
	.length
const EXPECTED_STRING_LENGTH = NB_BONE_VALUES + 6
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

	fromString(str: string): void {
		if (str.length != EXPECTED_STRING_LENGTH) {
			throw(`Can not load model from string "${ str }": `
			+ `string length should be ${ EXPECTED_STRING_LENGTH } but is ${ str.length }.`)
		}

		const values: number[] = []
		for (const c of str) {
			values.push(this.#strToValue(c))
		}

		this.#loadBonesRotationValues(values.slice(0, NB_BONE_VALUES - 1))
		this.#loadModelPositionValues(values.slice(NB_BONE_VALUES, NB_BONE_VALUES + 6))
	}

	toString(): string {
		let str = ''
		BonesConfig.bones.forEach(bone_config => {
			const rotation = this.discretized_bones_rot[bone_config.name]
			str += this.#boneRotationToString(rotation, bone_config.axes)
		})

		str += this.#vectorToStr(this.discretized_position[0])
		str += this.#vectorToStr(this.discretized_position[1])

		return str
	}

	loadBoneRotation(bone: THREE.Bone): void {
		if ( ! ( bone.name in this.discretized_bones_rot)) {
			throw new ReferenceError()
		}

		const rotation = new THREE.Vector3().setFromEuler(bone.rotation)

		VectorUtils.discretizeRotation(rotation, BonesConfig.BASE)
		this.discretized_bones_rot[bone.name].copy(rotation)
	}

	getBoneRotation(bone_name: string): THREE.Euler {
		const rotation = this.discretized_bones_rot[bone_name].clone()
		const bone_config = BonesConfig.bones.find(bone_config => bone_config.name == bone_name)
		if ( ! bone_config) {
			throw new BonesConfig.BoneNotFoundError(bone_name)
		}
		VectorUtils.continuousRotation(rotation, BonesConfig.BASE)
		return new THREE.Euler().setFromVector3(rotation, bone_config.rotation_order)
	}

	getBonesRotation(): { [id: string] : THREE.Euler } {
		const bones_rotations: { [id: string] : THREE.Euler } = {}
		BonesConfig.bones.forEach(bone_config => {
			bones_rotations[bone_config.name] = this.getBoneRotation(bone_config.name)
		})
		return bones_rotations
	}

	loadModelPosition(position: THREE.Vector3): void {
		const [ high_order_pos, low_order_pos ] = VectorUtils.discretizePosition(
			position.clone(),
			BonesConfig.MIN_POSITION,
			BonesConfig.MAX_POSITION,
			BonesConfig.BASE
		)

		this.discretized_position[0].copy(high_order_pos)
		this.discretized_position[1].copy(low_order_pos)
	}

	getModelPosition(): THREE.Vector3 {
		return VectorUtils.continuousPosition(
			this.discretized_position[0],
			this.discretized_position[1],
			BonesConfig.MIN_POSITION,
			BonesConfig.MAX_POSITION,
			BonesConfig.BASE
		)
	}

	#loadBonesRotationValues(values: number[]): void {
		let cursor = 0
		BonesConfig.bones.forEach(bone_config => {
			const rotation = new THREE.Vector3(
				bone_config.axes.includes('x') ? values[cursor++] : BonesConfig.BASE / 2,
				bone_config.axes.includes('y') ? values[cursor++] : BonesConfig.BASE / 2,
				bone_config.axes.includes('z') ? values[cursor++] : BonesConfig.BASE / 2,
			)
			this.discretized_bones_rot[bone_config.name].copy(rotation)
		})
	}

	#loadModelPositionValues(values: number[]): void {
		this.discretized_position = [
			new Vector3().fromArray(values.slice(0, 3)),
			new Vector3().fromArray(values.slice(3, 6))
		]
	}

	#boneRotationToString(rotation: THREE.Vector3, axes: string): string {
		let str = ''

		if (axes.includes('x')) {
			str += this.#valueToStr(rotation.toArray()[0])
		}
		if (axes.includes('y')) {
			str += this.#valueToStr(rotation.toArray()[1])
		}
		if (axes.includes('z')) {
			str += this.#valueToStr(rotation.toArray()[2])
		}
		return str
	}

	#valueToStr(value: number): string {
		return BASE60.charAt(value)
	}

	#strToValue(str: string): number {
		return BASE60.indexOf(str)
	}

	#vectorToStr(vector: THREE.Vector3): string {
		return this.#valueToStr(vector.x)
		     + this.#valueToStr(vector.y)
			 + this.#valueToStr(vector.z)
	}

}