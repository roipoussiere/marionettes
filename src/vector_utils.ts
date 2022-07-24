import * as THREE from 'three'


const TAU = Math.PI * 2.0

export enum RoundTo {
	NEAREST,
	BOTTOM,
	TOP
}


function roundVector(vector: THREE.Vector3, round_to: RoundTo) {
	if (round_to == RoundTo.NEAREST) {
		vector.round()
	} else if (round_to == RoundTo.BOTTOM) {
		vector.floor()
	} else {
		vector.ceil()
	}
}

export function discretizeRotation(rotation: THREE.Vector3, base: number, round_to=RoundTo.NEAREST) {
	rotation
		.multiplyScalar(base)
		.divideScalar(TAU)
		.addScalar(base / 2)
	roundVector(rotation, round_to)
}

export function continuousRotation(rotation: THREE.Vector3, base: number) {
	rotation
		.subScalar(base / 2)
		.multiplyScalar(TAU)
		.divideScalar(base)
}

export function roundRotation(rotation: THREE.Vector3, base: number, round_to=RoundTo.NEAREST): THREE.Vector3 {
	discretizeRotation(rotation, base, round_to)
	continuousRotation(rotation, base)
	return rotation
}

export function roundRotationDegrees(angle: THREE.Vector3, base: number, round_to=RoundTo.NEAREST): THREE.Vector3 {
	return roundRotation(angle.multiplyScalar(THREE.MathUtils.DEG2RAD), base, round_to)
}

export function discretizePosition(position: THREE.Vector3, min_pos: THREE.Vector3,
		max_pos: THREE.Vector3, base: number, round_to=RoundTo.NEAREST): THREE.Vector3[] {
	const base_normalized_position = position
		.clone()
		.sub(min_pos)
		.divideScalar(- min_pos.x + max_pos.x)
		.multiplyScalar(base)

	const high_order_pos = base_normalized_position
		.clone()
		.floor()

	const low_order_pos = base_normalized_position
		.clone()
		.sub(high_order_pos)
		.multiplyScalar(base)
	roundVector(low_order_pos, round_to)

	return [ high_order_pos, low_order_pos ]
}

export function continuousPosition(high_order_pos: THREE.Vector3, low_order_pos: THREE.Vector3,
		min_pos: THREE.Vector3, max_pos: THREE.Vector3, base: number): THREE.Vector3 {
	const pos = new THREE.Vector3()
		.copy(high_order_pos)
		.divideScalar(base)
		.add(low_order_pos.clone().divideScalar(base * base))
		.multiplyScalar(- min_pos.x + max_pos.x)
		.add(min_pos)

	return pos
}

export function roundPosition(position: THREE.Vector3, min_pos: THREE.Vector3,
		max_pos: THREE.Vector3, base: number, round_to=RoundTo.NEAREST): THREE.Vector3 {
	const [ high_order_pos, low_order_pos ] = discretizePosition(position, min_pos, max_pos, base, round_to)
	return continuousPosition(high_order_pos, low_order_pos, min_pos, max_pos, base)
}
