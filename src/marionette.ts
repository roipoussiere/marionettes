import * as THREE from 'three'

// Note: SkeletonUtils is broken and has been patched in this PR:
// https://github.com/three-types/three-ts-types/pull/230/
// Which is included in the project. See postinstall script in package.json
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils'
import * as BonesConfig from './bones_config'
import { SkeletonSerializer, NB_BONE_VALUES } from './skeleton_serializer'


export const MODEL_NAME_PREFIX = 'model_'
export const HANDLES_NAME_PREFIX = 'handles_'
export const HANDLE_NAME_PREFIX = 'handle_'


export class Marionette {
    name: string
	default_pose: string
	skeleton: THREE.Skeleton
	clicked_bone: THREE.Bone
	model: THREE.Group
	handles: THREE.Group
	doing_something: boolean
	serializer: SkeletonSerializer

	constructor(name: string, default_pose: string) {
        this.name = name
		this.default_pose = default_pose
		this.skeleton = new THREE.Skeleton([])
		this.clicked_bone = new THREE.Bone()
		this.model = new THREE.Group()
		this.handles = new THREE.Group()
		this.doing_something = false
		this.serializer = new SkeletonSerializer()
	}

	setModel(model: THREE.Group) {
		this.model = <THREE.Group> SkeletonUtils.clone(model)
		this.model.name = MODEL_NAME_PREFIX + this.name

		const root_bone = <THREE.Bone> this.model.children.find(child => child instanceof THREE.Bone)
		root_bone.traverse(bone => {
			this.skeleton.bones.push(<THREE.Bone> bone)
		})

		if ( this.skeleton.bones.length == 0 ) {
			throw(`Skeleton not found in the model.`)
		}

		this.loadFromString(this.default_pose)
	}

	initHandles() {
		this.handles.name = HANDLES_NAME_PREFIX + this.name
		const handle_material = new THREE.MeshBasicMaterial({
			color: 0xffffff,
			depthTest: false,
			opacity: 0.5,
			transparent: true
		})
		const handle_geometry = new THREE.SphereGeometry(0.02, 6, 4)

		this.skeleton.bones.forEach(bone => {
			const handle = new THREE.Mesh( handle_geometry, handle_material )
			handle.name = HANDLE_NAME_PREFIX  + bone.name
			this.handles.add(handle)
		})
		this.updateHandles()
	}

	updateHandles() {
		this.skeleton.bones.forEach( bone => {
			const handle = this.handles.getObjectByName(HANDLE_NAME_PREFIX + bone.name)
			if (handle) {
				handle.position.copy(bone.getWorldPosition(handle.position))
			}
		})
	}

	loadFromString(str: string) {
		this.serializer.loadFromString(str.substring(0, NB_BONE_VALUES))
		const bones_rotations = this.serializer.getRotations()

		for (const [bone_name, bone_rotation] of Object.entries(bones_rotations)) {
			const bone = this.skeleton.getBoneByName(bone_name)
			if (bone) {
				bone.rotation.copy(bone_rotation)
			} else {
				throw(`Can not find bone: ${ bone_name }`)
			}
		}

		const position = SkeletonSerializer.stringToPosition(str.substring(NB_BONE_VALUES))
		this.model.position.copy(position)
		this.updateHandles()
	}

	toString(): string {
		this.roundPosition()
		return this.serializer.toString()
	}

	translate(pointer_delta: THREE.Vector2, axe_modifier_id: number) {
		if (axe_modifier_id == 0) {
			this.model.translateZ(pointer_delta.x + pointer_delta.y)
		} else if (axe_modifier_id == 1) {
			this.model.translateX(- pointer_delta.x - pointer_delta.y)
		} else if (axe_modifier_id == 2) {
			this.model.translateY(- pointer_delta.x - pointer_delta.y)
		}
		this.roundPosition()
	}

	rotate(pointer_delta: THREE.Vector2, axe_modifier_id: number) {
		const root_bone = <THREE.Bone> this.model.children.find(child => child instanceof THREE.Bone)

		if (axe_modifier_id == 0) {
			root_bone.rotateX(pointer_delta.x + pointer_delta.y)
		} else if (axe_modifier_id == 1) {
			root_bone.rotateY(pointer_delta.x + pointer_delta.y)
		} else if (axe_modifier_id == 2) {
			root_bone.rotateZ(pointer_delta.x + pointer_delta.y)
		}
	}

	rotateBone(pointer_delta: THREE.Vector2, axe_modifier_id: number) {
		const bone_config = BonesConfig.bones.find(config => config.name == this.clicked_bone.name)
		if ( ! bone_config) {
			throw(`Bone name ${ this.clicked_bone.name } not found in bone config.`)
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
		console.log(`clicked on ${ this.name }'s ${ closest_bone.name }`)

		this.clicked_bone = closest_bone
	}

	roundPosition() {
		this.model.position.copy(this.serializer.getRoundedPosition(this.model.position))
	}

	roundBone(bone: THREE.Bone) {
		try {
			bone.rotation.copy(this.serializer.getRoundedBoneRotation(bone))
		} catch(ReferenceError) {
			console.warn(`Bone ${ bone.name } is not listed in bones config, passing...`)
		}
	}

}
