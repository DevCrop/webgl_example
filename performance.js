// 성능 측정 및 모니터링 시스템

export class PerformanceMonitor {
  constructor(renderer) {
    this.renderer = renderer;
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.lastFrameTime = performance.now(); // 각 프레임 시간 추적용
    this.fps = 0;
    this.frameTime = 0;
    this.frameTimes = [];
    this.renderCalls = 0;
    this.triangles = 0;
    this.baselinePerformance = {
      fps: null,
      frameTime: null,
      renderCalls: null,
      triangles: null,
      score: null
    };
    
    // UI 생성
    this.createDisplay();
  }
  
  createDisplay() {
    const statsDiv = document.createElement('div');
    statsDiv.id = 'performance-stats';
    statsDiv.style.cssText = `
      position: fixed;
      top: 10px;
      left: 10px;
      background: rgba(0, 0, 0, 0.7);
      color: #0f0;
      padding: 10px;
      font-family: monospace;
      font-size: 12px;
      z-index: 1000;
      border-radius: 5px;
      min-width: 200px;
    `;
    document.body.appendChild(statsDiv);
  }
  
  update() {
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastFrameTime || currentTime - this.lastTime;
    
    // 각 프레임의 실제 프레임 시간 (밀리초)
    this.frameTime = deltaTime;
    
    // frameTimes 배열에는 각 프레임의 실제 시간만 저장 (1초 이상의 값은 제외)
    if (deltaTime < 1000 && deltaTime > 0) {
      this.frameTimes.push(deltaTime);
      
      // 최근 60프레임만 유지
      if (this.frameTimes.length > 60) {
        this.frameTimes.shift();
      }
    }
    
    this.frameCount++;
    this.lastFrameTime = currentTime;
    
    // FPS 계산 (1초마다)
    const timeSinceLastUpdate = currentTime - this.lastTime;
    if (timeSinceLastUpdate >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / timeSinceLastUpdate);
      this.frameCount = 0;
      this.lastTime = currentTime;
      
      // 렌더링 통계 업데이트
      this.renderCalls = this.renderer.info.render.calls;
      this.triangles = this.renderer.info.render.triangles;
      
      // 화면에 성능 정보 표시
      this.updateDisplay();
    }
  }
  
  updateDisplay() {
    const statsDiv = document.getElementById('performance-stats');
    if (!statsDiv) return;
    
    // 성능 점수 계산 (NaN 방지 포함)
    const score = this.calculatePerformanceScore();
    
    // 평균 FPS 계산 (안전하게)
    let avgFPS = 0;
    if (this.frameTimes && this.frameTimes.length > 0) {
      const avgFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
      if (avgFrameTime > 0 && isFinite(avgFrameTime)) {
        avgFPS = Math.round(1000 / avgFrameTime);
      }
    }
    
    // FPS 색상 설정 (60 FPS 이상: 녹색, 30-60: 노란색, 30 미만: 빨간색)
    let fpsColor = '#0f0';
    const currentFPS = this.fps || 0;
    if (currentFPS < 30) fpsColor = '#f00';
    else if (currentFPS < 60) fpsColor = '#ff0';
    
    // 점수 색상 설정 (80 이상: 녹색, 60-80: 노란색, 60 미만: 빨간색)
    let scoreColor = '#0f0';
    const totalScore = score.total || 0;
    if (totalScore < 60) scoreColor = '#f00';
    else if (totalScore < 80) scoreColor = '#ff0';
    
    // 안전한 값 표시
    const safeScore = isFinite(totalScore) ? totalScore : 0;
    const safeFPS = isFinite(currentFPS) ? currentFPS : 0;
    const safeAvgFPS = isFinite(avgFPS) ? avgFPS : 0;
    const safeFrameTime = isFinite(this.frameTime) ? this.frameTime.toFixed(2) : '0.00';
    const safeRenderCalls = this.renderCalls || 0;
    const safeTriangles = this.triangles || 0;
    
    statsDiv.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 5px; border-bottom: 1px solid #444; padding-bottom: 5px;">
        성능 모니터
      </div>
      <div style="margin-bottom: 8px;">
        <div style="font-size: 18px; font-weight: bold;">
          점수: <span style="color: ${scoreColor}">${safeScore}/100</span>
        </div>
        ${this.baselinePerformance.score ? `
          <div style="font-size: 11px; color: #888;">
            이전: ${this.baselinePerformance.score}점
            <span style="color: ${safeScore > this.baselinePerformance.score ? '#0f0' : '#f00'}">
              (${safeScore > this.baselinePerformance.score ? '+' : ''}${(safeScore - this.baselinePerformance.score).toFixed(0)})
            </span>
          </div>
        ` : ''}
      </div>
      <div>FPS: <span style="color: ${fpsColor}">${safeFPS}</span> (평균: ${safeAvgFPS})</div>
      <div>프레임 시간: ${safeFrameTime}ms</div>
      <div>렌더 호출: ${safeRenderCalls}</div>
      <div>삼각형: ${safeTriangles.toLocaleString()}</div>
      <div style="margin-top: 5px; font-size: 10px; color: #888;">
        F12: showPerformanceComparison()
      </div>
    `;
  }
  
  logPerformance() {
    const avgFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    const avgFPS = Math.round(1000 / avgFrameTime);
    
    console.log(`
=== 성능 통계 ===
FPS: ${this.fps} (평균: ${avgFPS})
프레임 시간: ${this.frameTime.toFixed(2)}ms (평균: ${avgFrameTime.toFixed(2)}ms)
렌더 호출: ${this.renderCalls}
삼각형 수: ${this.triangles.toLocaleString()}
메모리 - Geometry: ${this.renderer.info.memory.geometries}
메모리 - Texture: ${this.renderer.info.memory.textures}
메모리 - Programs: ${this.renderer.info.memory.programs}
================
    `);
  }
  
  getPerformanceReport() {
    const avgFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    const avgFPS = Math.round(1000 / avgFrameTime);
    
    return {
      fps: this.fps,
      avgFPS: avgFPS,
      frameTime: this.frameTime,
      avgFrameTime: avgFrameTime,
      renderCalls: this.renderCalls,
      triangles: this.triangles,
      memory: {
        geometries: this.renderer.info.memory.geometries,
        textures: this.renderer.info.memory.textures,
        programs: this.renderer.info.memory.programs
      }
    };
  }
  
  // 성능 점수 계산 (0-100 점)
  calculatePerformanceScore() {
    // frameTimes 배열이 비어있거나 유효하지 않을 때 기본값 처리
    if (!this.frameTimes || this.frameTimes.length === 0) {
      return {
        total: 0,
        breakdown: {
          fps: 0,
          frameTime: 0,
          renderCalls: 0,
          memory: 0
        },
        details: {
          avgFPS: 0,
          avgFrameTime: '0.00',
          renderCalls: this.renderCalls || 0,
          totalMemory: 0
        }
      };
    }
    
    const avgFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    
    // avgFrameTime이 유효하지 않거나 0일 때 처리
    if (!avgFrameTime || avgFrameTime <= 0 || !isFinite(avgFrameTime)) {
      return {
        total: 0,
        breakdown: {
          fps: 0,
          frameTime: 0,
          renderCalls: 0,
          memory: 0
        },
        details: {
          avgFPS: 0,
          avgFrameTime: '0.00',
          renderCalls: this.renderCalls || 0,
          totalMemory: 0
        }
      };
    }
    
    const avgFPS = Math.round(1000 / avgFrameTime);
    
    // FPS 점수 (0-40점): 60 FPS = 40점, 30 FPS = 20점, 15 FPS = 10점
    const fpsScore = Math.min(40, Math.max(0, (avgFPS / 60) * 40));
    
    // 프레임 시간 점수 (0-30점): 16.67ms(60fps) = 30점, 33.33ms(30fps) = 15점
    const targetFrameTime = 16.67; // 60 FPS 기준
    const frameTimeScore = Math.max(0, Math.min(30, 30 * (targetFrameTime / avgFrameTime)));
    
    // 렌더 호출 점수 (0-15점): 호출이 적을수록 좋음 (10개 이하 = 15점)
    const renderCalls = this.renderCalls || 0;
    const renderCallsScore = Math.max(0, Math.min(15, 15 * (1 - Math.max(0, renderCalls - 1) / 20)));
    
    // 메모리 효율 점수 (0-15점): 메모리 사용량이 적을수록 좋음
    const totalMemory = (this.renderer.info.memory.geometries || 0) + 
                       (this.renderer.info.memory.textures || 0) + 
                       (this.renderer.info.memory.programs || 0);
    const memoryScore = Math.max(0, Math.min(15, 15 * (1 - totalMemory / 100)));
    
    // 모든 점수를 합산하고 NaN 체크
    const totalScore = Math.round(fpsScore + frameTimeScore + renderCallsScore + memoryScore);
    
    // 최종 점수가 유효한지 확인
    const finalScore = isFinite(totalScore) ? Math.min(100, Math.max(0, totalScore)) : 0;
    
    return {
      total: finalScore,
      breakdown: {
        fps: Math.round(fpsScore) || 0,
        frameTime: Math.round(frameTimeScore) || 0,
        renderCalls: Math.round(renderCallsScore) || 0,
        memory: Math.round(memoryScore) || 0
      },
      details: {
        avgFPS: avgFPS || 0,
        avgFrameTime: avgFrameTime.toFixed(2),
        renderCalls: renderCalls,
        totalMemory: totalMemory
      }
    };
  }
  
  // 베이스라인 성능 저장
  saveBaselinePerformance() {
    const report = this.getPerformanceReport();
    const score = this.calculatePerformanceScore();
    
    this.baselinePerformance.fps = report.avgFPS;
    this.baselinePerformance.frameTime = report.avgFrameTime;
    this.baselinePerformance.renderCalls = report.renderCalls;
    this.baselinePerformance.triangles = report.triangles;
    this.baselinePerformance.score = score.total;
    
    console.log('✅ 베이스라인 성능이 저장되었습니다!');
    console.log('저장된 값:', this.baselinePerformance);
    console.log('성능 점수:', score.total, '점');
    
    return this.baselinePerformance;
  }
  
  // 성능 향상률 계산
  calculateImprovement(current, baseline) {
    if (!baseline || baseline === 0) return null;
    return ((current - baseline) / baseline) * 100;
  }
  
  // 성능 비교 리포트 표시
  showPerformanceComparison() {
    const current = this.getPerformanceReport();
    const currentScore = this.calculatePerformanceScore();
    
    if (!this.baselinePerformance.fps) {
      console.warn('⚠️ 베이스라인 성능이 설정되지 않았습니다.');
      console.log('현재 성능:', current);
      console.log('현재 성능 점수:', currentScore);
      console.log('\n📝 사용법:');
      console.log('1. 최적화 전 코드에서 performanceMonitor.saveBaselinePerformance() 실행');
      console.log('2. 최적화 후 코드에서 performanceMonitor.showPerformanceComparison() 실행');
      return;
    }
    
    const fpsImprovement = this.calculateImprovement(current.avgFPS, this.baselinePerformance.fps);
    const frameTimeImprovement = this.calculateImprovement(this.baselinePerformance.frameTime, current.avgFrameTime);
    const scoreImprovement = this.calculateImprovement(currentScore.total, this.baselinePerformance.score);
    
    // 점수 색상 결정
    const scoreColor = scoreImprovement > 0 ? '#0f0' : scoreImprovement < 0 ? '#f00' : '#ff0';
    const scoreSymbol = scoreImprovement > 0 ? '↑' : scoreImprovement < 0 ? '↓' : '→';
    
    console.log(`
╔════════════════════════════════════════════════════════╗
║          성능 비교 리포트 (최적화 전후)                 ║
╠════════════════════════════════════════════════════════╣
║ 📊 성능 점수                                           ║
║   최적화 전: ${String(this.baselinePerformance.score || 'N/A').padEnd(25)}점 ║
║   최적화 후: ${String(currentScore.total).padEnd(25)}점 ║
║   향상률: ${scoreImprovement ? `${scoreSymbol} ${Math.abs(scoreImprovement).toFixed(1)}%`.padEnd(20) : 'N/A'.padEnd(20)} ║
║   세부 점수:                                           ║
║     FPS: ${String(currentScore.breakdown.fps).padEnd(3)}점 | 프레임시간: ${String(currentScore.breakdown.frameTime).padEnd(3)}점 ║
║     렌더호출: ${String(currentScore.breakdown.renderCalls).padEnd(3)}점 | 메모리: ${String(currentScore.breakdown.memory).padEnd(3)}점 ║
╠════════════════════════════════════════════════════════╣
║ 🎯 FPS                                                 ║
║   최적화 전: ${String(this.baselinePerformance.fps || 'N/A').padEnd(25)} ║
║   최적화 후: ${String(current.avgFPS).padEnd(25)} ║
║   향상률: ${fpsImprovement ? `+${fpsImprovement.toFixed(1)}%`.padEnd(20) : 'N/A'.padEnd(20)} ║
╠════════════════════════════════════════════════════════╣
║ ⏱️  프레임 시간 (ms)                                   ║
║   최적화 전: ${String(this.baselinePerformance.frameTime?.toFixed(2) || 'N/A').padEnd(25)} ║
║   최적화 후: ${String(current.avgFrameTime.toFixed(2)).padEnd(25)} ║
║   향상률: ${frameTimeImprovement ? `+${frameTimeImprovement.toFixed(1)}%`.padEnd(20) : 'N/A'.padEnd(20)} ║
╠════════════════════════════════════════════════════════╣
║ 🔄 렌더 호출                                           ║
║   최적화 전: ${String(this.baselinePerformance.renderCalls || 'N/A').padEnd(25)} ║
║   최적화 후: ${String(current.renderCalls).padEnd(25)} ║
╠════════════════════════════════════════════════════════╣
║ 🔺 삼각형 수                                           ║
║   최적화 전: ${String(this.baselinePerformance.triangles || 'N/A').padEnd(25)} ║
║   최적화 후: ${String(current.triangles).padEnd(25)} ║
╚════════════════════════════════════════════════════════╝
    `);
    
    // 점수 향상 요약
    if (scoreImprovement) {
      console.log(`\n✨ 성능 점수 ${scoreImprovement > 0 ? '향상' : '저하'}: ${Math.abs(scoreImprovement).toFixed(1)}%`);
      if (scoreImprovement > 0) {
        console.log(`🎉 최적화가 성공적으로 적용되었습니다!`);
      }
    }
  }
}

// 전역 함수로도 사용 가능하도록 설정
export function createPerformanceMonitor(renderer) {
  const monitor = new PerformanceMonitor(renderer);
  
  // 전역 함수 등록
  window.performanceMonitor = monitor;
  window.saveBaselinePerformance = () => monitor.saveBaselinePerformance();
  window.showPerformanceComparison = () => monitor.showPerformanceComparison();
  
  // 사용법 안내
  console.log(`
╔════════════════════════════════════════════════════════╗
║          성능 측정 시스템 활성화                       ║
╠════════════════════════════════════════════════════════╣
║ 📊 성능 점수 시스템                                    ║
║   - 화면 왼쪽 상단에 실시간 점수 표시                  ║
║   - 0-100점 스케일 (100점 = 최적)                     ║
║                                                         ║
║ 사용법:                                                 ║
║                                                         ║
║ 1️⃣  현재 성능 확인:                                    ║
║    performanceMonitor.getPerformanceReport()           ║
║    performanceMonitor.calculatePerformanceScore()     ║
║                                                         ║
║ 2️⃣  베이스라인 저장 (최적화 전):                      ║
║    saveBaselinePerformance()                          ║
║                                                         ║
║ 3️⃣  성능 비교 (최적화 후):                            ║
║    showPerformanceComparison()                        ║
║                                                         ║
║ 📝 점수 구성:                                          ║
║   - FPS 점수: 40점 (60 FPS = 만점)                    ║
║   - 프레임시간: 30점 (16.67ms = 만점)                  ║
║   - 렌더호출: 15점 (적을수록 좋음)                     ║
║   - 메모리: 15점 (적을수록 좋음)                       ║
╚════════════════════════════════════════════════════════╝
  `);
  
  return monitor;
}
