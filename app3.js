import * as THREE from "three";

import WebGL from "three/addons/capabilities/WebGL.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { createPerformanceMonitor } from "./performance.js";

if (WebGL.isWebGL2Available()) {
  
  // 장면
  const scene = new THREE.Scene();
  

  scene.background = new THREE.Color(0xeeeeee);
  // 카메라
  // const camera = new THREE.PerspectiveCamera(
  //   75,
  //   window.innerWidth / window.innerHeight,
  //   0.1,
  //   1000
  // );
  // camera.position.z = 15;

  const fov = 75;
  const aspect = window.innerWidth / window.innerHeight;
  const near = 0.1;
  const far = 5000; // 스카이박스 크기에 맞게 조정
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.x = 0;
  camera.position.y = 50;
  camera.position.z = 50;
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: "high-performance", // GPU 성능 우선
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); 
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);
  
  // 성능 모니터 생성
  const performanceMonitor = createPerformanceMonitor(renderer);
  
  // 카메라 컨트롤 추가
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 2;
  controls.maxDistance = 50;
  controls.maxPolarAngle =Math.PI / 2;

const directionalLight = new THREE.DirectionalLight(0xffffff, 5);
directionalLight.position.set(0, 0, 5);
const dlHelper = new THREE.DirectionalLightHelper(directionalLight,1);
scene.add(dlHelper);
scene.add(directionalLight);


  // rocket.fbx 파일 불러오기
  const fbxLoader = new FBXLoader();
  fbxLoader.load('./rocket.fbx', (fbx) => {
    const rocket = fbx;
    rocket.scale.set(0.01, 0.01, 0.01);
    scene.add(rocket);
    console.log('FBX 파일 로딩 완료');
  }, (progress) => {
    if (progress.lengthComputable) {
      console.log('로딩 진행률:', (progress.loaded / progress.total * 100) + '%');
    }
  }, (error) => {
    console.error('FBX 파일 로딩 실패:', error);
  });



  
  // 애니메이션 루프
  function render() {
    renderer.render(scene, camera);
    
    
    controls.update(); // 컨트롤 업데이트
    performanceMonitor.update();
    
    requestAnimationFrame(render);
  }
  render();
  

  //   반응형
  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener("resize", onWindowResize);
} else {
  const warning = WebGL.getWebGL2ErrorMessage();
  document.body.appendChild(warning);
}
