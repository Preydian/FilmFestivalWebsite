import React from 'react';
import './App.css';
import './css/film.css';
import './css/header.css';
import './css/filters.css';
import './css/profile.css';
import './css/animation.css';
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Films from "./components/Films";
import Film from "./components/Film";
import Profile from "./components/Profile";
import NotFound from "./components/NotFound";

function App() {
  return (
      <div className="App">
        <Router>
          <div>
            <Routes>
              <Route path="/" element={<Films/>}/>
              <Route path="/films" element={<Films/>}/>
              <Route path="/profile" element={<Profile/>}/>
              <Route path="/films/:id" element={<Film/>}/>
              <Route path="*" element={<NotFound/>}/>
            </Routes>
          </div>
        </Router>
      </div>
  );
}
export default App;
