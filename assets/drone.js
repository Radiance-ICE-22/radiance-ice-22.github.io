// Drone CAD (decimated to 154 k faces, CAD colours kept) in a small orbit viewer. Loads on demand.
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const box = document.getElementById("drone-3d");
const btn = document.getElementById("drone-load");
let started = false;

function start() {
  if (started || !box) return; started = true;
  btn?.remove();
  const msg = Object.assign(document.createElement("span"), { className: "msg", textContent: "loading the model…" });
  box.append(msg);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  box.append(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 1000);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x445566, 1.6));
  const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(30, 50, 40); scene.add(key);
  const rim = new THREE.DirectionalLight(0xffffff, 0.8); rim.position.set(-40, 20, -30); scene.add(rim);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.enablePan = false; controls.autoRotate = !matchMedia("(prefers-reduced-motion: reduce)").matches; controls.autoRotateSpeed = 1.2;
  const size = () => { const r = box.getBoundingClientRect(); renderer.setSize(r.width, r.height, false); camera.aspect = r.width / r.height; camera.updateProjectionMatrix(); };
  new ResizeObserver(size).observe(box); size();
  new GLTFLoader().load("media/drone/drone.glb", (g) => {
    const m = g.scene;
    m.rotation.x = -Math.PI / 2;                       // CAD is z-up, three.js is y-up
    const b = new THREE.Box3().setFromObject(m), c = b.getCenter(new THREE.Vector3()), s = b.getSize(new THREE.Vector3()).length();
    m.position.sub(c); scene.add(m);
    camera.position.set(s * 0.55, s * 0.42, s * 0.62); controls.target.set(0, 0, 0); controls.update();
    msg.textContent = "drag to rotate · 33 × 29 × 10 cm";
  }, undefined, () => { msg.textContent = "the model could not be loaded"; });
  const tick = () => { controls.update(); renderer.render(scene, camera); requestAnimationFrame(tick); };
  tick();
}
btn?.addEventListener("click", start);
// on wide screens load when the viewer comes into view; on phones wait for a tap (3 MB)
if (box && matchMedia("(min-width: 900px)").matches && "IntersectionObserver" in window) {
  const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); start(); } }, { rootMargin: "200px" });
  io.observe(box);
}
