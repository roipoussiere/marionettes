import { Puppeteer } from './puppeteer'


// const puppeteer = new Puppeteer('./xbot-light.fbx')
const puppeteer = new Puppeteer('./xbot-three.glb')
puppeteer.addScene('cv1')
puppeteer.init()
let animate = () => puppeteer.animate(animate)
animate()
