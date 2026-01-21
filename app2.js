import * as THREE from "three";

import WebGL from "three/addons/capabilities/WebGL.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { createPerformanceMonitor } from "./performance.js";

if (WebGL.isWebGL2Available()) {
  
  // 장면
  const scene = new THREE.Scene();

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
  camera.position.y = 24;
  camera.position.z = 40;
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


  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);
  // ambientLight.castShadow = true;
  
  
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
  directionalLight.position.set(-5,0,6);
  const dlHelper = new THREE.DirectionalLightHelper(directionalLight,1);
//   scene.add(dlHelper);
//   scene.add(directionalLight);
  // directionalLight.castShadow = true; // 그림자 영향 O
  // directionalLight.shadow.mapSize.set(2048, 2048);
  // directionalLight.shadow.radius = 8

  // 텍스처 최적화 함수
  const optimizeSkyTexture = (texture) => {
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
  };

  const skyMaterialArr = [];
  const textureLoader = new THREE.TextureLoader();
  
  const textureFront = textureLoader.load('./texture/penguins-skybox-pack/penguins/arid_ft.jpg', optimizeSkyTexture);
  const textureBack = textureLoader.load('./texture/penguins-skybox-pack/penguins/arid_bk.jpg', optimizeSkyTexture);
  const textureTop = textureLoader.load('./texture/penguins-skybox-pack/penguins/arid_up.jpg', optimizeSkyTexture);
  const textureBottom = textureLoader.load('./texture/penguins-skybox-pack/penguins/arid_dn.jpg', optimizeSkyTexture);
  const textureLeft = textureLoader.load('./texture/penguins-skybox-pack/penguins/arid_lf.jpg', optimizeSkyTexture);
  const textureRight = textureLoader.load('./texture/penguins-skybox-pack/penguins/arid_rt.jpg', optimizeSkyTexture);

  // BoxGeometry 면 순서: 0=right, 1=left, 2=top, 3=bottom, 4=front, 5=back
  // MeshBasicMaterial 사용 (조명 영향 없이 실제 배경처럼 보임)
  skyMaterialArr.push(new THREE.MeshBasicMaterial({
    map: textureRight, // 0: right (+x)
    side: THREE.BackSide,
  }));
  
  skyMaterialArr.push(new THREE.MeshBasicMaterial({
    map: textureLeft, // 1: left (-x)
    side: THREE.BackSide,
  }));
  
  skyMaterialArr.push(new THREE.MeshBasicMaterial({
    map: textureTop, // 2: top (+y)
    side: THREE.BackSide,
  }));
  
  skyMaterialArr.push(new THREE.MeshBasicMaterial({
    map: textureBottom, // 3: bottom (-y)
    side: THREE.BackSide,
  }));
  
  skyMaterialArr.push(new THREE.MeshBasicMaterial({
    map: textureFront, // 4: front (+z)
    side: THREE.BackSide,
  }));
  
  skyMaterialArr.push(new THREE.MeshBasicMaterial({
    map: textureBack, // 5: back (-z)
    side: THREE.BackSide,
  }));

  // 스카이박스 크기를 충분히 크게 설정 (면 경계가 덜 보이도록)
  const skyGeometry = new THREE.BoxGeometry(2000, 2000, 2000);
  const skybox = new THREE.Mesh(skyGeometry, skyMaterialArr);
  scene.add(skybox);




  
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
