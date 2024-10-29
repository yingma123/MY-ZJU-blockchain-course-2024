import React from 'react';
import logo from './logo.svg';
import './App.css';
import HouseTradePage from "./pages/buyMyRoom/buyMyRoom";
import Login from "./pages/login/login";
import { Route, Routes} from 'react-router-dom'

function App() {

  return (
      <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/houseTrade" element={<HouseTradePage />} />
      </Routes>
  );
}

export default App;
