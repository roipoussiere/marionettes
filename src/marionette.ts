import * as THREE from 'three'
// Note: SkeletonUtils is broken and has been patched in this PR:
// https://github.com/three-types/three-ts-types/pull/230/
// Which is included in the project. See postinstall script in package.json
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils'
import { bones_config, BONES_NAME_PREFIX, MIN_POSITION, MAX_POSITION } from './bones_config'
import { SkeletonSerializer, NB_BONE_VALUES } from './skeleton_serializer'
// import { dump_bone } from './three_utils'


export const MODEL_NAME_PREFIX = 'model_'
// export const BONES_NAME_PREFIX = 'mixamorig' // TODO

const SKINNED_MESH_NAME = 'Beta_Surface'


export class Marionette {
    name: string
	skeleton: THREE.Skeleton
	clicked_bone: THREE.Bone
	model: THREE.Group
	handles: THREE.Group
	doing_something: boolean
	serializer: SkeletonSerializer

	constructor(name: string) {
        this.name = name
		this.skeleton = new THREE.Skeleton([])
		this.clicked_bone = new THREE.Bone()
		this.model = new THREE.Group()
		this.handles = new THREE.Group()
		this.doing_something = false
		this.serializer = new SkeletonSerializer()
	}

	setModel(model: THREE.Group) {
		console.log(`model for ${ this.name }:`, model)
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
			const handle_position = bone.getWorldPosition(this.handles.children[bone_id].position)
			this.handles.children[bone_id].position.copy(handle_position)
		})
	}

	loadFromString(str: string) {
		const bones_rotations = SkeletonSerializer.stringToBonesRotations(str.substring(0, NB_BONE_VALUES))

		for (const [bone_name, bone_rotation] of Object.entries(bones_rotations)) {
			const bone = this.skeleton.getBoneByName(BONES_NAME_PREFIX + bone_name)
			if (bone) {
				bone.rotation.copy(bone_rotation)
			} else {
				throw(`Can not find bone: ${ bone_name }`)
			}
		}

		const position = SkeletonSerializer.stringToPosition(str.substring(NB_BONE_VALUES))
		this.model.position.copy(position)
	}

	translate(pointer_delta: THREE.Vector2, axe_modifier_id: number) {
		this.model.position.add(new THREE.Vector3(
			axe_modifier_id == 1 ? 0 : - pointer_delta.x,
			axe_modifier_id == 1 ? - (pointer_delta.x + pointer_delta.y) : 0,
			axe_modifier_id == 1 ? 0 : pointer_delta.y
		)).clamp(MIN_POSITION, MAX_POSITION)
	}

	rotateBone(pointer_delta: THREE.Vector2, axe_modifier_id: number) {
		const bone_name = this.clicked_bone.name.substring(BONES_NAME_PREFIX.length)
		const bone_config = bones_config.find(config => config.name == bone_name)
		if ( ! bone_config) {
			throw(`Bone name ${ bone_name } not found in bone config.`)
		}
		const axe = bone_config.axes[axe_modifier_id]

		// Rotations are non-commutative, so rotating on both x/y with cursor
		// will lead to unexpected results (ie. rotation on z)
		const delta = (pointer_delta.x + pointer_delta.y) * (bone_config.reverse ? -1 : 1)

		const rotation = new THREE.Vector3()
			.setFromEuler(this.clicked_bone.rotation)
			.add(new THREE.Vector3(
				axe == 'x' ? delta : 0,
				axe == 'y' ? delta : 0,
				axe == 'z' ? delta : 0
			))
			.clamp(bone_config.min_angle, bone_config.max_angle)

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
		// dump_bone(this.clicked_bone)
		// console.log(toString(this.skeleton))
	}

	roundPosition() {
		this.model.position.copy(this.serializer.getRoundedPosition(this.model.position))
	}

	roundMovedBone() {
		const rounded_rotation = this.serializer.getRoundedBoneRotation(this.clicked_bone)
		this.clicked_bone.rotation.copy(rounded_rotation)
		// dump_bone(this.clicked_bone)
	}

}
