import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
 AppBar, 
 Toolbar, 
 Typography, 
 Container, 
 Box, 
 Card, 
 CardContent,
 Grid,
 Button,
 IconButton,
 useTheme,
 useMediaQuery
} from '@mui/material';
import { Home, Info, ContactMail, GitHub, LinkedIn, Menu } from '@mui/icons-material';

const Header = () => {
 const theme = useTheme();
 const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

 return (
   <AppBar position="fixed" color="transparent" elevation={0} sx={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
     <Toolbar>
       <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 'bold', color: '#333' }}>
         Portfolio
       </Typography>
       {isMobile ? (
         <IconButton color="primary"><Menu /></IconButton>
       ) : (
         <Box>
           <Button color="primary" startIcon={<Home />}>Home</Button>
           <Button color="primary" startIcon={<Info />}>About</Button>
           <Button color="primary" startIcon={<ContactMail />}>Contact</Button>
         </Box>
       )}
     </Toolbar>
   </AppBar>
 );
};

const HomePage = () => {
 const theme = useTheme();
 const navigate = useNavigate();

 const projects = [
   {
     id: 1,
     title: "HairAI Style",
     description: "AI-powered hairstyle simulation application"
   },
   {
     id: 2,
     title: "Project 2",
     description: "An innovative web application built with React and Material-UI."
   },
   {
     id: 3,
     title: "Project 3",
     description: "An innovative web application built with React and Material-UI."
   }
 ];

 return (
   <Box sx={{ bgcolor: '#f5f5f7' }}>
     <Header />
     <Container maxWidth="lg" sx={{ pt: 12, pb: 8 }}>
       <Box sx={{ 
         my: 8, 
         p: 6, 
         borderRadius: 4,
         background: 'linear-gradient(135deg, #6B46C1 0%, #3B82F6 100%)',
         color: 'white',
         textAlign: 'center'
       }}>
         <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
           Developer
         </Typography>
         <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
           Building beautiful web experiences
         </Typography>
         <Box sx={{ mt: 3 }}>
           <IconButton color="inherit" sx={{ mx: 1 }}><GitHub /></IconButton>
           <IconButton color="inherit" sx={{ mx: 1 }}><LinkedIn /></IconButton>
         </Box>
       </Box>

       <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#1a1a1a' }}>
         Featured Projects
       </Typography>
       
       <Grid container spacing={4}>
         {projects.map((project) => (
           <Grid item xs={12} md={4} key={project.id}>
             <Card sx={{ 
               height: '100%',
               display: 'flex',
               flexDirection: 'column',
               transition: 'transform 0.2s',
               '&:hover': {
                 transform: 'translateY(-4px)',
                 boxShadow: theme.shadows[8]
               }
             }}>
               <Box sx={{ 
                 height: 200, 
                 backgroundColor: `rgb(${Math.random() * 50 + 100}, ${Math.random() * 50 + 100}, ${Math.random() * 50 + 200})` 
               }} />
               <CardContent sx={{ flexGrow: 1 }}>
                 <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                   {project.title}
                 </Typography>
                 <Typography color="text.secondary">
                   {project.description}
                 </Typography>
                 <Button 
                   variant="outlined" 
                   color="primary" 
                   sx={{ mt: 2 }}
                   onClick={() => navigate(project.id === 1 ? '/hairai' : '#')}
                 >
                   View Project
                 </Button>
               </CardContent>
             </Card>
           </Grid>
         ))}
       </Grid>
     </Container>
     
     <Box component="footer" sx={{ bgcolor: '#1a1a1a', color: 'white', py: 6, mt: 8 }}>
       <Container maxWidth="lg">
         <Typography variant="body2" align="center">
           © 2025 Your Name. All rights reserved.
         </Typography>
       </Container>
     </Box>
   </Box>
 );
};

export default HomePage;