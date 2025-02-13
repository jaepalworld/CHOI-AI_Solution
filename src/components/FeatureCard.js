import React from 'react';
import {
    Card,
    CardMedia,
    CardContent,
    Typography,
    Button,
    Box
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router-dom';

const FeatureCard = ({ feature, isAuthenticated }) => {
    const navigate = useNavigate();

    return (
        <Card
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 24px rgba(33, 150, 243, 0.2)'
                }
            }}
        >
            <CardMedia
                component="img"
                height="280"
                image={`/assets/images/${feature.image}`}
                alt={feature.title}
                sx={{ objectFit: "cover" }}
            />
            <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <Box sx={{ mb: 2 }}>
                    {feature.icon}
                </Box>
                <Typography
                    gutterBottom
                    variant="h5"
                    sx={{ fontWeight: 600 }}
                >
                    {feature.title}
                </Typography>
                <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mb: 3 }}
                >
                    {feature.description}
                </Typography>
                <Button
                    variant="outlined"
                    color="primary"
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                        mt: 2,
                        borderRadius: '25px',
                        px: 4,
                        borderWidth: '2px',
                        '&:hover': {
                            borderWidth: '2px',
                            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                            color: 'white',
                            borderColor: 'transparent'
                        }
                    }}
                    onClick={() => {
                        if (!isAuthenticated) {
                            navigate('/login');
                        }
                    }}
                >
                    Try Now
                </Button>
            </CardContent>
        </Card>
    );
};

export default FeatureCard;