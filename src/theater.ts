import * as THREE from 'three'
import { Vector2 as V2 } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Marionette, MODEL_NAME_PREFIX } from './marionette'


export const SPINNER_CLASS = 'body-posture-spinner'

const POINTER_SENSIBILITY = 1.0


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
	marionettes: { [id: string] : Marionette }
	meshes: THREE.SkinnedMesh[]
	clicked_marionette: string
	handles: THREE.Group

	constructor(canvas_id: string, marionettes: Marionette[]) {
		this.canvas = <HTMLCanvasElement> document.getElementById(canvas_id)
		const canvas_brect = this.canvas.getBoundingClientRect()
		this.canvas_origin = new V2(canvas_brect.left - 1, canvas_brect.top).ceil()
		this.pointer = new V2(0, 0)
		this.pointer_delta = new V2(0, 0)
		this.axe_modifier_id = 0
		this.clicked_marionette = ''

		this.marionettes = {}
		marionettes.forEach(marionette => {
			this.marionettes[marionette.name] = marionette
		})

		this.meshes = []

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
		this.control = new OrbitControls(this.camera, this.renderer.domElement)

		this.handles = new THREE.Group()
	}

	get canvas_size() {
		return new V2(this.canvas.width, this.canvas.height)
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
			const moving_marionette = this.marionettes[this.clicked_marionette]
			moving_marionette.rotateBone(this.pointer_delta, this.axe_modifier_id)
			moving_marionette.updateHandles()
		}
	}

	#onPointerPress() {
		this.#raycast()
	}

	#onPointerRelease() {
		if (this.clicked_marionette) {
			const moving_marionette = this.marionettes[this.clicked_marionette]
			moving_marionette.roundMovedBone()
			Object.values(this.marionettes).forEach(marionette => {
				console.log(`${marionette.name}: ${marionette.serializer.skeletonToString()}`)
			})
		}

		this.control.enabled = true
		this.clicked_marionette = ''
	}

	#onKeyPress(event: KeyboardEvent) {
		if (event.ctrlKey) {
			this.axe_modifier_id = 1
		} else if (event.shiftKey) {
			this.axe_modifier_id = 2
		} else if (event.code == 'KeyH') {
			const handles = this.scene.getObjectByName('handles')
			if (handles) {
				handles.visible = ! handles.visible
			}
		}
	}

	#onKeyRelease() {
		this.axe_modifier_id = 0
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
		raycaster.setFromCamera(this.pointer, this.camera);

		// Bones do not have geometry or volume so the Raycaster cannot intersect them.
		// Solution: compare the clicked triangle position with each skeleton joint,
		//           get the bone with shorter distance.
		// if (0 < v1.dot(v2) < v3^2) // is the selected point in zone between v1 and v2?
		// sin(v1.angle(v2))*len

		const intersects = raycaster.intersectObjects(this.meshes, true)
		if (intersects.length > 0 && intersects[0].object.parent) {
			// console.log('intersect:', intersect)
			this.control.enabled = false
			this.clicked_marionette = intersects[0].object.parent.name
				.substring(MODEL_NAME_PREFIX.length)
			this.marionettes[this.clicked_marionette].updateClickedBone(intersects[0].point)
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
