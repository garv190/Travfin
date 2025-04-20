import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
// import AdbIcon from '@mui/icons-material/Adb';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

// const pages = ['Chatbot', 'Conversation', 'Travel Guide'];


const pages = [
  { value: 'Chatbot', url: '/chatbot' },
  { value: 'Conversation', url: '/conversation' },
  { value: 'Travel Guide', url: '/travel' }
  ];


const settings = [
  { value: 'Profile', url: '/profile' },
  { value: 'Sign Up', url: '/signup' },
  { value: 'Log In', url: '/signin' },
  { value: 'Logout', url: '/logout' }
];

function ResponsiveAppBar() {
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  
  const [setUser] = useState(null);
    const [userf, setUserf] = useState({ name: "", e: "" }); // ✅ Clear initial state
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/getmyprofile`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUserf({ name: data.user1, e: data.detail1 });
        }
      })
      .catch(err => console.log(err));
  }, [userf]);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  // const handleLogout = async () => {
  //   try {
  //     await fetch('${process.env.REACT_APP_API_URL}/logout', {
  //       method: 'POST',
  //       credentials: 'include'
  //     });
  //     setUserf.name=""
  //     setUser(null);
  //     navigate('/signin');
  //   } catch (err) {
  //     console.error('Logout failed:', err);
  //   }
  //   handleCloseUserMenu();
  // };




  const handleLogout = async () => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      setUserf({ name: "#", e: "#" }); // Reset to "#" on logout
      setUser(null);
      navigate('/signin'); // Navigate to login page after logout
    } catch (err) {
      console.error('Logout failed:', err);
    }
    handleCloseUserMenu();
  };










  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* <AdbIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} /> */}
          {/* <img
            src="/travfinlogo.png"
             alt="logo"
             style={{ width: 70, height: 70, marginRight: 10, display: 'flex' }}
/> */}
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            TravFin
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton size="large" onClick={handleOpenNavMenu} color="inherit">
              <MenuIcon />
            </IconButton>
            <Menu
  anchorEl={anchorElNav}
  open={Boolean(anchorElNav)}
  onClose={handleCloseNavMenu}
  sx={{ display: { xs: 'block', md: 'none' } }}
>
  {/* Pages for mobile */}
  {pages.map((page) => (
    <Link to={page.url} key={page.value} style={{ textDecoration: 'none', color: 'inherit' }}>
      <MenuItem onClick={handleCloseNavMenu}>
        <Typography textAlign="center">{page.value}</Typography>
      </MenuItem>
    </Link>
  ))}


</Menu>
          </Box>

          <Typography
            variant="h5"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            TravFin
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
          {pages.map((page) => (
  <Link
    to={page.url}
    key={page.value}
    style={{ textDecoration: 'none', color: 'inherit' }}
  >
    <Button sx={{ my: 2, color: 'white', display: 'block' }}>
      {page.value}
    </Button>
  </Link>
))}

            
          </Box>

          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt="User Avatar">{userf.name ? userf.name.charAt(0).toUpperCase() : ''}</Avatar>    

                {/* charAt function used to get index character only */}

              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              anchorEl={anchorElUser}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {settings.map((setting) =>
                setting.value === 'Logout' ? (
                  <MenuItem key={setting.value} onClick={handleLogout}>
                    <Typography textAlign="center">{setting.value}</Typography>
                  </MenuItem>
                ) : (
                  <Link
                    to={setting.url}
                    key={setting.value}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <MenuItem onClick={handleCloseUserMenu}>
                      <Typography textAlign="center">{setting.value}</Typography>
                    </MenuItem>
                  </Link>
                )
              )},
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default ResponsiveAppBar;
