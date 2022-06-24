import * as THREE from 'three'
import { Vector2 as V2, Vector3 as V3 } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'


export const SPINNER_CLASS = 'body-posture-spinner'
export const POINTER_SENSIBILITY = 1.0
export const TAU = Math.PI * 2.0
export const BONES_NAME_PREFIX = 'mixamorig'

// Set axe orientation and axes constraints for each bone (tbc)
const bone_axes: { [id: string] : string } = {
	Hips: 'vH_',
	Spine: 'vH_',
	Spine1: 'vH_',
	Spine2: 'vH_',
	Neck: 'v_h',
	Head: 'v_h',

	LeftShoulder: '_HV',
	LeftArm: '_HV',
	LeftForeArm: '__V',
	LeftHand: '_HV',
	LeftHandRing1: '_HV',
	LeftHandRing2: '__V',
	LeftHandRing3: '__V',
	LeftHandIndex1: '_HV',
	LeftHandIndex2: '__V',
	LeftHandIndex3: '__V',
	LeftHandThumb1: '_HV',
	LeftHandThumb2: '__V',
	LeftHandMiddle1: '_HV',
	LeftHandMiddle2: '__V',
	LeftHandMiddle3: '__V',
	LeftHandPinky1: '_HV',
	LeftHandPinky2: '__V',
	LeftHandPinky3: '__V',

	RightShoulder: '_Hv',
	RightArm: '_Hv',
	RightForeArm: '__v',
	RightHand: '_Hv',
	RightHandPinky1: '_Hv',
	RightHandPinky2: '__v',
	RightHandPinky3: '__v',
	RightHandRing1: '_Hv',
	RightHandRing2: '__v',
	RightHandRing3: '__v',
	RightHandMiddle1: '_Hv',
	RightHandMiddle2: '__v',
	RightHandMiddle3: '__v',
	RightHandIndex1: '_Hv',
	RightHandIndex2: '__v',
	RightHandIndex3: '__v',
	RightHandThumb1: '_Hv',
	RightHandThumb2: '__v',

	LeftUpLeg: 'v_H',
	LeftLeg: 'v__',
	LeftFoot: 'vH_',
	LeftToeBase: 'v__',
	LeftToe_End: 'v__',

	RightUpLeg: 'v_H',
	RightLeg: 'v__',
	RightFoot: 'vH_',
	RightToeBase: 'v__',
	RightToe_End: 'v__',

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
		const [x, y, z] = bone_axes[bone_name] || '___'

		// todo: move according to angle from dragStart to current pos
		// from the camera point of view
		
		this.clicked_joint.rotateX(delta[x])
		this.clicked_joint.rotateY(delta[y])
		this.clicked_joint.rotateZ(delta[z])
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
