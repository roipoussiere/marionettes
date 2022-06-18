import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

const scene = new THREE.Scene()

const camera1 = new THREE.PerspectiveCamera(75, 1, 0.1, 10)
camera1.position.z = 2

const canvas1 = document.getElementById('tc1') as HTMLCanvasElement

const renderer1 = new THREE.WebGLRenderer({ canvas: canvas1 })
renderer1.setSize(600, 450)

new OrbitControls(camera1, renderer1.domElement)

const geometry = new THREE.BoxGeometry()
const material = new THREE.MeshBasicMaterial({
	color: 0x00ff00,
	wireframe: true,
})

const cube = new THREE.Mesh(geometry, material)
scene.add(cube)

function animate() {
	requestAnimationFrame(animate)

	cube.rotation.x += 0.01
	cube.rotation.y += 0.01

	render()
}

function render() {
	renderer1.render(scene, camera1)
}

animate()
