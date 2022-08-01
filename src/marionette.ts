import * as THREE from 'three'

import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils'
import * as BonesConfig from './bones_config'
import { SkeletonSerializer } from './skeleton_serializer'


export const MODEL_NAME_PREFIX = 'model_'

const MIN_POS = new THREE.Vector3(-1.8, -1.8, -1.8)
const MAX_POS = new THREE.Vector3( 1.8,  1.8,  1.8)


type colored_segment = [ THREE.Vector3, THREE.Vector3, THREE.ColorRepresentation ]


export class Marionette {
    name: string
	default_pose: string
	skeleton: THREE.Skeleton
	focused_bone: THREE.Bone
	model: THREE.Group
	doing_something: boolean
	serializer: SkeletonSerializer
	bones_world_pos: { [id: string] : THREE.Vector3 }


	constructor(name: string, default_pose: string) {
        this.name = name
		this.default_pose = default_pose
		this.skeleton = new THREE.Skeleton([])
		this.focused_bone = new THREE.Bone()
		this.model = new THREE.Group()
		this.doing_something = false
		this.serializer = new SkeletonSerializer(MIN_POS, MAX_POS)
		this.bones_world_pos = {}
	}

	get root_bone(): THREE.Bone {
		return <THREE.Bone> this.model.children.find(child => child instanceof THREE.Bone)
	}

	onModelLoaded(model: THREE.Group) {
		this.model = <THREE.Group> SkeletonUtils.clone(model)
		this.model.name = MODEL_NAME_PREFIX + this.name

		this.root_bone.traverse(bone => {
			if (bone.parent && bone.name != bone.parent.name) {
				this.skeleton.bones.push(<THREE.Bone> bone)
				this.bones_world_pos[bone.name] = new THREE.Vector3()
			}
		})

		if ( this.skeleton.bones.length == 0 ) {
			throw(`Skeleton not found in the model.`)
		}

		this.resetPose()
		this.updateBonesWorldPos()
	}

	updateBonesWorldPos() {
		// need optimization: iterate from a specific bone instead over all bones
		this.skeleton.bones.forEach(bone => {
			bone.getWorldPosition(this.bones_world_pos[bone.name])
		})
	}

	findCorrespondingBone(target: THREE.Vector3): colored_segment[] {
		let min_height = Infinity
		let closest_bone = new THREE.Bone()
		const segments: { [id: string] : colored_segment } = {}

		this.skeleton.bones.forEach(bone => {
			if (bone.parent && bone.name != this.root_bone.name) {
				const start = this.bones_world_pos[bone.parent.name]
				const end = this.bones_world_pos[bone.name]

				const se = start.clone().sub(end)
				const st = start.clone().sub(target)
				
				const dot = se.dot(st)
				if (dot > 0) {
					segments[bone.name] = [ start, end, 0x888888 ]
					const alpha = se.angleTo(st)
					const st_len = st.length()
					const height = Math.sin(alpha) * st_len
					if (height < min_height) {
						min_height = height
						closest_bone = bone
					}
					// console.log('bone candidate:', bone.name, dot, height)
				}
			}
		})
		this.focused_bone = <THREE.Bone> closest_bone.parent
		segments[closest_bone.name][2] = 0xffffff
		return Object.values(segments)
	}

	resetPose() {
		this.loadFromString(this.default_pose)
	}

	loadFromString(str: string) {
		this.serializer.fromString(str)

		const bones_rotation = this.serializer.getBonesRotation()
		for (const [bone_name, bone_rotation] of Object.entries(bones_rotation)) {
			const bone = this.skeleton.getBoneByName(bone_name)
			if (bone) {
				bone.rotation.copy(bone_rotation)
			} else {
				throw new BonesConfig.BoneNotFoundError(bone_name)
			}
		}

		this.model.position.copy(this.serializer.getModelPosition())
	}

	toString(): string {
		return this.serializer.toString()
	}

	translateModel(pointer_delta: THREE.Vector2, axe_modifier_id: number) {
		if (axe_modifier_id == 0) {
			this.model.translateZ(pointer_delta.x + pointer_delta.y)
		} else if (axe_modifier_id == 1) {
			this.model.translateX(- pointer_delta.x - pointer_delta.y)
		} else if (axe_modifier_id == 2) {
			this.model.translateY(- pointer_delta.x - pointer_delta.y)
		}
		this.model.position.clamp(MIN_POS, MAX_POS)
		this.updateBonesWorldPos()
	}

	rotateModel(pointer_delta: THREE.Vector2, axe_modifier_id: number) {
		const root_bone = this.root_bone

		if (axe_modifier_id == 0) {
			root_bone.rotateX(pointer_delta.x + pointer_delta.y)
		} else if (axe_modifier_id == 1) {
			root_bone.rotateY(pointer_delta.x + pointer_delta.y)
		} else if (axe_modifier_id == 2) {
			root_bone.rotateZ(pointer_delta.x + pointer_delta.y)
		}
		this.updateBonesWorldPos()
	}

	rotateBone(pointer_delta: THREE.Vector2, axe_modifier_id: number) {
		const bone_config = BonesConfig.fromName(this.focused_bone.name)
		const axe = bone_config.axes[axe_modifier_id]
		const delta = (pointer_delta.x + pointer_delta.y) * (bone_config.reverse_direction ? -1 : 1)

		const rotation = new THREE.Vector3()
			.setFromEuler(this.focused_bone.rotation)
			.add(new THREE.Vector3(
				axe == 'x' ? delta : 0,
				axe == 'y' ? delta : 0,
				axe == 'z' ? delta : 0
			))
			.clamp(
				this.serializer.roundBoneRotation(bone_config.min_angle_rad),
				this.serializer.roundBoneRotation(bone_config.max_angle_rad)
			)

		const euler_rotation = new THREE.Euler().setFromVector3(rotation, bone_config.rotation_order)
		this.focused_bone.setRotationFromEuler(euler_rotation)
		this.updateBonesWorldPos()
	}

	updateFocusedBone(point: THREE.Vector3): THREE.Bone {
		this.findCorrespondingBone(point)

		const position = new THREE.Vector3()
		let closest_bone = new THREE.Bone
		let closest_distance = Infinity

		BonesConfig.forEachEnabledBone(this.skeleton, bone => {
			const distance = (bone.getWorldPosition(position).sub(point)).length()
			if (distance < closest_distance) {
				closest_bone = bone
				closest_distance = distance
			}
		})

		this.focused_bone = closest_bone
		return this.focused_bone
	}

	roundPosition() {
		this.serializer.loadModelPosition(this.model.position)
		this.model.position.copy(this.serializer.getModelPosition())
	}

	roundBone(bone: THREE.Bone) {
		try {
			this.serializer.loadBoneRotation(bone)
			bone.rotation.copy(this.serializer.getBoneRotation(bone.name))
		} catch(ReferenceError) {
			console.warn(`Bone ${ bone.name } is not listed in bones config, passing...`)
		}
	}

}
