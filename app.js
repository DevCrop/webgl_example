import * as THREE from "three";

import WebGL from "three/addons/capabilities/WebGL.js";

if (WebGL.isWebGL2Available()) {
  // 장면
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x222222);
  // 카메라
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 15;
  // 렌더러
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  // 렌더
  renderer.render(scene, camera);

  //   매쉬
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
  const obj1 = new THREE.Mesh(geometry, material);
  scene.add(obj1);
  obj1.position.x = 1;

  //   두번째 매쉬
  const geometry2 = new THREE.BoxGeometry(1, 1, 1);
  const material2 = new THREE.MeshStandardMaterial({ color: 0x0000ff });
  const obj2 = new THREE.Mesh(geometry2, material2);
  scene.add(obj2);
  obj2.position.x = -2;

  // 세번째 매쉬
  const geometry3 = new THREE.ConeGeometry(5, 20, 32);
  const material3 = new THREE.MeshBasicMaterial({ color: 0xffff00 });
  const obj3 = new THREE.Mesh(geometry3, material3);
  //   scene.add(obj3);

  //   네번째 매쉬

  const geometry4 = new THREE.IcosahedronGeometry();
  const material4 = new THREE.MeshBasicMaterial({ color: 0xffff00 });
  const obj4 = new THREE.Mesh(geometry4, material4);
  scene.add(obj4);

  function render(time) {
    time *= 0.001;
    obj1.rotation.y = time;
    obj2.rotation.y = time;

    obj3.rotation.y = time;

    obj4.rotation.y = time;

    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);

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
