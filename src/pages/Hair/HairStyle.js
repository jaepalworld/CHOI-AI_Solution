// HairStyle.js
import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Button,
    Grid,
    Paper,
    Slider,
    Select,
    MenuItem,
    CircularProgress,
    Alert,
    Snackbar,
    FormControl,
    InputLabel,
    Collapse
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { storage } from '../../firebase/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Cropper from 'react-easy-crop';

// Enhanced styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    background: '#ffffff',
}));

const GradientHeader = styled(Box)(({ theme }) => ({
    background: 'linear-gradient(135deg, #6B73FF 0%, #000DFF 100%)',
    padding: theme.spacing(4),
    borderRadius: '16px 16px 0 0',
    marginBottom: theme.spacing(4),
}));

const ImageContainer = styled(Box)({
    position: 'relative',
    height: '400px',
    width: '100%',
    overflow: 'hidden',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
});

const StyledFormControl = styled(FormControl)(({ theme }) => ({
    marginBottom: theme.spacing(2),
    '& .MuiOutlinedInput-root': {
        borderRadius: '8px',
        '&:hover fieldset': {
            borderColor: theme.palette.primary.main,
        },
    },
}));

const StyledButton = styled(Button)(({ theme }) => ({
    borderRadius: '8px',
    padding: '12px 24px',
    textTransform: 'none',
    fontWeight: 600,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    '&:hover': {
        boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
    },
}));

// Hair style options based on gender
const hairStyleOptions = {
    male: {
        short: ['Crew Cut', 'Fade', 'Undercut', 'Pompadour'],
        medium: ['Quiff', 'Slick Back', 'Textured Crop', 'Side Part'],
        long: ['Man Bun', 'Shoulder Length', 'Layered Cut']
    },
    female: {
        short: ['Pixie Cut', 'Bob Cut', 'Asymmetric Cut', 'Layered Short'],
        medium: ['Lob Cut', 'Layered Medium', 'Shoulder Length Waves'],
        long: ['Long Layers', 'Beach Waves', 'Straight Long', 'V-Cut']
    }
};

const HairStyle = () => {
    // Enhanced state management
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedImageTwo, setSelectedImageTwo] = useState(null);
    const [resultImage, setResultImage] = useState('');
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [brightness, setBrightness] = useState(1);
    const [contrast, setContrast] = useState(1);
    const [selectedGender, setSelectedGender] = useState('');
    const [selectedLength, setSelectedLength] = useState('');
    const [selectedStyle, setSelectedStyle] = useState('');
    const [resultHistory, setResultHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [croppedImageUrl, setCroppedImageUrl] = useState(null);

    // Load history from localStorage
    useEffect(() => {
        try {
            const storedHistory = localStorage.getItem('resultHistory');
            if (storedHistory) {
                setResultHistory(JSON.parse(storedHistory));
            }
        } catch (error) {
            console.error('Error loading history:', error);
        }
    }, []);

    // Enhanced image upload handler
    const handleImageUpload = useCallback((event, setImage) => {
        try {
            const file = event.target.files[0];
            if (file) {
                if (file.size > 10 * 1024 * 1024) {
                    setError('File size should be less than 10MB');
                    return;
                }
                if (!file.type.startsWith('image/')) {
                    setError('Please upload an image file');
                    return;
                }
                setImage(file);
                setError('');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            setError('Error uploading image');
        }
    }, []);

    // Enhanced style selection handlers
    const handleGenderChange = useCallback((event) => {
        setSelectedGender(event.target.value);
        setSelectedLength('');
        setSelectedStyle('');
    }, []);

    const handleLengthChange = useCallback((event) => {
        setSelectedLength(event.target.value);
        setSelectedStyle('');
    }, []);

    const handleStyleChange = useCallback((event) => {
        setSelectedStyle(event.target.value);
    }, []);

    // Image cropping handler
    const onCropComplete = useCallback(async (croppedArea, croppedAreaPixels) => {
        try {
            if (!selectedImage) return;

            const image = new Image();
            image.src = URL.createObjectURL(selectedImage);

            await new Promise((resolve) => {
                image.onload = resolve;
            });

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            canvas.width = croppedAreaPixels.width;
            canvas.height = croppedAreaPixels.height;

            ctx.drawImage(
                image,
                croppedAreaPixels.x,
                croppedAreaPixels.y,
                croppedAreaPixels.width,
                croppedAreaPixels.height,
                0,
                0,
                croppedAreaPixels.width,
                croppedAreaPixels.height
            );

            ctx.filter = `brightness(${brightness}) contrast(${contrast})`;

            const croppedImageUrl = canvas.toDataURL('image/jpeg');
            setCroppedImageUrl(croppedImageUrl);

        } catch (error) {
            console.error('Error cropping image:', error);
            setError('Error cropping image');
        }
    }, [selectedImage, brightness, contrast]);

    // Enhanced upload handler
    const handleUploadClick = async () => {
        try {
            setLoading(true);
            setError('');

            if (!selectedImage || !selectedImageTwo) {
                setError('Please select both images');
                return;
            }

            if (!selectedGender || !selectedLength || !selectedStyle) {
                setError('Please complete style selection');
                return;
            }

            const croppedImageBlob = await fetch(croppedImageUrl).then(r => r.blob());
            const storageRefOne = ref(storage, `images/${Date.now()}-cropped.jpg`);
            const storageRefTwo = ref(storage, `images/${Date.now()}-reference.jpg`);

            await Promise.all([
                uploadBytes(storageRefOne, croppedImageBlob),
                uploadBytes(storageRefTwo, selectedImageTwo)
            ]);

            const [downloadUrlOne, downloadUrlTwo] = await Promise.all([
                getDownloadURL(storageRefOne),
                getDownloadURL(storageRefTwo)
            ]);

            // TODO: AI processing logic here
            setResultImage(downloadUrlOne);

            const updatedHistory = [...resultHistory, downloadUrlOne];
            setResultHistory(updatedHistory);
            localStorage.setItem('resultHistory', JSON.stringify(updatedHistory));

        } catch (error) {
            console.error('Error processing images:', error);
            setError('Error processing images');
        } finally {
            setLoading(false);
        }
    };

    const handleCloseError = () => {
        setError('');
    };

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', py: 4, bgcolor: '#f5f5f5' }}>
            <StyledPaper>
                <GradientHeader>
                    <Typography variant="h3" align="center" sx={{ color: '#ffffff', fontWeight: 700, mb: 1 }}>
                        HAIR AI
                    </Typography>
                    <Typography variant="h6" align="center" sx={{ color: '#ffffff', opacity: 0.9 }}>
                        Transform your hairstyle with AI
                    </Typography>
                </GradientHeader>

                <Grid container spacing={4}>
                    {/* Left Panel: Source Image and Crop */}
                    <Grid item xs={12} md={6}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <StyledPaper variant="outlined">
                                    <ImageContainer>
                                        {selectedImage ? (
                                            <>
                                                <Cropper
                                                    image={URL.createObjectURL(selectedImage)}
                                                    crop={crop}
                                                    zoom={zoom}
                                                    aspect={1}
                                                    onCropChange={setCrop}
                                                    onCropComplete={onCropComplete}
                                                    onZoomChange={setZoom}
                                                />
                                                <Box sx={{ mt: 2 }}>
                                                    <Typography variant="subtitle1" gutterBottom>
                                                        Brightness
                                                    </Typography>
                                                    <Slider
                                                        value={brightness}
                                                        min={0.5}
                                                        max={1.5}
                                                        step={0.1}
                                                        onChange={(e, value) => setBrightness(value)}
                                                    />
                                                    <Typography variant="subtitle1" gutterBottom>
                                                        Contrast
                                                    </Typography>
                                                    <Slider
                                                        value={contrast}
                                                        min={0.5}
                                                        max={1.5}
                                                        step={0.1}
                                                        onChange={(e, value) => setContrast(value)}
                                                    />
                                                </Box>
                                            </>
                                        ) : (
                                            <Box sx={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                height: '100%',
                                                bgcolor: '#f8f9fa',
                                                borderRadius: '12px'
                                            }}>
                                                <Typography variant="h6" color="text.secondary">
                                                    Upload your photo
                                                </Typography>
                                            </Box>
                                        )}
                                    </ImageContainer>
                                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                                        <input
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            id="source-image-upload"
                                            type="file"
                                            onChange={(e) => handleImageUpload(e, setSelectedImage)}
                                        />
                                        <label htmlFor="source-image-upload">
                                            <StyledButton variant="contained" component="span">
                                                Upload Photo
                                            </StyledButton>
                                        </label>
                                    </Box>
                                </StyledPaper>
                            </Grid>

                            {/* Style Selection Section */}
                            <Grid item xs={12}>
                                <StyledPaper variant="outlined">
                                    <Box sx={{ mb: 3 }}>
                                        <Typography variant="h6" gutterBottom>
                                            Style Selection
                                        </Typography>

                                        <StyledFormControl fullWidth>
                                            <InputLabel>Gender</InputLabel>
                                            <Select
                                                value={selectedGender}
                                                onChange={handleGenderChange}
                                                label="Gender"
                                            >
                                                <MenuItem value="">Select gender</MenuItem>
                                                <MenuItem value="male">Male</MenuItem>
                                                <MenuItem value="female">Female</MenuItem>
                                            </Select>
                                        </StyledFormControl>

                                        <Collapse in={!!selectedGender}>
                                            <StyledFormControl fullWidth>
                                                <InputLabel>Hair Length</InputLabel>
                                                <Select
                                                    value={selectedLength}
                                                    onChange={handleLengthChange}
                                                    label="Hair Length"
                                                >
                                                    <MenuItem value="">Select length</MenuItem>
                                                    <MenuItem value="short">Short</MenuItem>
                                                    <MenuItem value="medium">Medium</MenuItem>
                                                    <MenuItem value="long">Long</MenuItem>
                                                </Select>
                                            </StyledFormControl>
                                        </Collapse>

                                        <Collapse in={!!selectedLength}>
                                            <StyledFormControl fullWidth>
                                                <InputLabel>Hair Style</InputLabel>
                                                <Select
                                                    value={selectedStyle}
                                                    onChange={handleStyleChange}
                                                    label="Hair Style"
                                                >
                                                    <MenuItem value="">Select style</MenuItem>
                                                    {selectedGender && selectedLength &&
                                                        hairStyleOptions[selectedGender][selectedLength].map((style) => (
                                                            <MenuItem key={style} value={style}>
                                                                {style}
                                                            </MenuItem>
                                                        ))
                                                    }
                                                </Select>
                                            </StyledFormControl>
                                        </Collapse>
                                    </Box>

                                    {/* Reference Image Upload */}
                                    <Box sx={{ height: '300px', display: 'flex', flexDirection: 'column' }}>
                                        {selectedImageTwo ? (
                                            <img
                                                src={URL.createObjectURL(selectedImageTwo)}
                                                alt="Reference"
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                    borderRadius: '8px'
                                                }}
                                            />
                                        ) : (
                                            <Box sx={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                height: '100%',
                                                bgcolor: '#f8f9fa',
                                                borderRadius: '12px'
                                            }}>
                                                <Typography variant="h6" color="text.secondary">
                                                    Upload reference hairstyle
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>
                                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                                        <input
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            id="reference-image-upload"
                                            type="file"
                                            onChange={(e) => handleImageUpload(e, setSelectedImageTwo)}
                                        />
                                        <label htmlFor="reference-image-upload">
                                            <StyledButton variant="contained" component="span">
                                                Upload Reference
                                            </StyledButton>
                                        </label>
                                    </Box>
                                </StyledPaper>
                            </Grid>
                        </Grid>
                    </Grid>

                    {/* Right Panel: Result Image */}
                    <Grid item xs={12} md={6}>
                        <StyledPaper variant="outlined">
                            <Box sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                minHeight: '600px'
                            }}>
                                {loading ? (
                                    <Box sx={{ textAlign: 'center' }}>
                                        <CircularProgress size={60} />
                                        <Typography variant="h6" sx={{ mt: 2 }}>
                                            Processing your image...
                                        </Typography>
                                    </Box>
                                ) : resultImage ? (
                                    <img
                                        src={resultImage}
                                        alt="Result"
                                        style={{
                                            width: '100%',
                                            height: 'auto',
                                            maxHeight: '100%',
                                            objectFit: 'contain',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                                        }}
                                    />
                                ) : (
                                    <Box sx={{
                                        textAlign: 'center',
                                        p: 4,
                                        bgcolor: '#f8f9fa',
                                        borderRadius: '12px',
                                        width: '100%'
                                    }}>
                                        <Typography variant="h6" color="text.secondary">
                                            Your transformed hairstyle will appear here
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                            Upload your photo and select a style to begin
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </StyledPaper>
                    </Grid>
                </Grid>

                {/* Transform Button */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <StyledButton
                        variant="contained"
                        size="large"
                        onClick={handleUploadClick}
                        disabled={loading || !selectedImage || !selectedImageTwo || !selectedStyle}
                        sx={{
                            minWidth: '200px',
                            background: loading ?
                                'linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)' :
                                'linear-gradient(135deg, #6B73FF 0%, #000DFF 100%)',
                        }}
                    >
                        {loading ? 'Processing...' : 'Transform Hair'}
                    </StyledButton>
                </Box>

                {/* History Section */}
                {resultHistory.length > 0 && (
                    <Box sx={{ mt: 6 }}>
                        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                            Your Style History
                        </Typography>
                        <Grid container spacing={2}>
                            {resultHistory.map((image, index) => (
                                <Grid item xs={12} sm={6} md={4} key={index}>
                                    <Box
                                        sx={{
                                            position: 'relative',
                                            paddingTop: '100%',
                                            borderRadius: '12px',
                                            overflow: 'hidden',
                                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                        }}
                                    >
                                        <img
                                            src={image}
                                            alt={`Result ${index + 1}`}
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                            }}
                                        />
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                )}

                {/* Error Message */}
                <Snackbar
                    open={!!error}
                    autoHideDuration={6000}
                    onClose={handleCloseError}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert
                        onClose={handleCloseError}
                        severity="error"
                        sx={{
                            width: '100%',
                            borderRadius: '8px'
                        }}
                    >
                        {error}
                    </Alert>
                </Snackbar>
            </StyledPaper>
        </Box>
    );
};

export default HairStyle;