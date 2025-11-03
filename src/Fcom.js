
import React, { useState } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import NavBar from './NavBar';
import ChatBox from './ChatBox/Chatbox';

export default function Fcom({onlogOut}){
    const [darkMode, setDarkMode] = useState(true);

  const appTheme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
    },
  });
    return(
        <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <NavBar darkMode={darkMode} setDarkMode={setDarkMode} onlogOut={onlogOut} />
      <ChatBox darkMode={darkMode} />
    </ThemeProvider>
    )
}