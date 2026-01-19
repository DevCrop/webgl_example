import * as THREE from "three";

import WebGL from "three/addons/capabilities/WebGL.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
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
  const far = 200;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.x = 0;
  camera.position.y = 1;
  camera.position.z = 12;
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  
  // 렌더러 (최적화 설정)
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: "high-performance", // GPU 성능 우선
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // 고해상도 디스플레이 최적화
  document.body.appendChild(renderer.domElement);
  
  // 성능 모니터 생성
  const performanceMonitor = createPerformanceMonitor(renderer);
  
  // 카메라 컨트롤 추가
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  
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
  scene.add(plane);
  

  // 조명 최적화 (5개 → 3개로 감소)
  // 기본 환경 조명 (전체적인 기본 밝기)
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);
  
  // 메인 포인트 조명 (앞쪽 위) - 범위 제한으로 최적화
  const pointLight = new THREE.PointLight(0xffffff, 1.5, 50); // distance: 50으로 범위 제한
  pointLight.position.set(10, 10, 10);
  scene.add(pointLight);
  
  // 방향 조명 (하이라이트 효과)
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 10, 5);
  scene.add(directionalLight);
  
  const textureLoader = new THREE.TextureLoader();
  
  // 텍스처 최적화 함수
  const optimizeTexture = (texture) => {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    // Anisotropic filtering (더 나은 텍스처 품질)
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  };
  
  // 텍스처 로딩 (상대 경로 사용)
  const textureBaseColor = textureLoader.load(
    './img/Wall_Stone_030_basecolor.png',
    (texture) => {
      optimizeTexture(texture);
      console.log('BaseColor 텍스처 로딩 완료');
    },
    undefined,
    (error) => {
      console.error('BaseColor 텍스처 로딩 실패:', error);
    }
  );
  
  const textureNormal = textureLoader.load(
    './img/Wall_Stone_030_normal.png',
    (texture) => {
      optimizeTexture(texture);
    },
    undefined,
    (error) => {
      console.error('Normal 텍스처 로딩 실패:', error);
    }
  );
  
  const textureHeight = textureLoader.load(
    './img/Wall_Stone_030_height.png',
    (texture) => {
      optimizeTexture(texture);
    },
    undefined,
    (error) => {
      console.error('Height 텍스처 로딩 실패:', error);
    }
  );
  
  const textureRoughness = textureLoader.load(
    './img/Wall_Stone_030_roughness.png',
    (texture) => {
      optimizeTexture(texture);
    },
    undefined,
    (error) => {
      console.error('Roughness 텍스처 로딩 실패:', error);
    }
  );

  // Geometry 재사용 최적화 (같은 geometry를 여러 번 생성하지 않음)
  const sharedSphereGeometry = new THREE.SphereGeometry(1, 32, 32);
  
  //   매쉬 (텍스처 재질)
  const material1 = new THREE.MeshStandardMaterial({ 
    map: textureBaseColor,
    normalMap: textureNormal,
    displacementMap: textureHeight,
    displacementScale: 0.23,
    roughnessMap: textureRoughness,
    roughness: 0.3,
  });
  const obj1 = new THREE.Mesh(sharedSphereGeometry, material1);
  scene.add(obj1);
  obj1.position.x = 5;
  obj1.rotation.x = -Math.PI / 2;

  //   두번째 매쉬 (Geometry 재사용)
  const material2 = new THREE.MeshStandardMaterial({ 
    color: 0x0000ff, 
  });
  const obj2 = new THREE.Mesh(sharedSphereGeometry, material2);
  scene.add(obj2);
  obj2.position.x = 2;

  // 세번째 매쉬 (Geometry 재사용)
  const material3 = new THREE.MeshStandardMaterial({ 
    color: 0xff7f00,
  });
  const obj3 = new THREE.Mesh(sharedSphereGeometry, material3);
  obj3.position.x = -2;
  scene.add(obj3);

  // 네번째 매쉬 (Geometry 재사용)
  const material4 = new THREE.MeshStandardMaterial({ 
    color: 0xee151e,
  });
  const obj4 = new THREE.Mesh(sharedSphereGeometry, material4);
  obj4.position.x = -6;
  scene.add(obj4);


  
  // 애니메이션 루프
  function render() {
    controls.update(); // 컨트롤 업데이트
    renderer.render(scene, camera);
    
    // 성능 모니터링 업데이트
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
