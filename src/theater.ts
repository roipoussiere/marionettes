import * as THREE from 'three'
import { Vector2 as V2, Vector3 as V3 } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'


export const SPINNER_CLASS = 'body-posture-spinner'
export const POINTER_SENSIBILITY = 1.0
export const TAU = Math.PI * 2.0
export const BONES_NAME_PREFIX = 'mixamorig'

class BoneConfig {
	axes: string
	min_angle: V3
	max_angle: V3

	constructor(axes: string, min_angle: V3, max_angle: V3) {
		this.axes = axes
		this.min_angle = min_angle
		this.max_angle = max_angle
	}
}

// Set axe orientation and constraints for each bone
const bones_config: { [id: string] : BoneConfig } = {
	Hips:             new BoneConfig('vH_', new V3(), new V3()),
	Spine:            new BoneConfig('vH_', new V3(), new V3()),
	Spine1:           new BoneConfig('vH_', new V3(), new V3()),
	Spine2:           new BoneConfig('vH_', new V3(), new V3()),
	Neck:             new BoneConfig('v_h', new V3(), new V3()),
	Head:             new BoneConfig('v_h', new V3(), new V3()),

	LeftShoulder:     new BoneConfig('_HV', new V3(), new V3()),
	LeftArm:          new BoneConfig('_HV', new V3(), new V3()),
	LeftForeArm:      new BoneConfig('__V', new V3(), new V3()),
	LeftHand:         new BoneConfig('_HV', new V3(), new V3()),
	LeftHandRing1:    new BoneConfig('_HV', new V3(), new V3()),
	LeftHandRing2:    new BoneConfig('__V', new V3(), new V3()),
	LeftHandRing3:    new BoneConfig('__V', new V3(), new V3()),
	LeftHandIndex1:   new BoneConfig('_HV', new V3(), new V3()),
	LeftHandIndex2:   new BoneConfig('__V', new V3(), new V3()),
	LeftHandIndex3:   new BoneConfig('__V', new V3(), new V3()),
	LeftHandThumb1:   new BoneConfig('_HV', new V3(), new V3()),
	LeftHandThumb2:   new BoneConfig('__V', new V3(), new V3()),
	LeftHandMiddle1:  new BoneConfig('_HV', new V3(), new V3()),
	LeftHandMiddle2:  new BoneConfig('__V', new V3(), new V3()),
	LeftHandMiddle3:  new BoneConfig('__V', new V3(), new V3()),
	LeftHandPinky1:   new BoneConfig('_HV', new V3(), new V3()),
	LeftHandPinky2:   new BoneConfig('__V', new V3(), new V3()),
	LeftHandPinky3:   new BoneConfig('__V', new V3(), new V3()),

	RightShoulder:    new BoneConfig('_Hv', new V3(), new V3()),
	RightArm:         new BoneConfig('_Hv', new V3(), new V3()),
	RightForeArm:     new BoneConfig('__v', new V3(), new V3()),
	RightHand:        new BoneConfig('_Hv', new V3(), new V3()),
	RightHandPinky1:  new BoneConfig('_Hv', new V3(), new V3()),
	RightHandPinky2:  new BoneConfig('__v', new V3(), new V3()),
	RightHandPinky3:  new BoneConfig('__v', new V3(), new V3()),
	RightHandRing1:   new BoneConfig('_Hv', new V3(), new V3()),
	RightHandRing2:   new BoneConfig('__v', new V3(), new V3()),
	RightHandRing3:   new BoneConfig('__v', new V3(), new V3()),
	RightHandMiddle1: new BoneConfig('_Hv', new V3(), new V3()),
	RightHandMiddle2: new BoneConfig('__v', new V3(), new V3()),
	RightHandMiddle3: new BoneConfig('__v', new V3(), new V3()),
	RightHandIndex1:  new BoneConfig('_Hv', new V3(), new V3()),
	RightHandIndex2:  new BoneConfig('__v', new V3(), new V3()),
	RightHandIndex3:  new BoneConfig('__v', new V3(), new V3()),
	RightHandThumb1:  new BoneConfig('_Hv', new V3(), new V3()),
	RightHandThumb2:  new BoneConfig('__v', new V3(), new V3()),

	LeftUpLeg:        new BoneConfig('v_H', new V3(), new V3()),
	LeftLeg:          new BoneConfig('v__', new V3(), new V3()),
	LeftFoot:         new BoneConfig('vH_', new V3(), new V3()),
	LeftToeBase:      new BoneConfig('v__', new V3(), new V3()),
	LeftToe_End:      new BoneConfig('v__', new V3(), new V3()),

	RightUpLeg:       new BoneConfig('v_H', new V3(), new V3()),
	RightLeg:         new BoneConfig('v__', new V3(), new V3()),
	RightFoot:        new BoneConfig('vH_', new V3(), new V3()),
	RightToeBase:     new BoneConfig('v__', new V3(), new V3()),
	RightToe_End:     new BoneConfig('v__', new V3(), new V3()),

	// Ignored because not part of the x-bot model:
	// HeadTop_End,     LeftEye,         RightEye,       LeftHandThumb3,   RightHandThumb3,
	// LeftHandThumb4,  LeftHandRing4,   LeftHandIndex4, LeftHandMiddle4,  LeftHandPinky4,
	// RightHandThumb4, RightHandPinky4, RightHandRing4, RightHandMiddle4, RightHandIndex4,
}

export class Theater {
	pointer: V2 // normalized
	pointer_delta: V2
	canvas: HTMLCanvasElement
	canvas_origin: V2
	init_joint_rotation: THREE.Euler
	renderer: THREE.WebGLRenderer
	camera: THREE.Camera
	scene: THREE.Scene
	control: OrbitControls
	bones: { [id: string] : THREE.Bone }
	bone_handles: Array<THREE.Object3D>
	clicked_joint: THREE.Object3D

	constructor(canvas_id: string) {
		this.canvas = <HTMLCanvasElement> document.getElementById(canvas_id)
		const canvas_brect = this.canvas.getBoundingClientRect()
		this.canvas_origin = new V2(canvas_brect.left - 1, canvas_brect.top).ceil()
		this.init_joint_rotation = new THREE.Euler(0, 0, 0)
		this.pointer = new V2(0, 0)
		this.pointer_delta = new V2(0, 0)

		this.#addSpinner()

		this.canvas.addEventListener('mousedown', () => this.onPress())
		this.canvas.addEventListener('mouseup'  , () => this.onRelease())
		this.canvas.addEventListener('mousemove', e => this.onMove(e))

		this.canvas.addEventListener('touchstart', () => this.onPress())
		this.canvas.addEventListener('touchend' , () => this.onRelease())
		this.canvas.addEventListener('touchmove', e => this.onMove(e, true))

		this.renderer = new THREE.WebGLRenderer({
			canvas: this.canvas,
			antialias: true
		})
		this.renderer.setSize(this.canvas.width, this.canvas.height)
		this.renderer.shadowMap.enabled = true;

		this.camera = new THREE.PerspectiveCamera(
		    45,
            this.canvas.width / this.canvas.height
        )
		this.camera.position.set(0, 2, 5)

		this.scene = new THREE.Scene()

		this.control = new OrbitControls(this.camera, this.renderer.domElement)
		this.bones = {}
		this.bone_handles = []
		this.clicked_joint = new THREE.Object3D()
	}

	init() {
        // Could be accessors?
        const model_joints = <THREE.SkinnedMesh> this.scene.getObjectByName("Beta_Joints")
        // const model_surface = <SkinnedMesh> this.scene.getObjectByName("Beta_Surface")

		let bone: THREE.Bone

		this.scene.children.forEach(child => {
			if (child instanceof THREE.Group) {
				child.traverse(grand_child => {
					if (grand_child instanceof THREE.Bone) {
						bone = <THREE.Bone> grand_child
						this.bones[grand_child.name] = bone
						// this.bones[grand_child.id] = bone

                        // const handlePosition = bone.getWorldPosition(new V3())
						// this.bone_handles.push(this.#makeBoneHandle(bone))

						// That one is NOT updated when the bone moves, for simplicity now
						// this.#hintLine(new V3(0.0, 10.0, 0.0), handlePosition)
					} else {
					    // There's a Group in here as well (?)
					    console.debug("Skipping not bone", grand_child)
                    }
				})
			} else {
				// Lights, Grid helper, etc.
				//console.debug("Skipping child:", child)
			}


        })

		console.log(Object.keys(this.bones))

		// Dump the scene tree
		// this.scene.traverse( obj => {
		// 	let s = '|___';
		// 	let obj2 = obj;
		// 	while ( obj2 !== this.scene ) {
		// 		s = '\t' + s;
		// 		if (obj2.parent !== null) {
		// 			obj2 = obj2.parent;
		// 		} else {
		// 			break
		// 		}
		// 	}
		// 	console.log( s + obj.name + ' <' + obj.type + '>' );
		// });

		// Neat use of console.group, if we can translate this to ts
		// (function printGraph( obj ) {
		// 	console.group( ' <%o> ' + obj.name, obj );
		// 	obj.children.forEach( printGraph );
		// 	console.groupEnd();
		// } ( this.scene ) );
	}

	onMove(event: UIEvent, touch = false) {
		const target = touch ? (<TouchEvent> event).changedTouches[0] : <MouseEvent> event
		this.pointer_delta = this.pointer.clone()

		this.pointer
			.set(target.clientX, target.clientY)
			.sub(this.canvas_origin)
			.divide(this.canvas_size)
		this.pointer.set(2 * this.pointer.x - 1, -2 * this.pointer.y + 1)

		this.pointer_delta.sub(this.pointer).multiplyScalar(POINTER_SENSIBILITY)

		if ( ! this.control.enabled) {
			this.applyBoneRotation()
		}
	}

	onPress() {
		this.raycast()
	}

	onRelease() {
		this.control.enabled = true
	}

	raycast() {
		const raycaster = new THREE.Raycaster()
		raycaster.setFromCamera(this.pointer, this.camera);

		// Bones do not have geometry or volume, and the Raycaster cannot intersect them.
		// Solution: compare the clicked triangle position with each skeleton joint,
		//           get the bone with shorter distance.
		// if (0 < v1.dot(v2) < v3^2) // is the selected point in zone between v1 and v2?
		// sin(v1.angle(v2))*len

		let handles: Array<THREE.Object3D> = []
		this.scene.children.forEach(child => {
			if (child instanceof THREE.Group) {
				child.children.forEach(grandChild => {
					handles.push(<THREE.Object3D> grandChild)
				})
			}
		})

		// console.log('handles:', handles)
		const intersects = raycaster.intersectObjects(handles, true)

		console.log('intersects:', intersects)

		if (intersects.length > 0) {
		// intersects.forEach(intersect => {
			this.onBoneClicked(intersects[0])
		// })
		}
	}

	findClosestJoint(point: V3) {
		let closest_joint = new THREE.Object3D
		let position = new V3()
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

	onBoneClicked(intersect: THREE.Intersection) {
		this.control.enabled = false
		console.log('intersecting at', intersect.point, intersect.face)

		this.clicked_joint = this.findClosestJoint(intersect.point)
		console.info('Selected joint:', this.clicked_joint)

		this.init_joint_rotation = this.clicked_joint.rotation
		// closestBone.position.applyAxisAngle(raycaster.ray.direction, TAU*0.1)
		// closestBone.position.applyAxisAngle(new V3(0., 0., 1.), TAU*0.1)
		// closestBone.position.add(new V3(0., 2.0, 0.))

		// Could be accessors?
		// const model_joints = <SkinnedMesh> this.scene.getObjectByName("Beta_Joints")
		// const model_surface = <SkinnedMesh> this.scene.getObjectByName("Beta_Surface")

		// Does not seem like we need this
		// model_joints.skeleton.update()
		// model_surface.skeleton.update()
	}

	addObject(object: THREE.Object3D) {
		this.scene.add(object)
	}

	applyBoneRotation() {
		// const plane = this.camera.position.clone().normalize()
		// this.clicked_joint.rotateOnAxis(plane, 0.1)

		const delta: { [id: string] : number } = {
			h:   this.pointer_delta.x,
			v:   this.pointer_delta.y,
			H: - this.pointer_delta.x,
			V: - this.pointer_delta.y,
			_: 0
		}

		const bone_name = this.clicked_joint.name.substring(BONES_NAME_PREFIX.length)
		if ( ! (bone_name in bones_config)) {
			return
		}
		const bone_config = bones_config[bone_name]

		// todo: move according to angle from dragStart to current pos
		// from the camera point of view
		
		this.clicked_joint.rotateX(delta[bone_config.axes[0]])
		this.clicked_joint.rotateY(delta[bone_config.axes[1]])
		this.clicked_joint.rotateZ(delta[bone_config.axes[2]])
	}

	render() {
		this.renderer.render(this.scene, this.camera)
	}

	get canvas_size() {
		return new V2(this.canvas.width, this.canvas.height)
	}

	#makeBoneHandle(bone: THREE.Bone, color: THREE.Color = new THREE.Color(0xff3399)) {
		let sceneGeometry = new THREE.SphereGeometry( 2.00);
		let sceneMaterial = new THREE.MeshBasicMaterial( { color } );
		let sphere = new THREE.Mesh(sceneGeometry, sceneMaterial);
		sphere.name = "BoneHandle"
		// Careful, the bone is submitted to intense scaling, it appears.
		// Why isn't the scale normalized ?  WTF   Perhaps we should normalize our models first.
		bone.add(sphere)

		return sphere
	}

	#hintPoint(position: V3, color: THREE.Color = new THREE.Color(0xff3399)) {
		let sceneGeometry = new THREE.SphereGeometry( 0.03);
		let sceneMaterial = new THREE.MeshBasicMaterial( { color } );
		let sphere = new THREE.Mesh(sceneGeometry, sceneMaterial);
		sphere.position.add(position)
		sphere.name = "PointHint"
		this.scene.add(sphere)
	}

	#hintLine(start: V3, end: V3, color: THREE.Color = new THREE.Color(0xff9933)) {
		const line = new THREE.Object3D()
		const direction = end.clone().sub(start)
		const cylinderGeometry = new THREE.CylinderGeometry(
			0.001,
			0.001,
			direction.length(),
			6
		)
		const cylinderMaterial = new THREE.MeshBasicMaterial({color})
		const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial)

		cylinder.translateZ(direction.length() * 0.5)
		cylinder.rotateX(TAU / 4.0)

		line.name = "LineHint"
		line.add(cylinder)
		line.lookAt(direction)
        line.position.add(start)

		this.scene.add(line)
	}

	#addSpinner() {
		const canvasBRect = this.canvas.getBoundingClientRect();
		const size = Math.round(0.3 * Math.min(canvasBRect.width, canvasBRect.height))
		const left = Math.round(canvasBRect.left + canvasBRect.width  / 2 - size / 2)
		const right = Math.round(canvasBRect.top  + canvasBRect.height / 2 - size / 2)

		const spinner = document.createElement('div');
		spinner.classList.add(SPINNER_CLASS)
		spinner.style.cssText = `width: ${ size }px; height: ${ size  }px;`
		                      + `left: ${  left }px; top: ${    right }px;`;
		document.body.appendChild(spinner);
	}
}
