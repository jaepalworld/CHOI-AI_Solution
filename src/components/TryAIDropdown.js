import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Button,
    ClickAwayListener,
    Grow,
    Paper,
    Popper,
    MenuItem,
    MenuList,
    Box
} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

const TryAIDropdown = ({ isAuthenticated }) => {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const anchorRef = useRef(null);

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    const handleClose = (event) => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) {
            return;
        }
        setOpen(false);
    };

    const handleMenuItemClick = (route) => {
        if (!isAuthenticated) {
            alert('로그인을 해주세요.');
            navigate('/login');
        } else {
            navigate(route);
        }
        setOpen(false);
    };

    function handleListKeyDown(event) {
        if (event.key === 'Tab') {
            event.preventDefault();
            setOpen(false);
        } else if (event.key === 'Escape') {
            setOpen(false);
        }
    }

    // Return focus to the button when we transitioned from !open -> open
    const prevOpen = useRef(open);
    useEffect(() => {
        if (prevOpen.current === true && open === false) {
            anchorRef.current.focus();
        }
        prevOpen.current = open;
    }, [open]);

    return (
        <Box>
            <Button
                ref={anchorRef}
                aria-controls={open ? 'try-ai-menu' : undefined}
                aria-expanded={open ? 'true' : undefined}
                aria-haspopup="true"
                onClick={handleToggle}
                endIcon={<ArrowDropDownIcon />}
                sx={{
                    color: 'text.primary',
                    fontWeight: 500,
                    '&:hover': { color: 'primary.main' }
                }}
            >
                Try AI
            </Button>
            <Popper
                open={open}
                anchorEl={anchorRef.current}
                role={undefined}
                placement="bottom-start"
                transition
                disablePortal
                sx={{ zIndex: 1300 }}
            >
                {({ TransitionProps, placement }) => (
                    <Grow
                        {...TransitionProps}
                        style={{
                            transformOrigin:
                                placement === 'bottom-start' ? 'left top' : 'left bottom',
                        }}
                    >
                        <Paper
                            elevation={3}
                            sx={{
                                borderRadius: '8px',
                                overflow: 'hidden',
                                mt: 1
                            }}
                        >
                            <ClickAwayListener onClickAway={handleClose}>
                                <MenuList
                                    autoFocusItem={open}
                                    id="try-ai-menu"
                                    aria-labelledby="try-ai-button"
                                    onKeyDown={handleListKeyDown}
                                    sx={{ width: 200 }}
                                >
                                    <MenuItem onClick={() => handleMenuItemClick('/advertising')}>
                                        룩북 에디터
                                    </MenuItem>
                                    <MenuItem onClick={() => handleMenuItemClick('/hair/style')}>
                                        헤어 스튜디오
                                    </MenuItem>
                                    <MenuItem onClick={() => handleMenuItemClick('/face/style')}>
                                        페이스 스튜디오
                                    </MenuItem>
                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    </Grow>
                )}
            </Popper>
        </Box>
    );
};

export default TryAIDropdown;