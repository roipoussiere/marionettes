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
	bone_handles: Array<THREE.Object3D>

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

		this.camera = new THREE.PerspectiveCamera(
		    50,
            this.canvas.width / this.canvas.height
        )
		this.camera.position.set(5, 2, 0)

		this.scene = new THREE.Scene()

		this.control = new OrbitControls(this.camera, this.renderer.domElement)
		this.bones = {}
		this.bone_handles = []
	}

	init() {
        // Could be accessors?
        const model_joints = <THREE.SkinnedMesh> this.scene.getObjectByName("Beta_Joints")
        // const model_surface = <SkinnedMesh> this.scene.getObjectByName("Beta_Surface")
        model_joints.skeleton.bones.forEach(bone => bone.removeFromParent())
        model_joints.removeFromParent()
        // this.scene.remove(model_joints)

		let bone: THREE.Bone

		this.scene.children.forEach(child => {
			if (child instanceof THREE.Group) {
				child.traverse(grand_child => {
					if (grand_child instanceof THREE.Bone) {
						bone = <THREE.Bone> grand_child
						this.bones[grand_child.name] = bone

                        const handlePosition = bone.getWorldPosition(new THREE.Vector3())
						this.bone_handles.push(this.#makeBoneHandle(bone))

						// That one is NOT updated when the bone moves, for simplicity now
						this.#hintLine(new THREE.Vector3(0.0, 10.0, 0.0), handlePosition)
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

		// Dump the scene tree
		this.scene.traverse( obj => {
			let s = '|___';
			let obj2 = obj;
			while ( obj2 !== this.scene ) {
				s = '\t' + s;
				if (obj2.parent !== null) {
					obj2 = obj2.parent;
				} else {
					break
				}
			}
			console.log( s + obj.name + ' <' + obj.type + '>' );
		});

		// Neat use of console.group, if we can translate this to ts
		// (function printGraph( obj ) {
		// 	console.group( ' <%o> ' + obj.name, obj );
		// 	obj.children.forEach( printGraph );
		// 	console.groupEnd();
		// } ( this.scene ) );
	}

	raycast(event: UIEvent, touch = false) {
		const target = touch ? (<TouchEvent> event).changedTouches[0] : <MouseEvent> event
		let pointer = new THREE.Vector2(target.clientX, target.clientY)
			.sub(this.canvas_origin)
			.divide(this.#getCanvasSize())
		pointer.set(2 * pointer.x - 1, -2 * pointer.y + 1)

		const raycaster = new THREE.Raycaster()
		raycaster.setFromCamera(pointer, this.camera);
		// console.log(pointer)
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

			const intersect = intersects[0]
			console.log("intersecting at", intersect.point, intersect.face)

			// Find the closest bone
			let closestBone = new THREE.Bone()
			let closestBoneName = ""
			let closestBoneDistance = Infinity
			for (let boneName in this.bones) {
				const bone = this.bones[boneName]
				const distance = (bone.getWorldPosition(new THREE.Vector3()).sub(intersect.point)).length()
				if (distance < closestBoneDistance) {
					closestBone = bone
					closestBoneName = boneName
					closestBoneDistance = distance
				}
			}
			console.info("Selected bone", closestBoneName, closestBone)

			// Experiment with bone
            if (closestBone.parent) {
			    closestBone.parent.rotateZ(0.1 * TAU)
            }
			// closestBone.position.applyAxisAngle(raycaster.ray.direction, TAU*0.1)
			// closestBone.position.applyAxisAngle(new THREE.Vector3(0., 0., 1.), TAU*0.1)
			// closestBone.position.add(new THREE.Vector3(0., 2.0, 0.))

			// Could be accessors?
            // const model_joints = <SkinnedMesh> this.scene.getObjectByName("Beta_Joints")
            // const model_surface = <SkinnedMesh> this.scene.getObjectByName("Beta_Surface")

			// Does not seem like we need this
            // model_joints.skeleton.update()
            // model_surface.skeleton.update()

		// })
		}
	}

	addObject(object: THREE.Object3D) {
		this.scene.add(object)
	}

	render() {
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
