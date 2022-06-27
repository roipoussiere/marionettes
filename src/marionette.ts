import * as THREE from 'three'
// Note: SkeletonUtils is broken and has been patched in this PR:
// https://github.com/three-types/three-ts-types/pull/230/
// Which is included in the project. See postinstall script in package.json
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils'
import { bones_config, BONES_NAME_PREFIX } from './bones_config'
import { toString } from './skeleton_serializer'


export const MODEL_NAME_PREFIX = 'model_'
export const SKINNED_MESH_NAME = 'Beta_Surface'


export class Marionette {
    name: string
	skeleton: THREE.Skeleton
	clicked_bone: THREE.Bone
	model: THREE.Group
	handles: THREE.Group

	constructor(name: string) {
        this.name = name
		this.skeleton = new THREE.Skeleton([])
		this.clicked_bone = new THREE.Bone()
		this.model = new THREE.Group()
		this.handles = new THREE.Group()
	}

	setModel(model: THREE.Group) {
		console.log(`model for ${ this.name }:`, model)
		// this.model = model
		this.model = <THREE.Group> SkeletonUtils.clone(model)
		this.model.name = MODEL_NAME_PREFIX + this.name

		const surface = <THREE.SkinnedMesh> this.model.getObjectByName(SKINNED_MESH_NAME)
		if ( ! surface) {
			throw(`Skinned mesh ${SKINNED_MESH_NAME} not found in the model.`)
		}
		this.skeleton = surface.skeleton

		if (this.name == 'base') {
			this.model.position.setX(1)
		} else {
			this.model.position.setX(-1)
		}
	}

	initHandles() {
		this.handles.name = `handles_${ this.name }`
		const handle_material = new THREE.MeshBasicMaterial({
			color: 0xffffff,
			depthTest: false,
			opacity: 0.5,
			transparent: true
		})
		const handle_geometry = new THREE.SphereGeometry(0.02, 6, 4)

		this.skeleton.bones.forEach(bone => {
			const handle = new THREE.Mesh( handle_geometry, handle_material )
			handle.name = `handle_${bone.name.substring(BONES_NAME_PREFIX.length)}`
			this.handles.add(handle)
		})
		this.updateHandles()
	}

	updateHandles() {
		this.skeleton.bones.forEach( (bone, bone_id) => {
			const handle_position = bone.getWorldPosition(new THREE.Vector3())
			this.handles.children[bone_id].position.copy(handle_position)
		})
	}

	rotateBone(pointer_delta: THREE.Vector2, axe_modifier_id: number) {
		// Rotations are non-commutative, so rotating on both x/y with cursor
		// will lead to unexpected results (ie. rotation on z)
		let delta = pointer_delta.x + pointer_delta.y

		// todo: move according to camera point of view, something like:
		// const plane = this.camera.position.clone().normalize()
		// this.clicked_joint.rotateOnAxis(plane, 0.1)

		const bone_name = this.clicked_bone.name.substring(BONES_NAME_PREFIX.length)
		const bone_config = bones_config.find(config => config.name == bone_name)
		if ( ! bone_config) {
			throw(`Bone name ${ bone_name } not found in bone config.`)
		}

		delta *= bone_config.reverse ? -1 : 1
		const axe = bone_config.axes[axe_modifier_id]

		const rotation = new THREE.Vector3()
			.setFromEuler(this.clicked_bone.rotation)
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
		this.clicked_bone.setRotationFromEuler(euler_rotation)
	}

	updateClickedBone(point: THREE.Vector3) {
		let closest_bone = new THREE.Bone
		let position = new THREE.Vector3()
		let closest_distance = Infinity

		this.skeleton.bones.forEach(bone => {
			const distance = (bone.getWorldPosition(position).sub(point)).length()
			if (distance < closest_distance) {
				closest_bone = bone
				closest_distance = distance
			}
		})

		this.clicked_bone = closest_bone
		// console.info('clicked bone:', this.clicked_bone)
		console.log(toString(this.skeleton))
	}
}
