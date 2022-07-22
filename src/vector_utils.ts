import * as THREE from 'three'


const TAU = Math.PI * 2.0


export function discretizeRotation(rotation: THREE.Vector3, base: number) {
	rotation
		.multiplyScalar(base)
		.divideScalar(TAU)
		.addScalar(base / 2)
		.round()
}

export function continuousRotation(rotation: THREE.Vector3, base: number) {
	rotation
		.subScalar(base / 2)
		.multiplyScalar(TAU)
		.divideScalar(base)
}

export function roundRotation(rotation: THREE.Vector3, base: number): THREE.Vector3 {
	discretizeRotation(rotation, base)
	continuousRotation(rotation, base)
	return rotation
}

export function discretizePosition(position: THREE.Vector3,
		min_pos: THREE.Vector3, max_pos: THREE.Vector3, base: number): THREE.Vector3[] {
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
		.round()

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

export function roundPosition(position: THREE.Vector3,
		min_pos: THREE.Vector3, max_pos: THREE.Vector3, base: number): THREE.Vector3 {
	const [ high_order_pos, low_order_pos ] = discretizePosition(position, min_pos, max_pos, base)
	return continuousPosition(high_order_pos, low_order_pos, min_pos, max_pos, base)
}
