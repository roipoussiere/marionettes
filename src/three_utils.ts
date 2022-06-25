import * as THREE from 'three'
import { Vector3 as V3 } from 'three'


export function makeBoneHandle(bone: THREE.Bone, color: THREE.Color = new THREE.Color(0xff3399)) {
	let sceneGeometry = new THREE.SphereGeometry( 2.00);
	let sceneMaterial = new THREE.MeshBasicMaterial( { color } );
	let sphere = new THREE.Mesh(sceneGeometry, sceneMaterial);
	sphere.name = "BoneHandle"
	// Careful, the bone is submitted to intense scaling, it appears.
	// Why isn't the scale normalized ?  WTF   Perhaps we should normalize our models first.
	bone.add(sphere)

	return sphere
}

export function hintPoint(position: V3, color: THREE.Color = new THREE.Color(0xff3399)) {
	let sceneGeometry = new THREE.SphereGeometry( 0.03);
	let sceneMaterial = new THREE.MeshBasicMaterial( { color } );
	let sphere = new THREE.Mesh(sceneGeometry, sceneMaterial);
	sphere.position.add(position)
	sphere.name = "PointHint"
	return sphere
}

export function hintLine(start: V3, end: V3, color: THREE.Color = new THREE.Color(0xff9933)) {
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
