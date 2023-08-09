import { useEffect, useState } from 'react';
// import './App.css';
import motokoLogo from './assets/motoko_moving.png';
import motokoShadowLogo from './assets/motoko_shadow.png';
import reactLogo from './assets/react.svg';
import viteLogo from './assets/vite.svg';

import { backend } from './declarations/backend';
import HomePage from './pages/HomePage';
import { NavBar, NavBarSection, Button, ProfileImage } from './components';


function App() {
  let userIsLog = true;
  return (
    <>
      <NavBar>
        {
          !userIsLog ? (
            <>
              <NavBarSection text="Create "/>
              <NavBarSection text="Tutorial"/>
              <NavBarSection text="About us"/>
              <Button title="Login" color="white"/>
              <Button title="Register" color="purple"/>
            </>
          ) : (
            <>
              <NavBarSection text="Create"/>
              <NavBarSection text="Programs"/>
              <NavBarSection text="Account"/>
              <ProfileImage image={motokoLogo}/> 
            </>
          )
        }
      </NavBar>
    </>
  );
}

export default App;
