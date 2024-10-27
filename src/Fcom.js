
import React, { useState } from 'react';
import NavBar from './NavBar';
import ChatBox from './ChatBox/Chatbox';

export default function Fcom({onlogOut}){
    const [darkMode, setDarkMode] = useState(true);

  
    return(
        <>
      <NavBar darkMode={darkMode} setDarkMode={setDarkMode} onlogOut={onlogOut} />
      <ChatBox darkMode={darkMode} />
        </>
    )
}
