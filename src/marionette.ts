import * as THREE from 'three'
import { Vector3 } from 'three'
import { bones_config } from './bones_config'


export const BONES_NAME_PREFIX = 'mixamorig'
export const MODEL_NAME_PREFIX = 'model_'


export class Marionette {
    name: string
	bones: { [id: string] : THREE.Bone }
	clicked_joint: THREE.Object3D
	model: THREE.Group

	constructor(name: string) {
        this.name = name
		this.bones = {}
		this.clicked_joint = new THREE.Object3D()
		this.model = new THREE.Group()
	}

	setModel(model: THREE.Group) {
		console.log(`model for ${ this.name }:`, model)
		// console.log('model scale:', model.scale)
		this.model = model
		// this.model.copy(model)
		// this.model.scale.setScalar(0.001)
		// console.log('model scale:', model.scale)
		this.model.name = MODEL_NAME_PREFIX + this.name

		model.traverse(child => {
			if (child instanceof THREE.Bone) {
				this.bones[child.name] = <THREE.Bone> child
				// this.bones[grand_child.id] = <THREE.Bone> child
			}
		})
		// console.log(this.name + ' bones:', Object.keys(this.bones))
	}

	onBoneClicked(intersect: THREE.Intersection) {
		this.clicked_joint = this.#findClosestJoint(intersect.point)
		// console.log('intersecting at', intersect.point, intersect.face)
		// console.info('Selected joint:', this.clicked_joint)
	}

	rotateBone(pointer_delta: THREE.Vector2, axe_modifier_id: number) {
		// Rotations are non-commutative, so rotating on both x/y with cursor
		// will lead to unexpected results (ie. rotation on z)
		let delta = pointer_delta.x + pointer_delta.y

		// todo: move according to camera point of view, something like:
		// const plane = this.camera.position.clone().normalize()
		// this.clicked_joint.rotateOnAxis(plane, 0.1)

		const bone_name = this.clicked_joint.name.substring(BONES_NAME_PREFIX.length)
		if ( ! (bone_name in bones_config)) {
			return
		}
		const bone_config = bones_config[bone_name]

		delta *= bone_config.reverse ? -1 : 1
		const axe = bone_config.axes[axe_modifier_id]

		const rotation = new THREE.Vector3()
			.setFromEuler(this.clicked_joint.rotation)
			.add(new THREE.Vector3(
				axe == 'x' ? delta : 0,
				axe == 'y' ? delta : 0,
				axe == 'z' ? delta : 0
			))
			.clamp(bone_config.min_angle, bone_config.max_angle)

		// console.log(
		// 	`${this.clicked_joint.name.substring(BONES_NAME_PREFIX.length)}: `
		// 	+ `(${Math.round(rotation.x * THREE.MathUtils.RAD2DEG)}, `
		// 	+  `${Math.round(rotation.y * THREE.MathUtils.RAD2DEG)}, `
		// 	+  `${Math.round(rotation.z * THREE.MathUtils.RAD2DEG)})`
		// )
		const euler_rotation = new THREE.Euler().setFromVector3(rotation)
		this.clicked_joint.setRotationFromEuler(euler_rotation)
	}

	#findClosestJoint(point: THREE.Vector3) {
		let closest_joint = new THREE.Object3D
		let position = new THREE.Vector3()
		let closest_bone_distance = Infinity

		for (let boneName in this.bones) {
			const bone = this.bones[boneName]
			const distance = (bone.getWorldPosition(position).sub(point)).length()
			if (distance < closest_bone_distance && bone.parent) {
				closest_joint = bone.parent
				closest_bone_distance = distance
			}
		}

		return closest_joint
	}
}
