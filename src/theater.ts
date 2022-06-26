import * as THREE from 'three'
import { Vector2 as V2 } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Marionette } from './marionette'


export const POINTER_SENSIBILITY = 1.0
export const TAU = Math.PI * 2.0
export const SPINNER_CLASS = 'body-posture-spinner'


export class Theater {
	pointer: V2 // normalized
	pointer_delta: V2
	canvas: HTMLCanvasElement
	canvas_origin: V2
	axe_modifier_id: number // one in [0, 1, 2]
	renderer: THREE.WebGLRenderer
	camera: THREE.Camera
	scene: THREE.Scene
	control: OrbitControls
	marionette: Marionette
	objects: THREE.Object3D[]

	constructor(canvas_id: string, marionette: Marionette) {
		this.canvas = <HTMLCanvasElement> document.getElementById(canvas_id)
		const canvas_brect = this.canvas.getBoundingClientRect()
		this.canvas_origin = new V2(canvas_brect.left - 1, canvas_brect.top).ceil()
		this.pointer = new V2(0, 0)
		this.pointer_delta = new V2(0, 0)
		this.axe_modifier_id = 0
		this.marionette = marionette

		this.#addSpinner()

		this.canvas.addEventListener('mousemove',  e  => this.#onPointerMove(e))
		this.canvas.addEventListener('mousedown',  () => this.#onPointerPress())
		this.canvas.addEventListener('mouseup'  ,  () => this.#onPointerRelease())

		this.canvas.addEventListener('touchmove',  e  => this.#onPointerMove(e, true))
		this.canvas.addEventListener('touchstart', () => this.#onPointerPress())
		this.canvas.addEventListener('touchend' ,  () => this.#onPointerRelease())

		document.addEventListener('keydown',       e  => this.#onKeyPress(e))
		document.addEventListener('keyup',         () => this.#onKeyRelease())

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
		this.objects = []
		this.control = new OrbitControls(this.camera, this.renderer.domElement)
	}

	get canvas_size() {
		return new V2(this.canvas.width, this.canvas.height)
	}

	init() {
		this.#addGrid()
		this.#addFloor()
		this.#addLights()
		// this.scene.add(new THREE.AxesHelper())
	}

	onModelLoaded(model: THREE.Group) {
		this.marionette.setModel(model)
		this.scene.add(this.marionette.model)
		this.objects = this.#getObjects()
		Array.from(document.getElementsByClassName(SPINNER_CLASS)).forEach(spinner => {
			spinner.remove()
		})

		// this.scene.add(new THREE.SkeletonHelper( model ));
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
			this.marionette.applyBoneRotation(this.pointer_delta, this.axe_modifier_id)
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

	#getObjects(): THREE.Object3D[] {
		let objects: THREE.Object3D[] = []
		this.scene.children.forEach(child => {
			if (child instanceof THREE.Group) {
				child.children.forEach(grandChild => {
					objects.push(<THREE.Object3D> grandChild)
				})
			}
		})

		console.log('model objects:', objects)
		return objects
	}

	#raycast() {
		const raycaster = new THREE.Raycaster()
		raycaster.setFromCamera(this.pointer, this.camera);

		// Bones do not have geometry or volume so the Raycaster cannot intersect them.
		// Solution: compare the clicked triangle position with each skeleton joint,
		//           get the bone with shorter distance.
		// if (0 < v1.dot(v2) < v3^2) // is the selected point in zone between v1 and v2?
		// sin(v1.angle(v2))*len

		const intersects = raycaster.intersectObjects(this.objects, true)
		if (intersects.length > 0) {
			this.control.enabled = false
			this.marionette.onBoneClicked(intersects[0])
		}
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

	#addGrid() {
		let grid = new THREE.GridHelper( 4, 20 )
		grid.name = 'grid'
		grid.position.y = 0.01
		this.scene.add(grid)
	}

	#addFloor() {
		let floorGeometry = new THREE.PlaneGeometry(5000, 5000, 1, 1);
		let floorMaterial = new THREE.MeshPhongMaterial({
			color: 0xeeeeee,
			shininess: 0
		});

		let floor = new THREE.Mesh(floorGeometry, floorMaterial);
		floor.name = 'floor'
		floor.rotation.x = -0.5 * Math.PI;
		floor.receiveShadow = true;
		floor.position.y = 0;
		this.scene.add(floor)
	}
		
	#addLights() {
		const ambientLight = new THREE.AmbientLight(new THREE.Color(0xffffff), 0.5)
		this.scene.add(ambientLight)

		const light = new THREE.PointLight(new THREE.Color(0xffffff), 0.5)
		light.position.set(10, 10, 0)
		this.scene.add(light)
	}
}
