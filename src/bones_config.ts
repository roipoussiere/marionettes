import * as THREE from 'three'
import { Vector3 as V3 } from 'three'


export const BONES_NAME_PREFIX = 'mixamorig'


class BoneConfig {
	name: string
	axes: string
	min_angle: V3
	max_angle: V3
	reverse: boolean

	constructor(
			name: string,
			axes      = 'xyz',
			reverse   = false,
			min_angle = new V3(-360, -360, -360),
			max_angle = new V3( 360,  360,  360)) {
		this.name = name
		this.axes = axes
		this.min_angle = min_angle.multiplyScalar(THREE.MathUtils.DEG2RAD)
		this.max_angle = max_angle.multiplyScalar(THREE.MathUtils.DEG2RAD)
		this.reverse = reverse
	}
}

// Set axe orientation and constraints for each bone
export const bones_config: BoneConfig[] = [
	new BoneConfig('Hips',             'xyz'),
	new BoneConfig('Spine',            'xyz', false, new V3(-85 ,-35 ,-30 ), new V3(85 , 35 , 30 )),
	new BoneConfig('Spine1',           'xyz', false, new V3(-30 ,-35 ,-30 ), new V3(55 , 35 , 30 )),
	new BoneConfig('Spine2',           'xyz', false, new V3(-30 ,-35 ,-30 ), new V3(55 , 35 , 30 )),
	new BoneConfig('Neck',             'xyz', false, new V3(-50 ,-45 ,-40 ), new V3(30 , 45 , 40 )),
	new BoneConfig('Head',             'xyz', false, new V3(-50 ,-45 ,-40 ), new V3(30 , 45 , 40 )),

	new BoneConfig('LeftUpLeg',        'xzy', true , new V3(-155,-30 ,-15 ), new V3(85 , 30 , 2  )),
	new BoneConfig('LeftLeg',          'x__', false, new V3(0   , 0  , 0  ), new V3(150, 0  , 0  )),
	new BoneConfig('LeftFoot',         'xy_', false, new V3(-45 ,-85 , 0  ), new V3(55 , 40 , 0  )),
	new BoneConfig('LeftToeBase',      'x__', false, new V3(-15 , 0  , 0  ), new V3(65 , 0  , 0  )),

	new BoneConfig('RightUpLeg',       'xzy', true , new V3(-155,-30 ,-15 ), new V3(85 , 30 , 2  )),
	new BoneConfig('RightLeg',         'x__', false, new V3(0   , 0  , 0  ), new V3(150, 0  , 0  )),
	new BoneConfig('RightFoot',        'xy_', false, new V3(-45 ,-85 , 0  ), new V3(55 , 40 , 0  )),
	new BoneConfig('RightToeBase',     'x__', false, new V3(-15 , 0  , 0  ), new V3(65 , 0  , 0  )),

	new BoneConfig('LeftShoulder',     'zyx', false, new V3(-40 ,-60 ,-40 ), new V3(40 , 50 , 40 )),
	new BoneConfig('LeftArm',          'zyx', true , new V3(-180,-90 ,-105), new V3(0  , 90 , 40 )),
	new BoneConfig('LeftForeArm',      'z__', true , new V3( 0  , 0  , 0  ), new V3(0  , 0  , 160)),
	new BoneConfig('LeftHand',         'zyx', true , new V3(-20 ,-35 ,-90 ), new V3(180, 40 , 90 )),

	new BoneConfig('RightShoulder',    'zyx', false, new V3(-40 ,-60 ,-40 ), new V3(40 , 50 , 40 )),
	new BoneConfig('RightArm',         'zyx', false, new V3( 0  ,-90 ,-40 ), new V3(180, 90 , 105)),
	new BoneConfig('RightForeArm',     'z__', false, new V3( 0  , 0  , 0  ), new V3(0  , 0  , 160)),
	new BoneConfig('RightHand',        'zyx', false, new V3(-180 ,-35 ,-90), new V3(20,  40 , 90 )),

	new BoneConfig('LeftHandThumb1',   'yx_', true , new V3(-60 ,-40 , 0  ), new V3(20 , 20 , 0  )),
	new BoneConfig('LeftHandThumb2',   'y__', true , new V3( 0  ,-10 , 0  ), new V3(0  , 80 , 0  )),
	new BoneConfig('LeftHandThumb3',   'y__', true , new V3( 0  ,-50 , 0  ), new V3(0  , 90 , 0  )),
	new BoneConfig('LeftHandIndex1',   'zy_', true , new V3( 0  ,-30 ,-90 ), new V3(30 , 15 , 20 )),
	new BoneConfig('LeftHandIndex2',   'z__', true , new V3( 0  ,  0 ,-110), new V3(0  , 0  , 0  )),
	new BoneConfig('LeftHandIndex3',   'z__', true , new V3( 0  ,  0 ,-80 ), new V3(0  , 0  , 0  )),
	new BoneConfig('LeftHandMiddle1',  'zy_', true , new V3( 0  ,-30 ,-90 ), new V3(30 , 15 , 20 )),
	new BoneConfig('LeftHandMiddle2',  'z__', true , new V3( 0  ,  0 ,-110), new V3(0  , 0  , 0  )),
	new BoneConfig('LeftHandMiddle3',  'z__', true , new V3( 0  ,  0 ,-80 ), new V3(0  , 0  , 0  )),
	new BoneConfig('LeftHandRing1',    'zy_', true , new V3( 0  ,-15 ,-90 ), new V3(0  , 30 , 20 )),
	new BoneConfig('LeftHandRing2',    'z__', true , new V3( 0  ,  0 ,-110), new V3(0  , 0  , 0  )),
	new BoneConfig('LeftHandRing3',    'z__', true , new V3( 0  ,  0 ,-80 ), new V3(0  , 0  , 0  )),
	new BoneConfig('LeftHandPinky1',   'zy_', true , new V3( 0  ,-15 ,-90 ), new V3(0  , 30 , 20 )),
	new BoneConfig('LeftHandPinky2',   'z__', true , new V3( 0  ,  0 ,-110), new V3(0  , 0  , 0  )),
	new BoneConfig('LeftHandPinky3',   'z__', true , new V3( 0  ,  0 ,-80 ), new V3(0  , 0  , 0  )),

	new BoneConfig('RightHandThumb1',  'yx_', true , new V3(-20 ,-20 , 0  ), new V3(60 , 40 , 0  )),
	new BoneConfig('RightHandThumb2',  'y__', true , new V3( 0  ,-80 , 0  ), new V3(0  , 10 , 0  )),
	new BoneConfig('RightHandThumb3',  'y__', true , new V3( 0  ,-90 , 0  ), new V3(0  , 50 , 0  )),
	new BoneConfig('RightHandIndex1',  'zy_', true , new V3(-30 ,-15 ,-20 ), new V3(0  , 30 , 90 )),
	new BoneConfig('RightHandIndex2',  'z__', true , new V3( 0  ,  0 , 0  ), new V3(0  , 0  , 110)),
	new BoneConfig('RightHandIndex3',  'z__', true , new V3( 0  ,  0 , 0  ), new V3(0  , 0  , 80 )),
	new BoneConfig('RightHandMiddle1', 'zy_', true , new V3( 0  ,-15 ,-20 ), new V3(0  , 30 , 90 )),
	new BoneConfig('RightHandMiddle2', 'z__', true , new V3( 0  ,  0 , 0  ), new V3(0  , 0  , 110)),
	new BoneConfig('RightHandMiddle3', 'z__', true , new V3( 0  ,  0 , 0  ), new V3(0  , 0  , 80 )),
	new BoneConfig('RightHandRing1',   'zy_', true , new V3( 0  ,-30 ,-20 ), new V3(0  , 15 , 90 )),
	new BoneConfig('RightHandRing2',   'z__', true , new V3( 0  ,  0 , 0  ), new V3(0  , 0  , 110)),
	new BoneConfig('RightHandRing3',   'z__', true , new V3( 0  ,  0 , 0  ), new V3(0  , 0  , 80 )),
	new BoneConfig('RightHandPinky1',  'zy_', true , new V3( 0  ,-30 ,-20 ), new V3(0  , 15 , 90 )),
	new BoneConfig('RightHandPinky2',  'z__', true , new V3( 0  ,  0 , 0  ), new V3(0  , 0  , 110)),
	new BoneConfig('RightHandPinky3',  'z__', true , new V3( 0  ,  0 , 0  ), new V3(0  , 0  , 80 ))

	// Ignored because not part of the x-bot model:
	// HeadTop_End,     LeftEye,         RightEye,       LeftToe_End,      RightToe_End
	// LeftHandThumb4,  LeftHandRing4,   LeftHandIndex4, LeftHandMiddle4,  LeftHandPinky4,
	// RightHandThumb4, RightHandPinky4, RightHandRing4, RightHandMiddle4, RightHandIndex4,
]
