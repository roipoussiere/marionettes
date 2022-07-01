import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Marionette, MODEL_NAME_PREFIX } from './marionette'


export const SPINNER_CLASS = 'body-posture-spinner'

const POINTER_SENSIBILITY = 1.0


export class Theater {
	canvas: HTMLCanvasElement
	pointer: THREE.Vector2
	last_pointer: THREE.Vector2
	axe_modifier_id: number // one in [0, 1, 2]
	renderer: THREE.WebGLRenderer
	camera: THREE.Camera
	scene: THREE.Scene
	control: OrbitControls
	marionettes: { [id: string] : Marionette }
	meshes: THREE.SkinnedMesh[]
	clicked_marionette: Marionette | null
	handles: THREE.Group
	translate_mode: boolean

	constructor(canvas_id: string, marionettes: Marionette[]) {
		this.canvas = <HTMLCanvasElement> document.getElementById(canvas_id)
		this.#addSpinner()

		this.pointer = new THREE.Vector2(0, 0)
		this.last_pointer = new THREE.Vector2(0, 0)
		this.axe_modifier_id = 0
		this.clicked_marionette = null
		this.translate_mode = false

		this.marionettes = {}
		marionettes.forEach(marionette => {
			this.marionettes[marionette.name] = marionette
		})

		this.meshes = []

		this.canvas.addEventListener('mousemove',  e  => this.#onPointerMove(e))
		this.canvas.addEventListener('mousedown',  () => this.#onPointerPress())
		this.canvas.addEventListener('mouseup'  ,  () => this.#onPointerRelease())

		this.canvas.addEventListener('touchmove',  e  => this.#onPointerMove(e, true))
		this.canvas.addEventListener('touchstart', () => this.#onPointerPress())
		this.canvas.addEventListener('touchend' ,  () => this.#onPointerRelease())

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

		this.handles = new THREE.Group()
	}

	get canvas_origin(): THREE.Vector2 {
		const canvas_brect = this.canvas.getBoundingClientRect()
		return new THREE.Vector2(canvas_brect.left - 1, canvas_brect.top).ceil()
	}

	get canvas_size() {
		return new THREE.Vector2(this.canvas.width, this.canvas.height)
	}

	get handles_visibility(): boolean {
		return this.handles.visible
	}

	set handles_visibility(handles_visibility: boolean) {
		this.handles.visible = handles_visibility
	}

	get normalized_pointer(): THREE.Vector2 {
		const pointer = this.pointer.clone()
		this.#normalizePointer(pointer)
		return pointer
	}

	get pointer_delta(): THREE.Vector2 {
		const pointer_delta = this.last_pointer.clone()
		this.#normalizePointer(pointer_delta)

		pointer_delta
			.sub(this.normalized_pointer)
			.multiplyScalar(POINTER_SENSIBILITY)
		return pointer_delta
	}

	init() {
		this.#addHandles()
		this.#addGrid()
		this.#addFloor()
		this.#addLights()
		// this.scene.add(new THREE.AxesHelper())
	}

	onModelLoaded(model: THREE.Group) {
		Object.values(this.marionettes).forEach(marionette => {
			marionette.setModel(model)
			marionette.initHandles()

			this.scene.add(marionette.model)
			this.handles.add(marionette.handles)
			// this.scene.add( new THREE.SkeletonHelper( marionette.model ))

			this.#indexObjects()
		})

		Array.from(document.getElementsByClassName(SPINNER_CLASS)).forEach(spinner => {
			spinner.remove()
		})
	}

	render() {
		this.renderer.render(this.scene, this.camera)
	}

	#normalizePointer(pointer: THREE.Vector2) {
		pointer.sub(this.canvas_origin)
			.divide(this.canvas_size)
		pointer.set(2 * pointer.x - 1, -2 * pointer.y + 1)
	}

	#onPointerMove(event: UIEvent, touch = false) {
		const target = touch ? (<TouchEvent> event).changedTouches[0] : <MouseEvent> event
		this.last_pointer.copy(this.pointer)
		this.pointer.set(target.clientX, target.clientY)

		if ( ! this.control.enabled && this.clicked_marionette) {
			if (this.translate_mode) {
				this.clicked_marionette.translate(this.pointer_delta, this.axe_modifier_id)
			} else {
				this.clicked_marionette.rotateBone(this.pointer_delta, this.axe_modifier_id)
			}
			this.clicked_marionette.updateHandles()
		}
	}

	#onPointerPress() {
		this.#raycast()
	}

	#onPointerRelease() {
		if (this.clicked_marionette) {
			this.clicked_marionette.roundMovedBone()
			Object.values(this.marionettes).forEach(marionette => {
				console.log(`${marionette.name}: ${marionette.serializer.skeletonToString()}`)
			})
		}

		this.control.enabled = true
		this.clicked_marionette = null
	}

	#indexObjects() {
		this.scene.children.forEach(child => {
			if (child instanceof THREE.Group) {
				child.children.forEach(grand_child => {
					if(grand_child instanceof THREE.SkinnedMesh) {
						this.meshes.push(<THREE.SkinnedMesh> grand_child)
					}
				})
			}
		})
	}

	#raycast() {
		const raycaster = new THREE.Raycaster()
		raycaster.setFromCamera(this.normalized_pointer, this.camera);

		// Bones do not have geometry or volume so the Raycaster cannot intersect them.
		// Solution: compare the clicked triangle position with each skeleton joint,
		//           get the bone with shorter distance.
		// if (0 < v1.dot(v2) < v3^2) // is the selected point in zone between v1 and v2?
		// sin(v1.angle(v2))*len

		const intersects = raycaster.intersectObjects(this.meshes, true)
		if (intersects.length > 0 && intersects[0].object.parent) {
			// console.log('intersect:', intersects[0])
			this.control.enabled = false
			const clicked_marionette_name = intersects[0].object.parent.name
				.substring(MODEL_NAME_PREFIX.length)
			this.clicked_marionette = this.marionettes[clicked_marionette_name]
			this.clicked_marionette.updateClickedBone(intersects[0].point)
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

	#addHandles() {
		this.handles.name = 'handles'
		this.handles.visible = false
		this.scene.add(this.handles)
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
