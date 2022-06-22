import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'


export const SPINNER_CLASS = 'body-posture-spinner'

export const TAU = Math.PI * 2.0

export class Theater {
	canvas: HTMLCanvasElement
	canvas_origin: THREE.Vector2
	canvas_size: THREE.Vector2  // /!. Stale, see #getCanvasSize()
	renderer: THREE.WebGLRenderer
	camera: THREE.Camera
	scene: THREE.Scene
	control: OrbitControls
	bones: { [id: string] : THREE.Bone }

	constructor(canvas_id: string) {
		this.canvas = <HTMLCanvasElement> document.getElementById(canvas_id)
		const canvas_brect = this.canvas.getBoundingClientRect()
		this.canvas_origin = new THREE.Vector2(canvas_brect.left-1, canvas_brect.top).ceil()
		this.canvas_size = new THREE.Vector2(this.canvas.width, this.canvas.height)

		this.#addSpinner()

		this.canvas.addEventListener('click'    , e => this.raycast(e));
		this.canvas.addEventListener('touchend' , e => this.raycast(e, true));
		// this.canvas.addEventListener('mousemove', e => this.onMouseMove(e));

		this.renderer = new THREE.WebGLRenderer({
			canvas: this.canvas,
			antialias: true
		})
		this.renderer.setSize(this.canvas.width, this.canvas.height)
		this.renderer.shadowMap.enabled = true;

		const window_aspect = this.canvas.width / this.canvas.height
		this.camera = new THREE.PerspectiveCamera(50, window_aspect)
		this.camera.position.set(5, 2, 0)

		this.scene = new THREE.Scene()

		this.control = new OrbitControls(this.camera, this.renderer.domElement)
		this.bones = {}
	}

	#getCanvasSize() {
		return new THREE.Vector2(this.canvas.width, this.canvas.height)
	}

	#hintLine(start: THREE.Vector3, end: THREE.Vector3, color: number) {
		const cylinderGeometry = new THREE.CylinderGeometry( 0.02, 0.01, length, 8 )
		const cylinderMaterial = new THREE.MeshBasicMaterial( {color} )
		const cylinder = new THREE.Mesh( cylinderGeometry, cylinderMaterial )

		// ...

		this.scene.add(cylinder)
	}

	#hintSphere(at: THREE.Vector3) {
		const sphereGeometry = new THREE.SphereGeometry(0.02)
		const sphereMaterial = new THREE.MeshBasicMaterial( {
			color: new THREE.Color(0xff3399),
		})
		const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial)
		sphereMesh.translateOnAxis(at.clone().normalize(), at.length())
		this.scene.add(sphereMesh)
	}

	init() {
		let bone: THREE.Bone

		this.scene.children.forEach(child => {
			if (child instanceof THREE.Group) {
				child.traverse(grand_child => {
					if (grand_child instanceof THREE.Bone) {
						bone = <THREE.Bone> grand_child
						this.bones[grand_child.name] = bone
						this.#hintSphere(bone.position)
					} else {
					    console.debug("Skipping not bone", grand_child)
                    }
				})
			}
		})
	}

	raycast(event: UIEvent, touch = false) {
		const target = touch ? (<TouchEvent> event).changedTouches[0] : <MouseEvent> event
		let pointer = new THREE.Vector2(target.clientX, target.clientY)
			.sub(this.canvas_origin)
			.divide(this.#getCanvasSize())
		pointer.set(2 * pointer.x - 1, -2 * pointer.y + 1)

		const raycaster = new THREE.Raycaster()
		raycaster.setFromCamera(pointer, this.camera);

		// Bones do not have geometry or volume, and the Raycaster cannot intersect them.
		// Solution: compare the clicked triangle position with each skeleton joint,
		//           get the bone with shorter distance.
		// if (0 < v1.dot(v2) < v3^2) // is the selected point in zone between v1 and v2?
		// sin(v1.angle(v2))*len

		let models:Array<THREE.Object3D> = []
		this.scene.children.forEach(child => {
			if (child instanceof THREE.Group) {
				child.children.forEach(grandChild => {
					models.push(<THREE.Object3D> grandChild)
				})
			}
		})

		// console.log('models:', models)

		const intersects = raycaster.intersectObjects(models, true)

		console.log('intersects:', intersects)

		if (intersects.length > 0) {
		// intersects.forEach(intersect => {

			const intersect = intersects[0]
			console.log("intersecting at", intersect.point, intersect.face)

			// Find the closest bone
			let closestBone = new THREE.Bone()
			let closestBoneName = ""
			let closestBoneDistance = Infinity
			for (let boneName in this.bones) {
				const bone = this.bones[boneName]
				const distance = (bone.position.sub(intersect.point)).length()
				if (distance < closestBoneDistance) {
					closestBone = bone
					closestBoneName = boneName
					closestBoneDistance = distance
				}
			}
			console.info("Selected bone", closestBoneName, closestBone)
			// This approach won't work because bones are not joints.


			// Experiment with bone
			closestBone.position.applyAxisAngle(raycaster.ray.direction, TAU*0.1)

		// })
		}
	}

	addObject(object: THREE.Object3D) {
		this.scene.add(object)
	}

	render() {
		this.renderer.render(this.scene, this.camera)
	}

	#hintPoint(position: THREE.Vector3, color: number) {
		let sceneGeometry = new THREE.SphereGeometry( 0.01, 32, 16 );
		let sceneMaterial = new THREE.MeshBasicMaterial( { color } );
		let sphere = new THREE.Mesh(sceneGeometry, sceneMaterial);
		sphere.position.add(position)
		this.scene.add(sphere)
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
