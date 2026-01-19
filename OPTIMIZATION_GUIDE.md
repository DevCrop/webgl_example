# WebGL/Three.js 최적화 가이드

## 1. Geometry 최적화

### ✅ 확인 사항
- **Geometry 재사용**: 같은 geometry를 여러 번 사용할 때는 한 번만 생성하고 재사용
- **세그먼트 수 최적화**: 필요 이상의 세그먼트는 성능 저하
- **BufferGeometry 사용**: Geometry보다 BufferGeometry가 더 효율적

### 현재 코드 문제점
```javascript
// ❌ 나쁜 예: 같은 SphereGeometry를 4번 생성
const geometry1 = new THREE.SphereGeometry(1, 32, 32);
const geometry2 = new THREE.SphereGeometry(1, 32, 32);
const geometry3 = new THREE.SphereGeometry(1, 32, 32);
const geometry4 = new THREE.SphereGeometry(1, 32, 32);

// ✅ 좋은 예: 한 번만 생성하고 재사용
const sharedGeometry = new THREE.SphereGeometry(1, 32, 32);
```

---

## 2. Material 최적화

### ✅ 확인 사항
- **Material 재사용**: 같은 속성을 가진 material은 재사용
- **불필요한 속성 제거**: 사용하지 않는 텍스처 맵 제거
- **Material 정렬**: 같은 material을 가진 객체를 함께 렌더링

### 현재 코드 문제점
```javascript
// ❌ 나쁜 예: 같은 속성의 material을 여러 번 생성
const material2 = new THREE.MeshStandardMaterial({ color: 0x0000ff });
const material3 = new THREE.MeshStandardMaterial({ color: 0xff7f00 });
const material4 = new THREE.MeshStandardMaterial({ color: 0xee151e });

// ✅ 좋은 예: 필요시에만 생성하거나 재사용
```

---

## 3. 텍스처 최적화

### ✅ 확인 사항
- **텍스처 크기**: 필요 이상의 큰 텍스처는 메모리 낭비 (2의 제곱 권장: 512, 1024, 2048)
- **텍스처 압축**: WebP, KTX2, DXT 등 압축 포맷 사용
- **Mipmap 생성**: `texture.generateMipmaps = true` (기본값)
- **필터링 최적화**: `texture.minFilter`, `texture.magFilter` 설정
- **텍스처 형식**: RGB vs RGBA (투명도 불필요시 RGB 사용)

### 최적화 예시
```javascript
texture.generateMipmaps = true;
texture.minFilter = THREE.LinearMipmapLinearFilter;
texture.magFilter = THREE.LinearFilter;
texture.anisotropy = renderer.capabilities.getMaxAnisotropy(); // 최대 16
```

---

## 4. 렌더러 최적화

### ✅ 확인 사항
- **pixelRatio**: 고해상도 디스플레이에서 자동 조정 (기본값 1, 최대 2 권장)
- **powerPreference**: GPU 성능 우선 설정
- **antialias**: 필요시에만 활성화 (성능 저하)
- **shadowMap**: 그림자 사용시 최적화 설정

### 최적화 예시
```javascript
const renderer = new THREE.WebGLRenderer({
  alpha: true,
  antialias: true, // 필요시에만
  powerPreference: "high-performance", // GPU 성능 우선
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // 최대 2로 제한
```

---

## 5. 조명 최적화

### ✅ 확인 사항
- **조명 개수**: 조명이 많을수록 성능 저하 (특히 PointLight, SpotLight)
- **조명 범위**: `distance`, `decay` 속성으로 범위 제한
- **조명 타입**: AmbientLight는 성능 영향 적음, PointLight는 영향 큼
- **그림자**: 필요한 객체에만 그림자 활성화

### 현재 코드 문제점
```javascript
// ❌ 5개의 조명 사용 (너무 많음)
// - AmbientLight 1개
// - PointLight 3개
// - DirectionalLight 2개

// ✅ 최적화: 필요한 조명만 사용
```

---

## 6. 렌더링 최적화

### ✅ 확인 사항
- **Frustum Culling**: 카메라에 보이지 않는 객체 자동 제거 (기본 활성화)
- **Occlusion Culling**: 가려진 객체 제거
- **LOD (Level of Detail)**: 거리에 따라 다른 detail level 사용
- **인스턴싱**: 같은 geometry/material을 여러 번 사용시 InstancedMesh 사용
- **배치 렌더링**: 같은 material을 가진 객체를 함께 렌더링

---

## 7. 메모리 관리

### ✅ 확인 사항
- **dispose()**: 사용하지 않는 geometry, material, texture는 dispose
- **메모리 누수**: 이벤트 리스너, 타이머 정리
- **텍스처 캐싱**: 같은 텍스처는 재사용

### 예시
```javascript
// 리소스 정리
geometry.dispose();
material.dispose();
texture.dispose();
```

---

## 8. 애니메이션 최적화

### ✅ 확인 사항
- **requestAnimationFrame**: 항상 사용 (setTimeout 대신)
- **불필요한 업데이트 방지**: 변경된 객체만 업데이트
- **계산 최적화**: 매 프레임 계산 vs 캐싱

---

## 9. 성능 모니터링

### ✅ 확인 사항
- **Stats.js**: FPS, 메모리 사용량 모니터링
- **Chrome DevTools**: Performance 탭에서 프로파일링
- **렌더링 통계**: `renderer.info`로 렌더링 통계 확인

### 예시
```javascript
// 렌더링 통계 확인
console.log(renderer.info);
// {
//   memory: { geometries, textures, programs },
//   render: { calls, triangles, points, lines, frame }
// }
```

---

## 10. 기타 최적화

### ✅ 확인 사항
- **코드 스플리팅**: 필요한 모듈만 로드
- **텍스처 로딩**: 비동기 로딩, 로딩 완료 후 렌더링
- **Web Workers**: 무거운 계산은 Web Worker로 이동
- **WebGL2 사용**: 가능하면 WebGL2 사용 (더 나은 성능)

---

## 현재 코드 최적화 체크리스트

- [ ] Geometry 재사용 (같은 SphereGeometry 4번 생성)
- [ ] 렌더러 pixelRatio 설정
- [ ] 조명 개수 최적화 (5개 → 2-3개)
- [ ] 텍스처 최적화 설정 (anisotropy, filter)
- [ ] 불필요한 속성 제거 (displacementMap 미사용)
- [ ] 성능 모니터링 추가 (Stats.js)
