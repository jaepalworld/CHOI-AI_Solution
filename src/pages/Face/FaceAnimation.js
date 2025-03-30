import React, { useState, useEffect } from 'react';

/**
 * FaceAnimation 컴포넌트
 * 
 * 이 컴포넌트는 얼굴 변환 과정을 애니메이션으로 시각화합니다.
 * ComfyUI와 서버 기능 구현이 완료된 후 활성화할 예정입니다.
 * 
 * @param {Object} props 컴포넌트 속성
 * @param {string} props.originalImage 원본 이미지 URL 또는 데이터
 * @param {string} props.resultImage 결과 이미지 URL 또는 데이터
 * @param {Object} props.processingData 처리 과정 데이터 (선택적)
 * @param {Function} props.onComplete 애니메이션 완료 콜백 (선택적)
 */
const FaceAnimation = ({ 
  originalImage, 
  resultImage, 
  processingData = null, 
  onComplete = () => {} 
}) => {
  // 상태 관리
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [currentStage, setCurrentStage] = useState(null);

  // 기본 처리 단계 정의
  const defaultStages = [
    { percent: 0, label: "원본", description: "원본 이미지 분석" },
    { percent: 20, label: "얼굴 인식", description: "이미지에서 얼굴 특징점 탐지" },
    { percent: 40, label: "특징 추출", description: "얼굴 특징 및 구조 분석" },
    { percent: 60, label: "스타일 적용", description: "롤모델 스타일 적용 시작" },
    { percent: 80, label: "세부 조정", description: "세부 디테일 및 색상 조정" },
    { percent: 100, label: "최종 결과", description: "최종 변환 이미지 완성" }
  ];

  // 실제 사용할 처리 단계 (props로 받은 데이터가 있으면 사용)
  const stages = processingData?.stages || defaultStages;

  /**
   * 애니메이션 효과를 관리하는 useEffect
   * requestAnimationFrame을 사용하여 부드러운 애니메이션 구현
   */
  useEffect(() => {
    // ComfyUI와 서버 기능 구현 후 주석 해제
    /*
    let animationFrame;
    let lastTimestamp = 0;
    
    const animate = (timestamp) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      const deltaTime = timestamp - lastTimestamp;
      
      if (isPlaying && progress < 100) {
        // 애니메이션 속도에 따라 진행도 증가
        const increment = (deltaTime / 1000) * 20 * animationSpeed;
        setProgress(prev => Math.min(prev + increment, 100));
        lastTimestamp = timestamp;
        animationFrame = requestAnimationFrame(animate);
      } else if (progress >= 100) {
        setIsPlaying(false);
        onComplete();
      }
    };
    
    if (isPlaying) {
      animationFrame = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
    */
  }, [isPlaying, progress, animationSpeed, onComplete]);

  /**
   * 현재 처리 단계를 계산하는 useEffect
   */
  useEffect(() => {
    // ComfyUI와 서버 기능 구현 후 주석 해제
    /*
    const newStage = stages.find((stage, index) => {
      const nextStage = stages[index + 1];
      return progress >= stage.percent && (!nextStage || progress < nextStage.percent);
    }) || stages[stages.length - 1];
    
    setCurrentStage(newStage);
    */
  }, [progress, stages]);

  /**
   * 애니메이션 재생/일시정지 토글
   */
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };
  
  /**
   * 애니메이션 초기화
   */
  const resetAnimation = () => {
    setIsPlaying(false);
    setProgress(0);
  };
  
  /**
   * 애니메이션 속도 변경 핸들러
   */
  const handleSpeedChange = (e) => {
    setAnimationSpeed(parseFloat(e.target.value));
  };
  
  /**
   * 진행 슬라이더 변경 핸들러
   */
  const handleProgressChange = (e) => {
    setProgress(parseFloat(e.target.value));
  };

  // TODO: ComfyUI와 서버 기능 구현 후 아래 렌더링 코드 주석 해제 및 최종 구현
  
  return (
    <div>
      {/* 
      애니메이션 컴포넌트 구현 예정
      
      <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-center mb-4 text-blue-600">
          얼굴 변환 과정 애니메이션
        </h2>
        
        {/* 이미지 컨테이너 *//*}
        <div className="relative w-full h-96 rounded-lg overflow-hidden bg-gray-100 mb-4">
          {/* 원본 이미지 (항상 표시) *//*}
          <img
            src={originalImage}
            alt="원본 이미지"
            className="absolute w-full h-full object-cover"
            style={{ zIndex: 1 }}
          />
          
          {/* 결과 이미지 (블렌드 효과) *//*}
          <img
            src={resultImage}
            alt="변환된 이미지"
            className="absolute w-full h-full object-cover transition-opacity duration-300"
            style={{ 
              zIndex: 2,
              opacity: progress / 100
            }}
          />
          
          {/* 현재 단계 표시 *//*}
          {currentStage && (
            <div className="absolute bottom-4 left-4 z-10 bg-black bg-opacity-70 text-white px-3 py-1 rounded">
              <p className="text-sm">
                {currentStage.label} ({Math.round(progress)}%)
              </p>
            </div>
          )}
        </div>
        
        {/* 진행 상태 표시줄 *//*}
        <div className="mb-4 px-1">
          <input
            type="range"
            value={progress}
            onChange={handleProgressChange}
            min="0"
            max="100"
            step="0.1"
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
        
        {/* 컨트롤 버튼 *//*}
        <div className="flex justify-center space-x-4 mb-4">
          <button
            onClick={togglePlay}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-400 text-white rounded-md shadow-md flex items-center justify-center"
          >
            <span className="mr-1">{isPlaying ? '■' : '▶'}</span>
            {isPlaying ? '일시정지' : '재생'}
          </button>
          
          <button
            onClick={resetAnimation}
            className="px-4 py-2 border border-blue-500 text-blue-500 rounded-md flex items-center justify-center"
          >
            <span className="mr-1">↺</span>
            처음부터
          </button>
        </div>
        
        {/* 애니메이션 속도 조절 *//*}
        <div className="flex items-center px-1 mb-6">
          <label className="mr-3 text-sm min-w-20" htmlFor="speed-slider">
            애니메이션 속도:
          </label>
          <input
            id="speed-slider"
            type="range"
            value={animationSpeed}
            onChange={handleSpeedChange}
            min="0.5"
            max="3"
            step="0.5"
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="ml-2 text-sm text-gray-700">{animationSpeed}x</span>
        </div>
        
        {/* 단계별 설명 *//*}
        <div className="mt-6 border-t pt-4">
          <h3 className="font-bold mb-2 text-gray-700">
            변환 단계 설명:
          </h3>
          <ul className="list-disc pl-5 space-y-1">
            {stages.map((stage) => (
              <li 
                key={stage.percent}
                className={currentStage?.percent === stage.percent ? "text-blue-600 font-semibold" : "text-gray-700"}
              >
                <span className="text-sm">
                  {stage.label} ({stage.percent}%): {stage.description}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      */}
    </div>
  );
};

export default FaceAnimation;