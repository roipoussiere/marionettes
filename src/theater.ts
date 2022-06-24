import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'


export const SPINNER_CLASS = 'body-posture-spinner'
export const POINTER_SENSIBILITY = 0.5
export const TAU = Math.PI * 2.0

// Set axe orientation and axes constraints for each bone (tbc)
const bone_axes: { [id: string] : string } = {
	mixamorigHips: 'vh_',
	mixamorigSpine: 'vh_',
	mixamorigSpine1: 'vh_',
	mixamorigSpine2: 'vh_',
	mixamorigNeck: 'v_H',
	mixamorigHead: 'v_H',
	mixamorigHeadTop_End: '___',
	mixamorigLeftEye: '___',
	mixamorigRightEye: '___',
	mixamorigLeftShoulder: '_hV',
	mixamorigLeftArm: '_hV',
	mixamorigLeftForeArm: '__V',
	mixamorigLeftHand: '_hV',
	mixamorigLeftHandRing1: '_hV',
	mixamorigLeftHandRing2: '__V',
	mixamorigLeftHandRing3: '__V',
	mixamorigLeftHandRing4: '___',
	mixamorigLeftHandIndex1: '_hV',
	mixamorigLeftHandIndex2: '__V',
	mixamorigLeftHandIndex3: '__V',
	mixamorigLeftHandIndex4: '___',
	mixamorigLeftHandThumb1: '_hV',
	mixamorigLeftHandThumb2: '__V',
	mixamorigLeftHandThumb3: '__V',
	mixamorigLeftHandThumb4: '___',
	mixamorigLeftHandMiddle1: '_hV',
	mixamorigLeftHandMiddle2: '__V',
	mixamorigLeftHandMiddle3: '__V',
	mixamorigLeftHandMiddle4: '___',
	mixamorigLeftHandPinky1: '_hV',
	mixamorigLeftHandPinky2: '__V',
	mixamorigLeftHandPinky3: '__V',
	mixamorigLeftHandPinky4: '___',
	mixamorigRightShoulder: '_hv',
	mixamorigRightArm: '_hv',
	mixamorigRightForeArm: '__v',
	mixamorigRightHand: '_hv',
	mixamorigRightHandPinky1: '_hv',
	mixamorigRightHandPinky2: '__v',
	mixamorigRightHandPinky3: '__v',
	mixamorigRightHandPinky4: '___',
	mixamorigRightHandRing1: '_hv',
	mixamorigRightHandRing2: '__v',
	mixamorigRightHandRing3: '__v',
	mixamorigRightHandRing4: '___',
	mixamorigRightHandMiddle1: '_hv',
	mixamorigRightHandMiddle2: '__v',
	mixamorigRightHandMiddle3: '__v',
	mixamorigRightHandMiddle4: '___',
	mixamorigRightHandIndex1: '_hv',
	mixamorigRightHandIndex2: '__v',
	mixamorigRightHandIndex3: '__v',
	mixamorigRightHandIndex4: '___',
	mixamorigRightHandThumb1: '_hv',
	mixamorigRightHandThumb2: '__v',
	mixamorigRightHandThumb3: '___',
	mixamorigRightHandThumb4: '___',
	mixamorigLeftUpLeg: 'v_h',
	mixamorigLeftLeg: 'v__',
	mixamorigLeftFoot: 'vh_',
	mixamorigLeftToeBase: 'v__',
	mixamorigLeftToe_End: 'v__',
	mixamorigRightUpLeg: 'v_h',
	mixamorigRightLeg: 'v__',
	mixamorigRightFoot: 'vh_',
	mixamorigRightToeBase: 'v__',
	mixamorigRightToe_End: 'v__',
}

export class Theater {
	canvas: HTMLCanvasElement
	canvas_origin: THREE.Vector2
	canvas_size: THREE.Vector2  // /!. Stale, see #getCanvasSize()
	dragStart: THREE.Vector2
	dragDelta: THREE.Vector2
	renderer: THREE.WebGLRenderer
	camera: THREE.Camera
	scene: THREE.Scene
	control: OrbitControls
	bones: { [id: string] : THREE.Bone }
	bone_handles: Array<THREE.Object3D>
	clickedJoint: THREE.Object3D

	constructor(canvas_id: string) {
		this.canvas = <HTMLCanvasElement> document.getElementById(canvas_id)
		const canvas_brect = this.canvas.getBoundingClientRect()
		this.canvas_origin = new THREE.Vector2(canvas_brect.left-1, canvas_brect.top).ceil()
		this.canvas_size = new THREE.Vector2(this.canvas.width, this.canvas.height)
		this.dragStart = new THREE.Vector2(0, 0)
		this.dragDelta = new THREE.Vector2(0, 0)

		this.#addSpinner()

		this.canvas.addEventListener('mousedown', e => this.onPress(e))
		this.canvas.addEventListener('touchend' , e => this.onPress(e, true))
		this.canvas.addEventListener('mouseup'  , e => this.onRelease(e))
		this.canvas.addEventListener('mousemove', e => this.onMove(e))

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
		this.clickedJoint = new THREE.Object3D()
	}

	init() {
        // Could be accessors?
        const model_joints = <THREE.SkinnedMesh> this.scene.getObjectByName("Beta_Joints")
        // const model_surface = <SkinnedMesh> this.scene.getObjectByName("Beta_Surface")
        // model_joints.skeleton.bones.forEach(bone => bone.removeFromParent())
        // model_joints.removeFromParent()
        // this.scene.remove(model_joints)

		let bone: THREE.Bone

		this.scene.children.forEach(child => {
			if (child instanceof THREE.Group) {
				child.traverse(grand_child => {
					if (grand_child instanceof THREE.Bone) {
						bone = <THREE.Bone> grand_child
						this.bones[grand_child.name] = bone
						// this.bones[grand_child.id] = bone

                        // const handlePosition = bone.getWorldPosition(new THREE.Vector3())
						// this.bone_handles.push(this.#makeBoneHandle(bone))

						// That one is NOT updated when the bone moves, for simplicity now
						// this.#hintLine(new THREE.Vector3(0.0, 10.0, 0.0), handlePosition)
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

	onMove(event: MouseEvent) {
		if ( ! this.control.enabled) {
			const pointer = new THREE.Vector2(event.clientX, event.clientY)
			this.dragDelta = this.getPositionOnCanvas(pointer).sub(this.dragStart)
		}
	}

	getPositionOnCanvas(pointer: THREE.Vector2) {
		return pointer.sub(this.canvas_origin).divide(this.#getCanvasSize())
	}

	onPress(event: UIEvent, touch = false) {
		const target = touch ? (<TouchEvent> event).changedTouches[0] : <MouseEvent> event
		const pointer = new THREE.Vector2(target.clientX, target.clientY)

		this.dragStart = this.getPositionOnCanvas(pointer)
		this.dragDelta.set(0, 0)
		this.raycast()
	}

	onRelease(event: UIEvent) {
		this.control.enabled = true
	}

	raycast() {
		const raycaster = new THREE.Raycaster()
		raycaster.setFromCamera({
			x: 2 * this.dragStart.x - 1,
			y:-2 * this.dragStart.y + 1},
		this.camera);

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

	onBoneClicked(intersect: THREE.Intersection) {
		this.control.enabled = false
		console.log("intersecting at", intersect.point, intersect.face)

		// Find the closest bone
		let closestBoneName = ""
		let closestBoneDistance = Infinity
		for (let boneName in this.bones) {
			const bone = this.bones[boneName]
			const distance = (bone.getWorldPosition(new THREE.Vector3()).sub(intersect.point)).length()
			if (distance < closestBoneDistance && bone.parent) {
				this.clickedJoint = bone.parent
				closestBoneName = boneName
				closestBoneDistance = distance
			}
		}
		console.info("Selected joint", closestBoneName, this.clickedJoint)

		// closestBone.position.applyAxisAngle(raycaster.ray.direction, TAU*0.1)
		// closestBone.position.applyAxisAngle(new THREE.Vector3(0., 0., 1.), TAU*0.1)
		// closestBone.position.add(new THREE.Vector3(0., 2.0, 0.))

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

	render() {
		let axe = 'x' // todo ui to select axe (x, y or z)
		if( ! this.control.enabled && this.clickedJoint.parent) {
			// let cam = this.control.getAzimuthalAngle()
			const distance: { [id: string] : number } = {
				h:   this.dragDelta.x * POINTER_SENSIBILITY,
				v:   this.dragDelta.y * POINTER_SENSIBILITY,
				H: - this.dragDelta.x * POINTER_SENSIBILITY,
				V: - this.dragDelta.y * POINTER_SENSIBILITY,
				_: 0
			}
			const [x, y, z] = bone_axes[this.clickedJoint.parent.name] || '___'

			// todo: move according to angle from dragStart to current pos
			// from the camera point of view
			this.clickedJoint.parent.rotateX(distance[x])
			this.clickedJoint.parent.rotateY(distance[y])
			this.clickedJoint.parent.rotateZ(distance[z])
		}
		this.renderer.render(this.scene, this.camera)
	}

	#getCanvasSize() {
		return new THREE.Vector2(this.canvas.width, this.canvas.height)
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

	#hintPoint(position: THREE.Vector3, color: THREE.Color = new THREE.Color(0xff3399)) {
		let sceneGeometry = new THREE.SphereGeometry( 0.03);
		let sceneMaterial = new THREE.MeshBasicMaterial( { color } );
		let sphere = new THREE.Mesh(sceneGeometry, sceneMaterial);
		sphere.position.add(position)
		sphere.name = "PointHint"
		this.scene.add(sphere)
	}

	#hintLine(start: THREE.Vector3, end: THREE.Vector3, color: THREE.Color = new THREE.Color(0xff9933)) {
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
