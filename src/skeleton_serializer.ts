import * as THREE from 'three'
import * as BonesConfig from './bones_config'
import * as Serializer from './serializer'


const EXPECTED_STRING_LENGTH = BonesConfig.NB_BONE_VALUES + 6


export class SkeletonSerializer {

	discretized_position: Serializer.DoubleDiscreteVector3
	discrete_bones_rot: { [id: string] : THREE.Vector3 }

	single_axis_serializer: Serializer.NumberSerializer
	rotation_serializer: Serializer.Vector3Serializer
	position_serializer: Serializer.Vector3SerializerDoublePrecision

	constructor() {
		this.discretized_position = [
			new THREE.Vector3(),
			new THREE.Vector3()
		]

		this.discrete_bones_rot = {}
		BonesConfig.bones.forEach(bone_config => {
			this.discrete_bones_rot[bone_config.name] = new THREE.Vector3().addScalar(Serializer.BASE / 2)
		})

		this.single_axis_serializer = new Serializer.NumberSerializer(-180, 180)
		this.rotation_serializer = new Serializer.Vector3Serializer(
			new THREE.Vector3(-180, -180, -180),
			new THREE.Vector3(180, 180, 180)
		)
		this.position_serializer = new Serializer.Vector3SerializerDoublePrecision(
			new THREE.Vector3(-10, -10, -10),
			new THREE.Vector3(10, 10, 10)
		)
	}

	fromString(str: string): void {
		if (str.length != EXPECTED_STRING_LENGTH) {
			throw(`Can not load model from string "${ str }": `
				+ `string length should be ${ EXPECTED_STRING_LENGTH } but is ${ str.length }.`)
		}

		const rotations_str = str.substring(0, BonesConfig.NB_BONE_VALUES - 1)
		this.discrete_bones_rot = this.#getBonesRotations(rotations_str)

		const position_str = str.substring(BonesConfig.NB_BONE_VALUES)
		this.discretized_position = this.position_serializer.stringToDiscreteValue(position_str)
	}

	toString(): string {
		let str = ''

		BonesConfig.bones.forEach(config => {
			str += this.#boneRotationToString(this.discrete_bones_rot[config.name], config.axes)
		})
		str += this.position_serializer.discreteValueTostring(this.discretized_position)

		return str
	}

	loadBoneRotation(bone: THREE.Bone): void {
		if ( ! ( bone.name in this.discrete_bones_rot)) {
			throw new BonesConfig.BoneNotFoundError(bone.name)
		}

		let rotation = new THREE.Vector3().setFromEuler(bone.rotation)
		rotation = this.rotation_serializer.discretize(rotation)

		this.discrete_bones_rot[bone.name].copy(rotation)
	}

	getBoneRotation(bone_name: string): THREE.Euler {
		const bone_config = BonesConfig.fromName(bone_name)

		let rotation = this.discrete_bones_rot[bone_name].clone()
		rotation = this.rotation_serializer.makeContinuous(rotation)

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
		this.discretized_position = this.position_serializer.discretize(position)
	}

	getModelPosition(): THREE.Vector3 {
		return this.position_serializer.makeContinuous(this.discretized_position)
	}

	roundBoneRotation(rotation: THREE.Vector3) {
		return this.rotation_serializer.round(rotation).multiplyScalar(THREE.MathUtils.DEG2RAD)
	}
	
	#getBonesRotations(rotations_str: string): { [id: string] : THREE.Vector3 } {
		const discretized_bones_rot: { [id: string] : THREE.Vector3 } = {}

		const discrete_rotations: number[] = []
		for (const char of rotations_str) {
			discrete_rotations.push(this.single_axis_serializer.stringToDiscreteValue(char))
		}

		let cursor = 0
		BonesConfig.bones.forEach(config => {
			const rotation = new THREE.Vector3(
				config.axes.includes('x') ? discrete_rotations[cursor++] : 0,
				config.axes.includes('y') ? discrete_rotations[cursor++] : 0,
				config.axes.includes('z') ? discrete_rotations[cursor++] : 0,
			)
			discretized_bones_rot[config.name] = rotation
		})

		return discretized_bones_rot
	}

	#boneRotationToString(rotation: THREE.Vector3, axes: string): string {
		let str = ''

		if (axes.includes('x')) {
			str += this.single_axis_serializer.discreteValueTostring(rotation.toArray()[0])
		}
		if (axes.includes('y')) {
			str += this.single_axis_serializer.discreteValueTostring(rotation.toArray()[1])
		}
		if (axes.includes('z')) {
			str += this.single_axis_serializer.discreteValueTostring(rotation.toArray()[2])
		}
		return str
	}


}