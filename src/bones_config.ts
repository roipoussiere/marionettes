import * as THREE from 'three'
import { Vector3 as V3 } from 'three'


export const MIN_POSITION = new THREE.Vector3(-2, -1, -2)
export const MAX_POSITION = new THREE.Vector3(2, 3, 2)


export class BoneNotFoundError extends Error {
	constructor(bone_name: string, details: string = '') {
		super(`Bone ${ bone_name } not found${ details ? ' ' + details : '' }`)
		this.name = 'BoneNotFoundError'
	}
}


type OnBone = (bone: THREE.Bone) => void


export class BoneConfig {
	name: string
	axes: string
	rotation_order: string
	reverse_direction: boolean
	min_angle: V3
	max_angle: V3

	constructor(
			name: string,
			axes = 'xyz',
			rotation_order = 'XYZ',
			reverse_direction = false,
			min_angle = new V3(-180, -180, -180),
			max_angle = new V3( 180,  180,  180)) {
		this.name = name
		this.axes = axes
		this.rotation_order = rotation_order
		this.min_angle = min_angle
		this.max_angle = max_angle
		this.reverse_direction = reverse_direction
	}
}

// Set axe orientation and constraints for each bone
export const bones: BoneConfig[] = [
	new BoneConfig('Hips'),
	new BoneConfig('Spine',            'xzy', 'XZY', false, new V3(-85 ,-35 ,-30 ), new V3(85 , 35 , 30 )),
	new BoneConfig('Spine1',           'xzy', 'XZY', false, new V3(-30 ,-35 ,-30 ), new V3(55 , 35 , 30 )),
	new BoneConfig('Spine2',           'xzy', 'XZY', false, new V3(-30 ,-35 ,-30 ), new V3(55 , 35 , 30 )),
	new BoneConfig('Neck',             'xz_', 'XZY', false, new V3(-50 ,-45 ,-40 ), new V3(30 , 45 , 40 )),
	new BoneConfig('Head',             'xzy', 'XZY', false, new V3(-50 ,-45 ,-40 ), new V3(30 , 45 , 40 )),

	new BoneConfig('LeftUpLeg',        'xzy', 'ZXY', true , new V3(-90 ,-30 ,-15 ), new V3(85 , 30 , 120)),
	new BoneConfig('LeftLeg',          'x__', 'XYZ', false, new V3(0   , 0  , 0  ), new V3(150, 0  , 0  )),
	new BoneConfig('LeftFoot',         'xy_', 'YZX', false, new V3(-45 ,-85 , 0  ), new V3(55 , 40 , 0  )),
	new BoneConfig('LeftToeBase',      'x__', 'XYZ', false, new V3(-15 , 0  , 0  ), new V3(65 , 0  , 0  )),

	new BoneConfig('RightUpLeg',       'xzy', 'ZXY', true , new V3(-90 ,-30 ,-120), new V3(85 , 30 , 15 )),
	new BoneConfig('RightLeg',         'x__', 'XYZ', false, new V3(0   , 0  , 0  ), new V3(150, 0  , 0  )),
	new BoneConfig('RightFoot',        'xy_', 'YZX', false, new V3(-45 ,-85 , 0  ), new V3(55 , 40 , 0  )),
	new BoneConfig('RightToeBase',     'x__', 'XYZ', false, new V3(-15 , 0  , 0  ), new V3(65 , 0  , 0  )),

	new BoneConfig('LeftShoulder',     'zyx', 'YZX', false, new V3(-40 ,-60 ,-40 ), new V3(40 , 50 , 40 )),
	new BoneConfig('LeftArm',          'zyx', 'YZX', true , new V3(-85 ,-85 ,-85 ), new V3(85 , 85 , 85 )),
	new BoneConfig('LeftForeArm',      'z__', 'XYZ', true , new V3( 0  , 0  , 0  ), new V3(0  , 0  , 160)),
	new BoneConfig('LeftHand',         'zyx', 'YZX', true , new V3(-20 ,-35 ,-90 ), new V3(180, 40 , 90 )),

	new BoneConfig('RightShoulder',    'zyx', 'YZX', false, new V3(-40 ,-60 ,-40 ), new V3(40 , 50 , 40 )),
	new BoneConfig('RightArm',         'zyx', 'YZX', false, new V3(-85 ,-85 ,-85 ), new V3(85 , 85 , 85 )),
	new BoneConfig('RightForeArm',     'z__', 'XYZ', false, new V3( 0  , 0  ,-160), new V3(0  , 0  , 0  )),
	new BoneConfig('RightHand',        'zyx', 'YZX', false, new V3(-180,-35 ,-90 ), new V3(20,  40 , 90 )),

	new BoneConfig('LeftHandThumb1',   'yx_', 'YZX', true , new V3(-60 ,-40 , 0  ), new V3(20 , 20 , 0  )),
	new BoneConfig('LeftHandThumb2',   'y__', 'XYZ', true , new V3( 0  ,-10 , 0  ), new V3(0  , 80 , 0  )),
	new BoneConfig('LeftHandThumb3',   'y__', 'XYZ', true , new V3( 0  ,-50 , 0  ), new V3(0  , 90 , 0  )),
	new BoneConfig('LeftHandIndex1',   'zy_', 'YZX', true , new V3( 0  ,-30 ,-90 ), new V3(30 , 15 , 20 )),
	new BoneConfig('LeftHandIndex2',   'z__', 'XYZ', true , new V3( 0  ,  0 ,-110), new V3(0  , 0  , 0  )),
	new BoneConfig('LeftHandIndex3',   'z__', 'XYZ', true , new V3( 0  ,  0 ,-80 ), new V3(0  , 0  , 0  )),
	new BoneConfig('LeftHandMiddle1',  'zy_', 'YZX', true , new V3( 0  ,-30 ,-90 ), new V3(30 , 15 , 20 )),
	new BoneConfig('LeftHandMiddle2',  'z__', 'XYZ', true , new V3( 0  ,  0 ,-110), new V3(0  , 0  , 0  )),
	new BoneConfig('LeftHandMiddle3',  'z__', 'XYZ', true , new V3( 0  ,  0 ,-80 ), new V3(0  , 0  , 0  )),
	new BoneConfig('LeftHandRing1',    'zy_', 'YZX', true , new V3( 0  ,-15 ,-90 ), new V3(0  , 30 , 20 )),
	new BoneConfig('LeftHandRing2',    'z__', 'XYZ', true , new V3( 0  ,  0 ,-110), new V3(0  , 0  , 0  )),
	new BoneConfig('LeftHandRing3',    'z__', 'XYZ', true , new V3( 0  ,  0 ,-80 ), new V3(0  , 0  , 0  )),
	new BoneConfig('LeftHandPinky1',   'zy_', 'YZX', true , new V3( 0  ,-15 ,-90 ), new V3(0  , 30 , 20 )),
	new BoneConfig('LeftHandPinky2',   'z__', 'XYZ', true , new V3( 0  ,  0 ,-110), new V3(0  , 0  , 0  )),
	new BoneConfig('LeftHandPinky3',   'z__', 'XYZ', true , new V3( 0  ,  0 ,-80 ), new V3(0  , 0  , 0  )),

	new BoneConfig('RightHandThumb1',  'yx_', 'YZX', true , new V3(-20 ,-20 , 0  ), new V3(60 , 40 , 0  )),
	new BoneConfig('RightHandThumb2',  'y__', 'XYZ', true , new V3( 0  ,-80 , 0  ), new V3(0  , 10 , 0  )),
	new BoneConfig('RightHandThumb3',  'y__', 'XYZ', true , new V3( 0  ,-90 , 0  ), new V3(0  , 50 , 0  )),
	new BoneConfig('RightHandIndex1',  'zy_', 'YZX', true , new V3(-30 ,-15 ,-20 ), new V3(0  , 30 , 90 )),
	new BoneConfig('RightHandIndex2',  'z__', 'XYZ', true , new V3( 0  ,  0 , 0  ), new V3(0  , 0  , 110)),
	new BoneConfig('RightHandIndex3',  'z__', 'XYZ', true , new V3( 0  ,  0 , 0  ), new V3(0  , 0  , 80 )),
	new BoneConfig('RightHandMiddle1', 'zy_', 'YZX', true , new V3( 0  ,-15 ,-20 ), new V3(0  , 30 , 90 )),
	new BoneConfig('RightHandMiddle2', 'z__', 'XYZ', true , new V3( 0  ,  0 , 0  ), new V3(0  , 0  , 110)),
	new BoneConfig('RightHandMiddle3', 'z__', 'XYZ', true , new V3( 0  ,  0 , 0  ), new V3(0  , 0  , 80 )),
	new BoneConfig('RightHandRing1',   'zy_', 'YZX', true , new V3( 0  ,-30 ,-20 ), new V3(0  , 15 , 90 )),
	new BoneConfig('RightHandRing2',   'z__', 'XYZ', true , new V3( 0  ,  0 , 0  ), new V3(0  , 0  , 110)),
	new BoneConfig('RightHandRing3',   'z__', 'XYZ', true , new V3( 0  ,  0 , 0  ), new V3(0  , 0  , 80 )),
	new BoneConfig('RightHandPinky1',  'zy_', 'YZX', true , new V3( 0  ,-30 ,-20 ), new V3(0  , 15 , 90 )),
	new BoneConfig('RightHandPinky2',  'z__', 'XYZ', true , new V3( 0  ,  0 , 0  ), new V3(0  , 0  , 110)),
	new BoneConfig('RightHandPinky3',  'z__', 'XYZ', true , new V3( 0  ,  0 , 0  ), new V3(0  , 0  , 80 ))

	// Not used:
	// HeadTop_End,     LeftEye,         RightEye,       LeftToe_End,      RightToe_End
	// LeftHandThumb4,  LeftHandRing4,   LeftHandIndex4, LeftHandMiddle4,  LeftHandPinky4,
	// RightHandThumb4, RightHandPinky4, RightHandRing4, RightHandMiddle4, RightHandIndex4,
]

export const NB_BONE_VALUES = bones
	.map(bone_config => bone_config.axes)
	.join('')
	.split('_')
	.join('')
	.length

export function fromName(bone_name: string): BoneConfig {
	const bone_config = bones.find(bone_config => bone_config.name == bone_name)
	if ( ! bone_config) {
		throw new BoneNotFoundError(bone_name)
	}
	return bone_config
}

export function forEachEnabledBone(skeleton: THREE.Skeleton, on_bone: OnBone) {
	bones.filter(bone => bone.name != 'Hips').forEach(bone_config => {
		const bone = skeleton.getBoneByName(bone_config.name)
		if (bone) {
			on_bone(bone)
		} else {
			throw new BoneNotFoundError(bone_config.name)
		}
	})
}
