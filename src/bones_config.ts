import * as THREE from 'three'
import { Vector3 as V3 } from 'three'


class BoneConfig {
	axes: string
	min_angle: V3
	max_angle: V3
	reverse: boolean

	constructor(
			axes      = 'zxy',
			reverse   = false,
			min_angle = new V3(-360, -360, -360),
			max_angle = new V3( 360,  360,  360)) {
		this.axes = axes
		this.min_angle = min_angle.multiplyScalar(THREE.MathUtils.DEG2RAD)
		this.max_angle = max_angle.multiplyScalar(THREE.MathUtils.DEG2RAD)
		this.reverse = reverse
	}
}

// Set axe orientation and constraints for each bone
export const bones_config: { [id: string] : BoneConfig } = {
	Hips:             new BoneConfig('xyz'),
	Spine:            new BoneConfig('xyz', false, new V3(-85 ,-35 ,-30 ), new V3(85 , 35 , 30 )),
	Spine1:           new BoneConfig('xyz', false, new V3(-30 ,-35 ,-30 ), new V3(55 , 35 , 30 )),
	Spine2:           new BoneConfig('xyz', false, new V3(-30 ,-35 ,-30 ), new V3(55 , 35 , 30 )),
	Neck:             new BoneConfig('xyz', false, new V3(-50 ,-45 ,-40 ), new V3(30 , 45 , 40 )),
	Head:             new BoneConfig('xyz', false, new V3(-50 ,-45 ,-40 ), new V3(30 , 45 , 40 )),

	LeftUpLeg:        new BoneConfig('xzy', true , new V3(-155,-30 ,-15 ), new V3(85 , 30 , 2  )),
	LeftLeg:          new BoneConfig('x__', false, new V3(0   , 0  , 0  ), new V3(150, 0  , 0  )),
	LeftFoot:         new BoneConfig('xy_', false, new V3(-45 ,-85 , 0  ), new V3(55 , 40 , 0  )),
	LeftToeBase:      new BoneConfig('x__', false, new V3(-15 , 0  , 0  ), new V3(65 , 0  , 0  )),

	RightUpLeg:       new BoneConfig('xzy', true , new V3(-155,-30 ,-15 ), new V3(85 , 30 , 2  )),
	RightLeg:         new BoneConfig('x__', false, new V3(0   , 0  , 0  ), new V3(150, 0  , 0  )),
	RightFoot:        new BoneConfig('xy_', false, new V3(-45 ,-85 , 0  ), new V3(55 , 40 , 0  )),
	RightToeBase:     new BoneConfig('x__', false, new V3(-15 , 0  , 0  ), new V3(65 , 0  , 0  )),

	LeftShoulder:     new BoneConfig('zyx', false, new V3(-40 ,-60 ,-40 ), new V3(40 , 50 , 40 )),
	LeftArm:          new BoneConfig('zyx', true , new V3(-180,-90 ,-105), new V3(0  , 90 , 40 )),
	LeftForeArm:      new BoneConfig('z__', true , new V3( 0  , 0  , 0  ), new V3(0  , 0  , 160)),
	LeftHand:         new BoneConfig('zyx', true , new V3(-20 ,-35 ,-90 ), new V3(180, 40 , 90 )),

	RightShoulder:    new BoneConfig('zyx', false, new V3(-40 ,-60 ,-40 ), new V3(40 , 50 , 40 )),
	RightArm:         new BoneConfig('zyx', false, new V3(-180,-90 ,-40 ), new V3(0  , 90 , 105)),
	RightForeArm:     new BoneConfig('z__', false, new V3( 0  , 0  ,-160), new V3(0  , 0  , 0  )),
	RightHand:        new BoneConfig('zyx', false, new V3(-20 ,-40 ,-90 ), new V3(180, 35 , 90 )),

	LeftHandThumb1:   new BoneConfig('yx_', true , new V3(-60 ,-40 , 0  ), new V3(20 , 20 , 0  )),
	LeftHandThumb2:   new BoneConfig('y__', true , new V3( 0  ,-10 , 0  ), new V3(0  , 80 , 0  )),
	LeftHandThumb3:   new BoneConfig('y__', true , new V3( 0  ,-50 , 0  ), new V3(0  , 90 , 0  )),
	LeftHandIndex1:   new BoneConfig('zy_', true , new V3( 0  ,-30 ,-90 ), new V3(30 , 15 , 20 )),
	LeftHandIndex2:   new BoneConfig('z__', true , new V3( 0  ,  0 ,-110), new V3(0  , 0  , 0  )),
	LeftHandIndex3:   new BoneConfig('z__', true , new V3( 0  ,  0 ,-80 ), new V3(0  , 0  , 0  )),
	LeftHandMiddle1:  new BoneConfig('zy_', true , new V3( 0  ,-30 ,-90 ), new V3(30 , 15 , 20 )),
	LeftHandMiddle2:  new BoneConfig('z__', true , new V3( 0  ,  0 ,-110), new V3(0  , 0  , 0  )),
	LeftHandMiddle3:  new BoneConfig('z__', true , new V3( 0  ,  0 ,-80 ), new V3(0  , 0  , 0  )),
	LeftHandRing1:    new BoneConfig('zy_', true , new V3( 0  ,-15 ,-90 ), new V3(0  , 30 , 20 )),
	LeftHandRing2:    new BoneConfig('z__', true , new V3( 0  ,  0 ,-110), new V3(0  , 0  , 0  )),
	LeftHandRing3:    new BoneConfig('z__', true , new V3( 0  ,  0 ,-80 ), new V3(0  , 0  , 0  )),
	LeftHandPinky1:   new BoneConfig('zy_', true , new V3( 0  ,-15 ,-90 ), new V3(0  , 30 , 20 )),
	LeftHandPinky2:   new BoneConfig('z__', true , new V3( 0  ,  0 ,-110), new V3(0  , 0  , 0  )),
	LeftHandPinky3:   new BoneConfig('z__', true , new V3( 0  ,  0 ,-80 ), new V3(0  , 0  , 0  )),

	RightHandThumb1:  new BoneConfig('yx_', true , new V3(-60 ,-40 , 0  ), new V3(20 , 20 , 0  )),
	RightHandThumb2:  new BoneConfig('y__', true , new V3( 0  ,-10 , 0  ), new V3(0  , 80 , 0  )),
	RightHandThumb3:  new BoneConfig('y__', true , new V3( 0  ,-50 , 0  ), new V3(0  , 90 , 0  )),
	RightHandIndex1:  new BoneConfig('zy_', true , new V3( 0  ,-30 ,-90 ), new V3(30 , 15 , 20 )),
	RightHandIndex2:  new BoneConfig('z__', true , new V3( 0  ,  0 ,-110), new V3(0  , 0  , 0  )),
	RightHandIndex3:  new BoneConfig('z__', true , new V3( 0  ,  0 ,-80 ), new V3(0  , 0  , 0  )),
	RightHandMiddle1: new BoneConfig('zy_', true , new V3( 0  ,-30 ,-90 ), new V3(0  , 15 , 20 )),
	RightHandMiddle2: new BoneConfig('z__', true , new V3( 0  ,  0 ,-110), new V3(0  , 0  , 0  )),
	RightHandMiddle3: new BoneConfig('z__', true , new V3( 0  ,  0 ,-80 ), new V3(0  , 0  , 0  )),
	RightHandRing1:   new BoneConfig('zy_', true , new V3( 0  ,-15 ,-90 ), new V3(0  , 30 , 20 )),
	RightHandRing2:   new BoneConfig('z__', true , new V3( 0  ,  0 ,-110), new V3(0  , 0  , 0  )),
	RightHandRing3:   new BoneConfig('z__', true , new V3( 0  ,  0 ,-80 ), new V3(0  , 0  , 0  )),
	RightHandPinky1:  new BoneConfig('zy_', true , new V3( 0  ,-15 ,-90 ), new V3(0  , 30 , 20 )),
	RightHandPinky2:  new BoneConfig('z__', true , new V3( 0  ,  0 ,-110), new V3(0  , 0  , 0  )),
	RightHandPinky3:  new BoneConfig('z__', true , new V3( 0  ,  0 ,-80 ), new V3(0  , 0  , 0  )),

	// Ignored because not part of the x-bot model:
	// HeadTop_End,     LeftEye,         RightEye,       LeftToe_End,      RightToe_End
	// LeftHandThumb4,  LeftHandRing4,   LeftHandIndex4, LeftHandMiddle4,  LeftHandPinky4,
	// RightHandThumb4, RightHandPinky4, RightHandRing4, RightHandMiddle4, RightHandIndex4,
}
