import * as THREE from 'three'
import { NAME_PREFIX } from './bones_config'

const DEFAULT_COLOR = new THREE.Color(0xff3399)

export function makeBoneHandle(bone: THREE.Bone, color = DEFAULT_COLOR) {
	let sceneGeometry = new THREE.SphereGeometry( 2.00);
	let sceneMaterial = new THREE.MeshBasicMaterial( { color } );
	let sphere = new THREE.Mesh(sceneGeometry, sceneMaterial);
	sphere.name = "BoneHandle"
	// Careful, the bone is submitted to intense scaling, it appears.
	// Why isn't the scale normalized ?  WTF   Perhaps we should normalize our models first.
	bone.add(sphere)

	return sphere
}

export function hintPoint(position: THREE.Vector3, color = DEFAULT_COLOR) {
	let sceneGeometry = new THREE.SphereGeometry( 0.03);
	let sceneMaterial = new THREE.MeshBasicMaterial( { color } );
	let sphere = new THREE.Mesh(sceneGeometry, sceneMaterial);
	sphere.position.add(position)
	sphere.name = "PointHint"
	return sphere
}

export function hintLine(start: THREE.Vector3, end: THREE.Vector3, color = DEFAULT_COLOR) {
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
	cylinder.rotateX(Math.PI / 2)

	line.name = "LineHint"
	line.add(cylinder)
	line.lookAt(direction)
	line.position.add(start)

	return line
}

export function dump_scene(scene: THREE.Scene) {
    scene.traverse( obj => {
        let s = '+---';
        let obj2 = obj;
        while ( obj2 != scene ) {
            s = '\t' + s;
            if (obj2.parent != null) {
                obj2 = obj2.parent;
            } else {
                break
            }
        }
        console.log( s + obj.name + ' <' + obj.type + '>' );
    });
}

export function dump_bone(bone: THREE.Bone) {
	const rotation = new THREE.Vector3().setFromEuler(bone.rotation)
	console.log(
		`${bone.name.substring(NAME_PREFIX.length)}: `
		+ `(${Math.round(rotation.x * THREE.MathUtils.RAD2DEG)}, `
		+  `${Math.round(rotation.y * THREE.MathUtils.RAD2DEG)}, `
		+  `${Math.round(rotation.z * THREE.MathUtils.RAD2DEG)})`
	)
}