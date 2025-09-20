===FILE: /app/frontend/src/App.js
/app/frontend/src/App.js:
1|import { useEffect } from "react";
2|import "./App.css";
3|import { BrowserRouter, Routes, Route } from "react-router-dom";
4|import axios from "axios";
5|
6|const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
7|const API = `${BACKEND_URL}/api`;
8|
9|const Home = () => {
10|  const helloWorldApi = async () => {
11|    try {
12|      const response = await axios.get(`${API}/`);
13|      console.log(response.data.message);
14|    } catch (e) {
15|      console.error(e, `errored out requesting / api`);
16|    }
17|  };
18|
19|  useEffect(() => {
20|    helloWorldApi();
21|  }, []);
22|
23|  return (
24|    <div>
25|      <header className="App-header">
26|        <a
27|          className="App-link"
28|          href="https://emergent.sh"
29|          target="_blank"
30|          rel="noopener noreferrer"
31|        >
32|          <img src="https://avatars.githubusercontent.com/in/1201222?s=120&u=2686cf91179bbafbc7a71bfbc43004cf9ae1acea&v=4" />
33|        </a>
34|        <p className="mt-5">Building something incredible ~!</p>
35|      </header>
36|    </div>
37|  );
38|};


import React, { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { Play, Pause, SkipForward, RotateCcw, Shuffle } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Color constants
const CUBE_COLORS = {
  white: '#ffffff',
  yellow: '#ffff00',
  red: '#ff0000',
  orange: '#ff6500',
  blue: '#0066ff',
  green: '#00ff00'
};

const COLOR_NAMES = Object.keys(CUBE_COLORS);

// Cube face component
const CubeFace = ({ face, colors, onColorChange, faceName }) => {
  return (
    <div className="cube-face">
      <div className="face-label">{faceName.toUpperCase()}</div>
      <div className="face-grid">
        {colors.map((color, index) => (
          <div
            key={index}
            className="cube-square"
            style={{ backgroundColor: CUBE_COLORS[color] }}
            onClick={() => onColorChange(face, index)}
          >
            <div className="square-overlay"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Color picker component
const ColorPicker = ({ selectedColor, onColorSelect, onClose }) => {
  if (!selectedColor) return null;
  
  return (
    <div className="color-picker-overlay" onClick={onClose}>
      <div className="color-picker" onClick={e => e.stopPropagation()}>
        <h3>Select Color</h3>
        <div className="color-options">
          {COLOR_NAMES.map(colorName => (
            <div
              key={colorName}
              className="color-option"
              style={{ backgroundColor: CUBE_COLORS[colorName] }}
              onClick={() => onColorSelect(colorName)}
            >
              {colorName}
            </div>
          ))}
        </div>
        <Button onClick={onClose} variant="outline" className="mt-4">Cancel</Button>
      </div>
    </div>
  );
};

// Solution step component
const SolutionStep = ({ step, isActive, onExecute }) => {
  return (
    <Card className={`solution-step ${isActive ? 'active' : ''}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Step {step.step_number}: {step.title}</span>
          {isActive && <Badge variant="default">Current</Badge>}
        </CardTitle>
        <CardDescription>{step.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="moves-list">
          {step.moves.map((move, index) => (
            <Badge key={index} variant="outline" className="move-badge">
              {move.notation}
            </Badge>
          ))}
        </div>
        {isActive && (
          <Button onClick={onExecute} className="mt-3 w-full">
            <Play className="w-4 h-4 mr-2" />
            Execute Step
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

const Home = () => {
  // Cube state
  const [cubeState, setCubeState] = useState({
    up: Array(9).fill('white'),
    down: Array(9).fill('yellow'),
    front: Array(9).fill('red'),
    back: Array(9).fill('orange'),
    left: Array(9).fill('green'),
    right: Array(9).fill('blue')
  });

  // UI state
  const [colorPicker, setColorPicker] = useState(null);
  const [solution, setSolution] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [loading, setLoading] = useState(false);

  // Handle color change for cube squares
  const handleColorChange = (face, index) => {
    setColorPicker({ face, index });
  };

  // Handle color selection from picker
  const handleColorSelect = (color) => {
    if (colorPicker) {
      const newCubeState = { ...cubeState };
      newCubeState[colorPicker.face][colorPicker.index] = color;
      setCubeState(newCubeState);
    }
    setColorPicker(null);
  };

  // Reset cube to solved state
  const resetCube = () => {
    setCubeState({
      up: Array(9).fill('white'),
      down: Array(9).fill('yellow'),
      front: Array(9).fill('red'),
      back: Array(9).fill('orange'),
      left: Array(9).fill('green'),
      right: Array(9).fill('blue')
    });
    setSolution(null);
    setCurrentStep(0);
  };

  // Generate scrambled cube
  const scrambleCube = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/cube/scramble`);
      setCubeState(response.data);
      setSolution(null);
      setCurrentStep(0);
    } catch (error) {
      console.error('Error scrambling cube:', error);
    } finally {
      setLoading(false);
    }
  };

  // Solve the cube
  const solveCube = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${API}/cube/solve`, cubeState);
      setSolution(response.data);
      setCurrentStep(0);
    } catch (error) {
      console.error('Error solving cube:', error);
      alert('Error solving cube. Please check if the cube state is valid.');
    } finally {
      setLoading(false);
    }
  };

  // Execute current step
  const executeStep = () => {
    if (solution && currentStep < solution.steps.length) {
      setIsAnimating(true);
      // Simulate animation delay
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsAnimating(false);
      }, 1000);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Rubik's Cube Solver</h1>
        <p>Set up your cube state and get step-by-step solution</p>
      </header>

      <div className="main-content">
        {/* Cube Input Section */}
        <div className="cube-section">
          <Card>
            <CardHeader>
              <CardTitle>Cube Setup</CardTitle>
              <CardDescription>
                Click on any square to change its color. Set up your cube to match the current state.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="cube-container">
                <div className="cube-layout">
                  {/* Top row */}
                  <div className="cube-row">
                    <div className="empty-space"></div>
                    <CubeFace 
                      face="up" 
                      colors={cubeState.up} 
                      onColorChange={handleColorChange}
                      faceName="up"
                    />
                    <div className="empty-space"></div>
                  </div>
                  
                  {/* Middle row */}
                  <div className="cube-row">
                    <CubeFace 
                      face="left" 
                      colors={cubeState.left} 
                      onColorChange={handleColorChange}
                      faceName="left"
                    />
                    <CubeFace 
                      face="front" 
                      colors={cubeState.front} 
                      onColorChange={handleColorChange}
                      faceName="front"
                    />
                    <CubeFace 
                      face="right" 
                      colors={cubeState.right} 
                      onColorChange={handleColorChange}
                      faceName="right"
                    />
                    <CubeFace 
                      face="back" 
                      colors={cubeState.back} 
                      onColorChange={handleColorChange}
                      faceName="back"
                    />
                  </div>
                  
                  {/* Bottom row */}
                  <div className="cube-row">
                    <div className="empty-space"></div>
                    <CubeFace 
                      face="down" 
                      colors={cubeState.down} 
                      onColorChange={handleColorChange}
                      faceName="down"
                    />
                    <div className="empty-space"></div>
                  </div>
                </div>
              </div>

              <div className="control-buttons">
                <Button onClick={resetCube} variant="outline">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                <Button onClick={scrambleCube} variant="outline" disabled={loading}>
                  <Shuffle className="w-4 h-4 mr-2" />
                  Scramble
                </Button>
                <Button onClick={solveCube} disabled={loading}>
                  Solve Cube
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Solution Section */}
        {solution && (
          <div className="solution-section">
            <Card>
              <CardHeader>
                <CardTitle>Solution Steps</CardTitle>
                <CardDescription>
                  Total moves: {solution.total_moves} | Algorithm: {solution.algorithm_used}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="solution-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${(currentStep / solution.steps.length) * 100}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">
                    Step {currentStep} of {solution.steps.length}
                  </span>
                </div>

                <div className="solution-steps">
                  {solution.steps.map((step, index) => (
                    <SolutionStep
                      key={index}
                      step={step}
                      isActive={index === currentStep}
                      onExecute={executeStep}
                    />
                  ))}
                </div>

                {currentStep >= solution.steps.length && (
                  <div className="completion-message">
                    <h3>🎉 Cube Solved!</h3>
                    <p>Congratulations! Your cube should now be solved.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Color Picker Modal */}
      <ColorPicker
        selectedColor={colorPicker}
        onColorSelect={handleColorSelect}
        onClose={() => setColorPicker(null)}
      />
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
39|
40|function App() {
41|  return (
42|    <div className="App">
43|      <BrowserRouter>
44|        <Routes>
45|          <Route path="/" element={<Home />}>
46|            <Route index element={<Home />} />
47|          </Route>
48|        </Routes>
49|      </BrowserRouter>
50|    </div>
51|  );
52|}
53|
54|export default App;
55|

