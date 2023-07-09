import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { gsap } from 'gsap'
import { TextPlugin } from 'gsap/TextPlugin'
import * as dat from 'lil-gui'
import { log } from 'three/examples/jsm/nodes/Nodes.js'
/**
 * GUI
 */
const gui = new dat.GUI()
const parametre = {
	scale: 1,
	positionY: 0,
	positionLightY: -5,
	positionLightX: -4.1,
	positionLightZ: -1.81,
}
const colorFormats = {
	string: '#242f38',
};

gui.addColor( colorFormats, 'string' ).onChange( ( ) => {
	ambientLight.color.set(new THREE.Color( colorFormats.string ))
})
gui.add(parametre, 'positionLightY',-5,5,0.01).onChange(() => {
	spotLight.position.y = parametre.positionLightY
	spotLight.lookAt(moon)
})

gui.add(parametre, 'positionLightX',-5,5,0.01).onChange(() => {
	spotLight.position.x = parametre.positionLightX
	spotLight.lookAt(moon)
})
gui.add(parametre, 'positionLightZ',-5,10,0.01).onChange(() => {
	spotLight.position.z = parametre.positionLightZ
	spotLight.lookAt(moon)
})
gui.add(parametre, 'scale',1,5,0.01)
gui.add(parametre, 'positionY',-5,0,0.01)
if(!import.meta.env.ACTIVE_GUI) {gui.hide()}


/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas#introCanvas')

// Scene
const scene = new THREE.Scene()

/**
 * LOADER
 */
gsap.registerPlugin(TextPlugin)

const loadingBarDOM = document.querySelector(".loader .container_bar .bar")
const loadingPercentDOM = document.querySelector(".loader .loaded_number")
const loaderDOM = document.querySelector(".loader")

const loadingManager = new THREE.LoadingManager(
	() => {
		gsap.to(loaderDOM,{opacity:0, display:"none" ,duration:1, delay:2})
		setTimeout(() => {
			document.querySelector(".paris")?.classList.add("underline")
			document.querySelector(".world")?.classList.add("appear")
		}, 3000)
	},
	async (_url:string, _loaded:number, _total:number) => {
		const percent = Math.round((100/ _total) * _loaded);
		gsap.to(loadingBarDOM,{scaleX: (percent/100),duration:2})
		gsap.to(loadingPercentDOM,{text: String(percent),duration:2})
	}
)

const textureLoader = new THREE.TextureLoader(loadingManager);
const gltfLoader = new GLTFLoader(loadingManager);
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')
gltfLoader.setDRACOLoader(dracoLoader)

//Load Texture 
const starsTexture = textureLoader.load("/stars.png")

let moon: any = null;
//Load Moon
gltfLoader.load(
	'/moon.gltf',
	( object ) => {
		moon = object.scene
		moon.scale.set(2.6,2.6,2.6)
		moon.position.y = -3
		spotLight.lookAt(moon.position)
		scene.add(moon)
	}
)

/**
 *  STARS
 */

const count = 600
const size = 1.5
const geometry = new THREE.BufferGeometry()
const positions = new Float32Array(count * 3)

for(let i = 0; i < count; i++)
{
	const i3 = i * 3
	positions[i3    ] = (Math.random() - 0.5) * 8
	positions[i3 + 1] = (Math.random() - 0.5) * 4
	positions[i3 + 2] = (Math.random() - 0.5) * 4
}

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

/**
 * Material
 */
const material = new THREE.PointsMaterial({
	size: size,
	sizeAttenuation: true,
	depthWrite: false,
	blending: THREE.AdditiveBlending,
	alphaMap: starsTexture
})

const points = new THREE.Points(geometry, material)
scene.add(points)

/**
 * LIGHT
 */
const ambientLight = new THREE.AmbientLight(new THREE.Color( colorFormats.string ), 0.5)
scene.add(ambientLight)

const spotLight = new THREE.SpotLight(0xffffff, 0.5, 100)
spotLight.position.set(parametre.positionLightX,parametre.positionLightY,parametre.positionLightZ)
scene.add(spotLight)

/**
 *  EVENT
 */

//Sizes
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight
 }


 window.addEventListener('resize', () =>
 {
	 // Update sizes
	 sizes.width = window.innerWidth
	 sizes.height = window.innerHeight

	  // Update camera
	  camera.left = sizes.width / -2;
	  camera.right = sizes.width  / 2;
	  camera.top = sizes.height / 2;
	  camera.bottom = sizes.height / -2;

	 // Update renderer
	 renderer.setSize(sizes.width, sizes.height)
	 renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
 })

 const cursor = {
	x: 0,
	y: 0 
}

window.addEventListener('mousemove', (_event) => {
	cursor.x = (_event.clientX / sizes.width) - 0.5
	cursor.y = (_event.clientY / sizes.height) - 0.5
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.OrthographicCamera( sizes.width / - 2, sizes.width / 2, sizes.height / 2, sizes.height / - 2, 1, 10 ) 
camera.zoom = 185
scene.add(camera)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas? canvas: undefined,
	alpha: true
})
renderer.setClearColor(new THREE.Color( 0x101010 ));
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

	// MOON
	if(moon !== null)
	{
		moon.rotation.x = elapsedTime * 0.05
		moon.rotation.y = elapsedTime * 0.04
	}

	
	camera.updateProjectionMatrix()
	points.position.x = cursor.x * 0.2
	points.position.y = -cursor.y * 0.2
    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
