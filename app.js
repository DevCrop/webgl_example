import * as THREE from "three";

import WebGL from "three/addons/capabilities/WebGL.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { createPerformanceMonitor } from "./performance.js";

if (WebGL.isWebGL2Available()) {

  const fogColor = new THREE.Color(0x004fff);
  const objColor = new THREE.Color(0xffffff);
  const floorColor = new THREE.Color(0x555555);
  
  // 장면
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(fogColor);

  scene.fog = new THREE.Fog(fogColor, 0.1, 42);
  // scene.fog = new THREE.FogExp2(fogColor, 0.5);

  // 카메라
  // const camera = new THREE.PerspectiveCamera(
  //   75,
  //   window.innerWidth / window.innerHeight,
  //   0.1,
  //   1000
  // );
  // camera.position.z = 15;

  const fov = 80;
  const aspect = window.innerWidth / window.innerHeight;
  const near = 0.1;
  const far = 2000;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.x = 0;
  camera.position.y = 0;
  camera.position.z = 25;
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
  controls.update();  

  // 바닥 만들기
  const planeGeometry = new THREE.PlaneGeometry(30, 30);
  const planeMaterial = new THREE.MeshStandardMaterial({
    color: 0xeeeeee,
    roughness: 0.8,
  });

  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.rotation.x = -Math.PI / 2; // 바닥을 수평으로 회전
  plane.position.y = -1; // 구체들(반지름 1) 아래에 위치
  plane.receiveShadow = true; // 그림자 받기 (선택사항)
  // scene.add(plane);
  // plane.receiveShadow = true;
  

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);
  // ambientLight.castShadow = true;
  
  
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
  directionalLight.position.set(-5,0,6);
  const dlHelper = new THREE.DirectionalLightHelper(directionalLight,1);
  scene.add(dlHelper);
  scene.add(directionalLight);
  // directionalLight.castShadow = true; // 그림자 영향 O
  // directionalLight.shadow.mapSize.set(2048, 2048);
  // directionalLight.shadow.radius = 8
  
  const hemisphereLight = new THREE.HemisphereLight(0xfffa500, 0xffffff, 0.3);
  // scene.add(hemisphereLight);

  const pointLight = new THREE.PointLight(0xffffff, 5);
  pointLight.position.set(-1,1,0.5);
  const pointLightHelper = new THREE.PointLightHelper(pointLight,0.5);
  // scene.add(pointLightHelper);
  // scene.add(pointLight);
  // pointLight.castShadow = true; //그림자 영향 O

  const rectAreaLight = new THREE.RectAreaLight(0xffffff, 2, 1, 0.5);
  rectAreaLight.position.set(0,-1,0);
  rectAreaLight.lookAt(1,0,0);
  // rectAreaLight.castShadow = true;//그림자 영향 X
  // scene.add(rectAreaLight);


  const spotLight = new THREE.SpotLight(0xffffff, 5);
  spotLight.position.set(0,5,5);
  spotLight.lookAt(0,0,0);
  const spotLightHelper = new THREE.SpotLightHelper(spotLight,0.5);
  // spotLight.castShadow = true; //그림자 영향 O
  // scene.add(spotLightHelper);
  // scene.add(spotLight);
  

  // const textureLoader = new THREE.TextureLoader();
  
  // const optimizeTexture = (texture) => {
  //   texture.wrapS = THREE.RepeatWrapping;
  //   texture.wrapT = THREE.RepeatWrapping;
  //   texture.generateMipmaps = true;
  //   texture.minFilter = THREE.LinearMipmapLinearFilter;
  //   texture.magFilter = THREE.LinearFilter;
  //   // Anisotropic filtering (더 나은 텍스처 품질)
  //   texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  // };
  
  // // 텍스처 로딩 (상대 경로 사용)
  // const textureBaseColor = textureLoader.load(
  //   './img/Wall_Stone_030_basecolor.png',
  //   (texture) => {
  //     optimizeTexture(texture);
  //     console.log('BaseColor 텍스처 로딩 완료');
  //   },
  //   undefined,
  //   (error) => {
  //     console.error('BaseColor 텍스처 로딩 실패:', error);
  //   }
  // );
  
  // const textureNormal = textureLoader.load(
  //   './img/Wall_Stone_030_normal.png',
  //   (texture) => {
  //     optimizeTexture(texture);
  //   },
  //   undefined,
  //   (error) => {
  //     console.error('Normal 텍스처 로딩 실패:', error);
  //   }
  // );
  
  // const textureHeight = textureLoader.load(
  //   './img/Wall_Stone_030_height.png',
  //   (texture) => {
  //     optimizeTexture(texture);
  //   },
  //   undefined,
  //   (error) => {
  //     console.error('Height 텍스처 로딩 실패:', error);
  //   }
  // );
  
  // const textureRoughness = textureLoader.load(
  //   './img/Wall_Stone_030_roughness.png',
  //   (texture) => {
  //     optimizeTexture(texture);
  //   },
  //   undefined,
  //   (error) => {
  //     console.error('Roughness 텍스처 로딩 실패:', error);
  //   }
  // );

  // Geometry 재사용 최적화 (같은 geometry를 여러 번 생성하지 않음)
  const sharedSphereGeometry = new THREE.SphereGeometry(1, 32, 32);
  const geometry  = new THREE.TorusGeometry( 10, 3, 16, 64 );
  // const material1 = new THREE.MeshStandardMaterial({ 
  //   map: textureBaseColor,
  //   normalMap: textureNormal,
  //   displacementMap: textureHeight,
  //   displacementScale: 0.23,
  //   roughnessMap: textureRoughness,
  //   roughness: 0.3,
  // });



 

  const material3 = new THREE.MeshStandardMaterial({ 
    color: 0xff7f00,
  });

  const material4 = new THREE.MeshStandardMaterial({ 
    color: objColor,
  });

  const obj3 = new THREE.Mesh(sharedSphereGeometry, material3);
  // scene.add(obj3);


  const obj4 = new THREE.Mesh(geometry, material4);
  scene.add(obj4);

  // obj4.castShadow = true;



  
  // 애니메이션 루프
  function render() {
    obj4.rotation.y += 0.01;
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
