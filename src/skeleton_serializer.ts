import * as THREE from 'three'
import { bones_config, BONES_NAME_PREFIX } from './bones_config'
import { Skeleton } from 'three'


export const BASE = 60
export const BASE60 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz01234567'
export const ROOT_BONE = 'Hips'


export function toString(skeleton: Skeleton): string {
	let bones_values: number[] = []
	bones_config.forEach(bone_config => {
		const bone = skeleton.getBoneByName(BONES_NAME_PREFIX + bone_config.name)
		if ( ! bone ) {
			throw(`Bone ${bone_config.name} not found in skeleton.`)
		}
		bones_values = bones_values.concat(getBoneValues(bone, bone_config.axes))
	})

	bones_values = bones_values.concat(skeletonPositionToValues(skeleton))

	return valuesToStr(bones_values)
}

function getBoneValues(bone: THREE.Bone, axes: string): number[] {
	const values: number[] = []
	const rotation = new THREE.Vector3().setFromEuler(bone.rotation)
	rotation.copy(discretizeVector(rotation))

	if (axes[0] != '_') {
		values.push(rotation.x)
	}
	if (axes[1] != '_') {
		values.push(rotation.y)
	}
	if (axes[2] != '_') {
		values.push(rotation.z)
	}
	return values
}

function skeletonPositionToValues(skeleton: Skeleton): number[] {
	const values: number[] = []

	const root_bone = skeleton.getBoneByName(BONES_NAME_PREFIX + ROOT_BONE)
	if ( ! root_bone ) {
		throw(`Root bone (${ ROOT_BONE }) not found in skeleton.`)
	}

	const position = root_bone.getWorldPosition(new THREE.Vector3())
	position.copy(discretizeVector(position, BASE * BASE)) // double precision

	values.push(Math.floor(position.x / BASE), position.x % BASE)
	values.push(Math.floor(position.y / BASE), position.y % BASE)
	values.push(Math.floor(position.z / BASE), position.z % BASE)
	return values
}

function valuesToStr(values: number[]): string {
	let values_str = ''
	values.forEach(value => {
		values_str += BASE60.charAt(value)
	})
	return values_str
}

function discretizeVector(rotation: THREE.Vector3, base: number = BASE) {
	return rotation
		.addScalar(Math.PI)
		.divideScalar(2 * Math.PI)
		.multiplyScalar(base)
		.round()
}

function continuousVector(rotation: THREE.Vector3, base: number = BASE) {
	return rotation
		.divideScalar(base)
		.multiplyScalar(2 * Math.PI)
		.subScalar(Math.PI)
}
