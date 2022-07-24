import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Marionette, MODEL_NAME_PREFIX } from './marionette'


export const SPINNER_CLASS = 'body-posture-spinner'

const POINTER_SENSIBILITY = 1.0
const GROUND_COLOR = 0x9ec899
const SKY_COLOR = 0x99c0c8
const LIGHT_COLOR = 0xffdddd


type OnChange = (marionette: Marionette) => void;


export class Theater {
	canvas: HTMLCanvasElement
	marionettes: { [id: string] : Marionette }
	on_change: CallableFunction

	renderer: THREE.WebGLRenderer
	camera: THREE.PerspectiveCamera
	control: OrbitControls

	models: THREE.Group
	handles: THREE.Group
	scene: THREE.Scene

	translate_mode: boolean
	rotate_mode: boolean
	is_fullscreen: boolean

	initial_canvas_size: THREE.Vector2
	pointer: THREE.Vector2
	last_pointer: THREE.Vector2

	axe_modifier_id: number // one in [0, 1, 2]
	meshes: THREE.SkinnedMesh[]
	clicked_marionette: Marionette | null

	constructor(canvas_id: string, marionettes: Marionette[], on_change: OnChange = () => {}) {
		this.canvas = <HTMLCanvasElement> document.getElementById(canvas_id)
		this.marionettes = {}
		marionettes.forEach(marionette => this.marionettes[marionette.name] = marionette)
		this.on_change = on_change

		this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true })
		this.camera = new THREE.PerspectiveCamera(45, this.canvas.width / this.canvas.height)
		this.camera.position.set(0, 2, 5)
		this.control = new OrbitControls(this.camera, this.renderer.domElement)

		this.models = new THREE.Group()
		this.handles = new THREE.Group()
		this.scene = new THREE.Scene()

		this.translate_mode = false
		this.rotate_mode = false
		this.is_fullscreen = false

		this.initial_canvas_size = new THREE.Vector2(this.canvas.width, this.canvas.height)
		this.pointer = new THREE.Vector2(0, 0)
		this.last_pointer = new THREE.Vector2(0, 0)

		this.axe_modifier_id = 0
		this.clicked_marionette = null
		this.meshes = []
	}

	init() {
		this.#addSpinner()

		this.canvas.addEventListener('mousemove',  e  => this.#onPointerMove(e))
		this.canvas.addEventListener('mousedown',  () => this.#onPointerPress())
		this.canvas.addEventListener('mouseup'  ,  () => this.#onPointerRelease())

		this.canvas.addEventListener('touchmove',  e  => this.#onPointerMove(e, true))
		this.canvas.addEventListener('touchstart', () => this.#onPointerPress())
		this.canvas.addEventListener('touchend' ,  () => this.#onPointerRelease())

		this.renderer.setSize(this.canvas.width, this.canvas.height)
		this.renderer.shadowMap.enabled = true;

		this.control.maxPolarAngle = Math.PI / 2
		this.control.minDistance = 1
		this.control.maxDistance = 5

		this.handles.name = 'handles'
		this.handles.visible = false

		this.models.name = 'models'

		this.scene.background = new THREE.Color(SKY_COLOR);
		this.scene.fog = new THREE.Fog(SKY_COLOR, 10, 20);

		this.scene.add(
			// new THREE.AxesHelper(),
			this.#buildGrid(),
			this.#buildFloor(),
			this.#buildLights()
		)
	}

	get fullscreen() {
		return this.is_fullscreen
	}

	set fullscreen(fullscreen: boolean) {
		this.is_fullscreen = fullscreen

		const fullscreen_style = 'width:100%; height:100%; position:fixed; top:0; left:0;'
		const width = fullscreen ? window.innerWidth : this.initial_canvas_size.width
		const height = fullscreen ? window.innerHeight : this.initial_canvas_size.height

		this.camera.aspect = width / height
		this.renderer.setSize(width, height)
		this.renderer.domElement.setAttribute('style', fullscreen ? fullscreen_style : '')
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

	getPoseAsUrlString(): string {
		let str: string[] = []
		Object.values(this.marionettes).forEach(marionette => {
			str.push(marionette.name + '=' + marionette.toString())
		})
		return str.join('&')
	}

	onModelLoaded(model: THREE.Group) {
		Object.values(this.marionettes).forEach(marionette => {
			marionette.setModel(model)
			marionette.model.children.forEach(grand_child => {
				if(grand_child instanceof THREE.SkinnedMesh) {
					this.meshes.push(<THREE.SkinnedMesh> grand_child)
				}
			})
			this.models.add(marionette.model)

			marionette.initHandles()
			this.handles.add(marionette.handles)
			// this.handles.add( new THREE.SkeletonHelper( marionette.model ))
		})
		this.scene.add(this.models)
		this.scene.add(this.handles)

		Array.from(document.getElementsByClassName(SPINNER_CLASS)).forEach(spinner => {
			spinner.remove()
		})
	}

	render() {
		this.renderer.render(this.scene, this.camera)
	}

	resetPose() {
		Object.values(this.marionettes).forEach(marionette => {
			marionette.resetPose()
		})
	}

	#normalizePointer(pointer: THREE.Vector2) {
		pointer.sub(this.canvas_origin).divide(this.canvas_size)
		pointer.set(2 * pointer.x - 1, -2 * pointer.y + 1)
	}

	#onPointerMove(event: UIEvent, touch = false) {
		const target = touch ? (<TouchEvent> event).changedTouches[0] : <MouseEvent> event
		this.last_pointer.copy(this.pointer)
		this.pointer.set(target.clientX, target.clientY)

		if ( ! this.control.enabled && this.clicked_marionette) {
			if (this.translate_mode) {
				this.clicked_marionette.translate(this.pointer_delta, this.axe_modifier_id)
			} else if (this.rotate_mode) {
				this.clicked_marionette.rotate(this.pointer_delta, this.axe_modifier_id)
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
			if (this.translate_mode) {
				this.clicked_marionette.roundPosition()
			} else {
				this.clicked_marionette.roundBone(this.clicked_marionette.clicked_bone)
			}

			this.on_change(this.clicked_marionette)
		}

		this.control.enabled = true
		this.clicked_marionette = null
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
		const canvas_brect = this.canvas.getBoundingClientRect();
		const size = Math.round(0.3 * Math.min(canvas_brect.width, canvas_brect.height))
		const left = Math.round(canvas_brect.left + canvas_brect.width  / 2 - size / 2)
		const right = Math.round(canvas_brect.top  + canvas_brect.height / 2 - size / 2)

		const spinner = document.createElement('div');
		spinner.classList.add(SPINNER_CLASS)
		spinner.style.cssText = `width: ${ size }px; height: ${ size  }px;`
		                      + `left: ${  left }px; top: ${    right }px;`;
		document.body.appendChild(spinner);
	}

	#buildGrid(): THREE.GridHelper {
		const grid = new THREE.GridHelper( 4, 20 )
		grid.name = 'grid'
		grid.position.y = 0.01

		return grid
	}

	#buildFloor(): THREE.Mesh {
		const floor_geometry = new THREE.PlaneGeometry(100, 100, 1, 1);
		const floor_material = new THREE.MeshPhongMaterial({
			color: GROUND_COLOR,
			shininess: 0
		});

		const floor = new THREE.Mesh(floor_geometry, floor_material);
		floor.name = 'floor'
		floor.rotation.x = -0.5 * Math.PI;
		floor.receiveShadow = true

		return floor
	}
		
	#buildLights(): THREE.Group {
		const lights = new THREE.Group()
		lights.name = 'lights'

		const ambient_light = new THREE.AmbientLight(new THREE.Color(LIGHT_COLOR), 0.5)
		ambient_light.name = 'ambient_light'

		const main_light = new THREE.PointLight(new THREE.Color(LIGHT_COLOR), 0.4)
		main_light.position.set(10, 10, 10)
		main_light.name = 'main_light'

		const secondary_light = new THREE.PointLight(new THREE.Color(LIGHT_COLOR), 0.3)
		secondary_light.position.set(-10, 10, -10)
		secondary_light.name = 'secondary_light'

		lights.add(ambient_light, main_light, secondary_light)

		return lights
	}
}
