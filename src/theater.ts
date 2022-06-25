import * as THREE from 'three'
import { Vector2 as V2, Vector3 as V3 } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { bones_config } from './bones_config'

export const SPINNER_CLASS = 'body-posture-spinner'
export const POINTER_SENSIBILITY = 1.0
export const TAU = Math.PI * 2.0
export const BONES_NAME_PREFIX = 'mixamorig'


export class Theater {
	pointer: V2 // normalized
	pointer_delta: V2
	canvas: HTMLCanvasElement
	canvas_origin: V2
	axe_modifier_id: number // one in [0, 1, 2]
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
		this.axe_modifier_id = 0

		this.#addSpinner()

		this.canvas.addEventListener('mousemove',  e  => this.#onPointerMove(e))
		this.canvas.addEventListener('mousedown',  () => this.#onPointerPress())
		this.canvas.addEventListener('mouseup'  ,  () => this.#onPointerRelease())

		this.canvas.addEventListener('touchmove',  e  => this.#onPointerMove(e, true))
		this.canvas.addEventListener('touchstart', () => this.#onPointerPress())
		this.canvas.addEventListener('touchend' ,  () => this.#onPointerRelease())

		document.addEventListener('keydown',    e  => this.#onKeyPress(e))
		document.addEventListener('keyup',      () => this.#onKeyRelease())

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

	get canvas_size() {
		return new V2(this.canvas.width, this.canvas.height)
	}

	init() {
		let bone: THREE.Bone

		this.scene.children.forEach(child => {
			if (child instanceof THREE.Group) {
				child.traverse(grand_child => {
					if (grand_child instanceof THREE.Bone) {
						bone = <THREE.Bone> grand_child
						this.bones[grand_child.name] = bone
						// this.bones[grand_child.id] = bone
					}
				})
			}
        })

		console.log(Object.keys(this.bones))
	}

	addObject(object: THREE.Object3D) {
		this.scene.add(object)
	}

	render() {
		this.renderer.render(this.scene, this.camera)
	}

	#onPointerMove(event: UIEvent, touch = false) {
		const target = touch ? (<TouchEvent> event).changedTouches[0] : <MouseEvent> event
		this.pointer_delta = this.pointer.clone()

		this.pointer
			.set(target.clientX, target.clientY)
			.sub(this.canvas_origin)
			.divide(this.canvas_size)
		this.pointer.set(2 * this.pointer.x - 1, -2 * this.pointer.y + 1)

		this.pointer_delta.sub(this.pointer).multiplyScalar(POINTER_SENSIBILITY)

		if ( ! this.control.enabled) {
			this.#applyBoneRotation()
		}
	}

	#onPointerPress() {
		this.#raycast()
	}

	#onPointerRelease() {
		this.control.enabled = true
	}

	#onKeyPress(event: KeyboardEvent) {
		if (event.ctrlKey) {
			this.axe_modifier_id = 1
		} else if (event.shiftKey) {
			this.axe_modifier_id = 2
		}
	}

	#onKeyRelease() {
		this.axe_modifier_id = 0
	}

	#onBoneClicked(intersect: THREE.Intersection) {
		this.control.enabled = false
		this.clicked_joint = this.#findClosestJoint(intersect.point)
		this.init_joint_rotation = this.clicked_joint.rotation

		// console.log('intersecting at', intersect.point, intersect.face)
		// console.info('Selected joint:', this.clicked_joint)
	}

	#raycast() {
		const raycaster = new THREE.Raycaster()
		raycaster.setFromCamera(this.pointer, this.camera);

		// Bones do not have geometry or volume so the Raycaster cannot intersect them.
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

		const intersects = raycaster.intersectObjects(handles, true)
		if (intersects.length > 0) {
			this.#onBoneClicked(intersects[0])
		}
	}

	#findClosestJoint(point: V3) {
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

	#applyBoneRotation() {
		// Rotations are non-commutative, so rotating on both x/y with cursor
		// will lead to unexpected results (ie. rotation on z)
		let delta = this.pointer_delta.x + this.pointer_delta.y

		// todo: move according to camera point of view, something like:
		// const plane = this.camera.position.clone().normalize()
		// this.clicked_joint.rotateOnAxis(plane, 0.1)

		const bone_name = this.clicked_joint.name.substring(BONES_NAME_PREFIX.length)
		if ( ! (bone_name in bones_config)) {
			return
		}
		const bone_config = bones_config[bone_name]

		delta *= bone_config.reverse ? -1 : 1
		const axe = bone_config.axes[this.axe_modifier_id]

		const rotation = new V3()
			.setFromEuler(this.clicked_joint.rotation)
			.add(new V3(
				axe == 'x' ? delta : 0,
				axe == 'y' ? delta : 0,
				axe == 'z' ? delta : 0
			))
			.clamp(bone_config.min_angle, bone_config.max_angle)

		console.log(
			   `${this.clicked_joint.name.substring(BONES_NAME_PREFIX.length)}: `
		    + `(${Math.round(rotation.x * THREE.MathUtils.RAD2DEG)}, `
			+  `${Math.round(rotation.y * THREE.MathUtils.RAD2DEG)}, `
			+  `${Math.round(rotation.z * THREE.MathUtils.RAD2DEG)})`
		)
		const euler_rotation = new THREE.Euler().setFromVector3(rotation)
		this.clicked_joint.setRotationFromEuler(euler_rotation)
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
