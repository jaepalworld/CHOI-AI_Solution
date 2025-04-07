import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Box, Container, ToggleButtonGroup, ToggleButton, styled } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import FaceStan from './FaceStan';
import FacePro from './FacePro';

// Styled toggle button
const StyledToggleButton = styled(ToggleButton)(({ theme }) => ({
    fontWeight: 600,
    borderRadius: '24px',
    padding: '8px 16px',
    '&.MuiToggleButton-root': {
        border: 'none',
        backgroundColor: 'transparent',
        color: theme.palette.text.secondary,
        '&.Mui-selected': {
            backgroundColor: 'rgba(33, 150, 243, 0.08)',
            color: '#2196F3',
            boxShadow: '0 2px 8px rgba(33, 150, 243, 0.25)',
        },
    },
}));

const FaceStyleToggle = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Determine which version is active based on the current path
    const currentVersion = location.pathname.includes('/pro') ? 'pro' : 'stan';
    
    // Version change handler
    const handleVersionChange = (event, newVersion) => {
        if (newVersion) {
            if (newVersion === 'pro') {
                navigate('/face/pro');
            } else {
                navigate('/face/stan');
            }
        }
    };
    
    return (
        <>
            {/* Version toggle button group - displayed at the top of both versions */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4, pt: 3 }}>
                <ToggleButtonGroup
                    value={currentVersion}
                    exclusive
                    onChange={handleVersionChange}
                    aria-label="version selector"
                    sx={{
                        background: '#ffffff',
                        p: 0.5,
                        borderRadius: '28px',
                        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)'
                    }}
                >
                    <StyledToggleButton value="stan">
                        Standard
                    </StyledToggleButton>
                    <StyledToggleButton value="pro">
                        <AutoAwesomeIcon sx={{ mr: 1, fontSize: 16 }} />
                        Pro
                    </StyledToggleButton>
                </ToggleButtonGroup>
            </Box>
            
            {/* Routes for different versions */}
            <Routes>
                <Route path="/stan" element={<FaceStan />} />
                <Route path="/pro" element={<FacePro />} />
                <Route path="/" element={<Navigate to="/face/stan" replace />} />
            </Routes>
        </>
    );
};

export default FaceStyleToggle;