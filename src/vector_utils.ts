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
