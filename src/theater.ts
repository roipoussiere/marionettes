import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'


export const SPINNER_CLASS = 'body-posture-spinner'

export class Theater {
	canvas: HTMLCanvasElement
	canvas_origin: THREE.Vector2
	canvas_size: THREE.Vector2
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

		const window_aspect = window.innerWidth / window.innerHeight
		this.camera = new THREE.PerspectiveCamera(50, window_aspect)
		this.camera.position.set(5, 2, 0)

		this.scene = new THREE.Scene()

		this.control = new OrbitControls(this.camera, this.renderer.domElement)
		this.bones = {}
	}

	#hintLine(start: THREE.Vector3, end: THREE.Vector3, color: number) {
		const cylinderGeometry = new THREE.CylinderGeometry( 0.02, 0.01, length, 8 )
		const cylinderMaterial = new THREE.MeshBasicMaterial( {color} )
		const cylinder = new THREE.Mesh( cylinderGeometry, cylinderMaterial )

		// ...

		this.scene.add(cylinder)
	}

	init() {
		let bone: THREE.Bone

		this.scene.children.forEach(child => {
			if(child instanceof THREE.Group) {
				child.traverse(grand_child => {
					if (grand_child instanceof THREE.Bone) {
						bone = <THREE.Bone> grand_child
						this.bones[grand_child.name] = bone
					}
				})
			}
		})
	}

	raycast(event: UIEvent, touch = false) {
		const target = touch ? (<TouchEvent> event).changedTouches[0] : <MouseEvent> event
		let pointer = new THREE.Vector2(target.clientX, target.clientY)
			.sub(this.canvas_origin)
			.divide(this.canvas_size)
		pointer.set(2 * pointer.x - 1, -2 * pointer.y + 1)

		const raycaster = new THREE.Raycaster()
		raycaster.setFromCamera(pointer, this.camera);
		// console.log(pointer)
		// Bones do not have geometry or volume, and the Raycaster cannot intersect them.
		// Solution: compare the clicked triangle position with each skeleton joint,
		//           get the bone with shorter distance.
		// if (0 < v1.dot(v2) < v3^2) // is the selected point in zone between v1 and v2?
		// sin(v1.angle(v2))*len

		let models:Array<THREE.Object3D> = []
		this.scene.children.forEach(child => {
			if(child instanceof THREE.Group) {
				child.children.forEach(grandChild => {
					models.push(<THREE.Object3D> grandChild)
				})
			}
		})

		console.log('models:', models)

		const intersects = raycaster.intersectObjects(this.scene.children)

		console.log('intersects:', intersects)
		intersects.forEach(intersect => {
			console.log(intersect)
		})
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
