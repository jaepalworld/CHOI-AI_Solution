import React from 'react';
import Slider from 'react-slick';
import { Box, Paper, Typography, Rating, Avatar } from '@mui/material';

const ReviewCarousel = () => {
    const reviews = [
        {
            name: '김민서',
            rating: 5,
            comment: '믿을 수 없을 만큼 놀라운 결과였어요! AI가 추천해준 스타일이 정말 잘 어울렸습니다.',
            image: '/assets/images/avatar1.jpg'
        },
        {
            name: '이지원',
            rating: 5,
            comment: '전문가의 조언을 받는 것 같았어요. 새로운 스타일을 시도하는데 많은 도움이 되었습니다.',
            image: '/assets/images/avatar2.jpg'
        },
        {
            name: '박현우',
            rating: 4,
            comment: '사용하기 쉽고 결과물도 만족스러웠습니다. 다음에도 꼭 사용할 거예요!',
            image: '/assets/images/avatar3.jpg'
        }
    ];

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 5000,
        pauseOnHover: true
    };

    return (
        <Box sx={{ maxWidth: '800px', margin: '0 auto' }}>
            <Slider {...settings}>
                {reviews.map((review, index) => (
                    <Box key={index} sx={{ p: 2 }}>
                        <Paper
                            elevation={3}
                            sx={{
                                p: 4,
                                borderRadius: 3,
                                textAlign: 'center',
                                bgcolor: 'rgba(255, 255, 255, 0.9)',
                                backdropFilter: 'blur(10px)',
                                transition: 'transform 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-5px)'
                                }
                            }}
                        >
                            <Avatar
                                src={review.image}
                                sx={{
                                    width: 80,
                                    height: 80,
                                    margin: '0 auto 20px',
                                    border: '3px solid',
                                    borderColor: 'primary.main'
                                }}
                            />
                            <Rating
                                value={review.rating}
                                readOnly
                                sx={{ mb: 2 }}
                            />
                            <Typography
                                variant="body1"
                                sx={{
                                    mb: 3,
                                    fontSize: '1.1rem',
                                    fontStyle: 'italic',
                                    color: 'text.secondary'
                                }}
                            >
                                "{review.comment}"
                            </Typography>
                            <Typography
                                variant="h6"
                                sx={{ fontWeight: 600 }}
                            >
                                {review.name}
                            </Typography>
                        </Paper>
                    </Box>
                ))}
            </Slider>
        </Box>
    );
};

export default ReviewCarousel;