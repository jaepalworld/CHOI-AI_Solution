// import React, { useState, useEffect } from 'react';
// import { Box, Typography, Fade } from '@mui/material';

// // 켄 번즈 효과를 위한 CSS 애니메이션
// const kenBurnsStyles = `
//   /* 다양한 켄 번즈 효과 애니메이션 정의 */
//   @keyframes kenBurns1 {
//     0% {
//       transform: scale(1.1) translate(50px, 0px);
//     }
//     100% {
//       transform: scale(1.2) translate(-50px, 0px);
//     }
//   }

//   @keyframes kenBurns2 {
//     0% {
//       transform: scale(1.2) translate(30px, 0px);
//     }
//     100% {
//       transform: scale(1.1) translate(-70px, 0px);
//     }
//   }

//   @keyframes kenBurns3 {
//     0% {
//       transform: scale(1.1) translate(40px, 0px);
//     }
//     100% {
//       transform: scale(1.2) translate(-60px, 0px);
//     }
//   }

//   @keyframes kenBurns4 {
//     0% {
//       transform: scale(1.2) translate(60px, 0px);
//     }
//     100% {
//       transform: scale(1.1) translate(-40px, 0px);
//     }
//   }

//   /* 이미지 컨테이너 기본 스타일 */
//   .ken-burns-container {
//     position: relative;
//     width: 100%;
//     height: 100vh;
//     overflow: hidden;
//     background-color: #000;
//   }

//   /* 이미지 기본 스타일 */
//   .ken-burns-image {
//   position: absolute;
//   top: 0;
//   left: 0;
//   width: 100%;
//   height: 100%;
//   background-size: contain; /* cover에서 contain으로 변경 */
//   background-position: center;
//   background-repeat: no-repeat; /* 이미지 반복 방지 */
//   opacity: 0;
//   transition: opacity 1s ease-in-out;
// }

//   /* 활성 이미지 스타일 */
//   .ken-burns-image.active {
//     opacity: 1;
//   }

//   /* 각 이미지별 애니메이션 스타일 */
//   .ken-burns-image.effect1.active {
//     animation: kenBurns1 7s ease-out forwards;
//   }

//   .ken-burns-image.effect2.active {
//     animation: kenBurns2 7s ease-out forwards;
//   }

//   .ken-burns-image.effect3.active {
//     animation: kenBurns3 7s ease-out forwards;
//   }

//   .ken-burns-image.effect4.active {
//     animation: kenBurns4 7s ease-out forwards;
//   }

//   /* 콘텐츠 오버레이 스타일 */
//   .content-overlay {
//     position: absolute;
//     bottom: 20%;
//     left: 10%;
//     color: white;
//     z-index: 10;
//     max-width: 500px;
//     text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.5);
//     opacity: 0;
//     transform: translateY(20px);
//     transition: opacity 1s ease, transform 1s ease;
//   }

//   .content-overlay.active {
//     opacity: 1;
//     transform: translateY(0);
//   }
// `;

// // 슬라이더 콘텐츠 데이터
// const sliderContent = [
//     {
//         image: 'main1.png',
//         title: 'DEV Portfolio',
//         subtitle: 'AI Style Transform',
//         description: 'Time, Place, Occasion 스튜디오',
//         effectClass: 'effect1'
//     },
//     {
//         image: 'main2.png',
//         title: 'DEV Portfolio',
//         subtitle: 'AI Style Transform',
//         description: 'Time, Place, Occasion 스튜디오',
//         effectClass: 'effect2'
//     },
//     {
//         image: 'main3.png',
//         title: 'DEV Portfolio',
//         subtitle: 'AI Style Transform',
//         description: 'Time, Place, Occasion 스튜디오',
//         effectClass: 'effect3'
//     }
// ];

// // 켄 번즈 슬라이더 컴포넌트
// const KenBurnsSlider = () => {
//     const [currentSlide, setCurrentSlide] = useState(0);

//     // 슬라이드 자동 전환 효과
//     useEffect(() => {
//         const interval = setInterval(() => {
//             setCurrentSlide((prev) => (prev + 1) % sliderContent.length);
//         }, 7000); // 7초마다 슬라이드 전환

//         return () => clearInterval(interval);
//     }, []);

//     return (
//         <Box className="ken-burns-container">
//             {/* 스타일 삽입 */}
//             <style>{kenBurnsStyles}</style>

//             {/* 이미지 슬라이드 */}
//             {sliderContent.map((content, index) => (
//                 <Box
//                     key={index}
//                     className={`ken-burns-image ${content.effectClass} ${currentSlide === index ? 'active' : ''}`}
//                     sx={{
//                         backgroundImage: `url(/assets/images/${content.image})`,
//                     }}
//                 />
//             ))}

//             {/* 콘텐츠 오버레이 */}
//             {sliderContent.map((content, index) => (
//                 <Fade in={currentSlide === index} timeout={1000} key={`content-${index}`}>
//                     <Box className={`content-overlay ${currentSlide === index ? 'active' : ''}`}>
//                         <Typography
//                             variant="h2"
//                             sx={{
//                                 fontFamily: "'Playfair Display', serif",
//                                 fontWeight: 300,
//                                 letterSpacing: '2px',
//                                 marginBottom: 2
//                             }}
//                         >
//                             {content.title}
//                         </Typography>
//                         <Typography
//                             variant="h5"
//                             sx={{
//                                 fontWeight: 200,
//                                 opacity: 0.9,
//                                 marginBottom: 1
//                             }}
//                         >
//                             {content.subtitle}
//                         </Typography>
//                         <Typography
//                             variant="h6"
//                             sx={{
//                                 fontWeight: 200,
//                                 opacity: 0.8
//                             }}
//                         >
//                             {content.description}
//                         </Typography>
//                     </Box>
//                 </Fade>
//             ))}

//             {/* 슬라이드 인디케이터 */}
//             <Box
//                 sx={{
//                     position: 'absolute',
//                     bottom: '40px',
//                     width: '100%',
//                     display: 'flex',
//                     justifyContent: 'center',
//                     gap: 2,
//                     zIndex: 20
//                 }}
//             >
//                 {sliderContent.map((_, index) => (
//                     <Box
//                         key={`indicator-${index}`}
//                         onClick={() => setCurrentSlide(index)}
//                         sx={{
//                             width: currentSlide === index ? '30px' : '10px',
//                             height: '4px',
//                             backgroundColor: currentSlide === index ? '#f06292' : 'rgba(255,255,255,0.5)',
//                             borderRadius: '2px',
//                             transition: 'all 0.3s ease',
//                             cursor: 'pointer'
//                         }}
//                     />
//                 ))}
//             </Box>
//         </Box>
//     );
// };

// export default KenBurnsSlider; 