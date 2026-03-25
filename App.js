import React, { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { Play, RotateCcw, Shuffle } from "lucide-react";

// Getting backend URL from environment variables
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
// Settingt up API endpoint path for all requests
const API = `${BACKEND_URL}/api`;

// Defining the 6 standard Rubik's Cube colors
const CUBE_COLORS = {
  white: '#ffffff',
  yellow: '#ffff00',
  red: '#ff0000',
  orange: '#ff6500',
  blue: '#0066ff',
  green: '#00ff00'
};

// Getting list of all available color names for the color picker
const COLOR_NAMES = Object.keys(CUBE_COLORS);

// Displays a single cube face (3x3 grid of colored squares)
const CubeFace = ({ face, colors, onColorChange, faceName }) => {
  return (
    <div className="cube-face">
      {/* Show face name (UP, DOWN, FRONT, etc) */}
      <div className="face-label">{faceName.toUpperCase()}</div>
      <div className="face-grid">
        {/* Create 9 squares for each face */}
        {colors.map((color, index) => (
          <div
            key={index}
            className="cube-square"
            // Set background color to match the cube color
            style={{ backgroundColor: CUBE_COLORS[color] }}
            // When clicked, open the color picker to change this square
            onClick={() => onColorChange(face, index)}
          >
            <div className="square-overlay"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Modal popup for selecting a color when user clicks a cube square
const ColorPicker = ({ selectedColor, onColorSelect, onClose }) => {
  // Only show if a color was selected (a square was clicked)
  if (!selectedColor) return null;

  return (
    <div className="color-picker-overlay" onClick={onClose}>
      {/* Modal box with color options */}
      <div className="color-picker" onClick={e => e.stopPropagation()}>
        <h3>Select Color</h3>
        <div className="color-options">
          {/* Show all 6 available cube colors */}
          {COLOR_NAMES.map(colorName => (
            <div
              key={colorName}
              className="color-option"
              // Display the actual color
              style={{ backgroundColor: CUBE_COLORS[colorName] }}
              // When user clicks a color, apply it to the square
              onClick={() => onColorSelect(colorName)}
            >
              {colorName}
            </div>
          ))}
        </div>
        {/* Button to close the color picker without selecting */}
        <Button onClick={onClose} variant="outline" className="mt-4">Cancel</Button>
      </div>
    </div>
  );
};

// Displays a single solving step with moves and instructions
const SolutionStep = ({ step, isActive, onExecute }) => {
  return (
    <Card className={`solution-step ${isActive ? 'active' : ''}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Step {step.step_number}: {step.title}</span>
          {/* Show badge if this is the current step being shown */}
          {isActive && <Badge variant="default">Current</Badge>}
        </CardTitle>
        {/* Explain what this step does */}
        <CardDescription>{step.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Show all the cube rotations (moves) for this step */}
        <div className="moves-list">
          {step.moves.map((move, index) => (
            <Badge key={index} variant="outline" className="move-badge">
              {/* Display move notation like R, U, L', etc */}
              {move.notation}
            </Badge>
          ))}
        </div>
        {/* Only show execute button if this is the active step */}
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
  // Store the current color state of all 6 cube faces (each face has 9 squares)
  const [cubeState, setCubeState] = useState({
    up: Array(9).fill('white'),
    down: Array(9).fill('yellow'),
    front: Array(9).fill('red'),
    back: Array(9).fill('orange'),
    left: Array(9).fill('green'),
    right: Array(9).fill('blue')
  });

  // Track which square the user clicked to change color
  const [colorPicker, setColorPicker] = useState(null);
  // Store the solution steps returned from the backend
  const [solution, setSolution] = useState(null);
  // Track which solution step we're currently showing
  const [currentStep, setCurrentStep] = useState(0);
  // Track if animation is playing
  const [isAnimating, setIsAnimating] = useState(false);
  // Show loading state while waiting for API responses
  const [loading, setLoading] = useState(false);

  // When user clicks a square, remember which face and position for color picking
  const handleColorChange = (face, index) => {
    setColorPicker({ face, index });
  };

  // After user picks a color, update that square in the cube
  const handleColorSelect = (color) => {
    if (colorPicker) {
      // Copy the cube state to avoid mutating it directly
      const newCubeState = { ...cubeState };
      // Update the specific square with the new color
      newCubeState[colorPicker.face][colorPicker.index] = color;
      setCubeState(newCubeState);
    }
    // Close the color picker modal
    setColorPicker(null);
  };

  // Reset cube back to the solved state (all faces single colored)
  const resetCube = () => {
    setCubeState({
      up: Array(9).fill('white'),
      down: Array(9).fill('yellow'),
      front: Array(9).fill('red'),
      back: Array(9).fill('orange'),
      left: Array(9).fill('green'),
      right: Array(9).fill('blue')
    });
    // Clear any solution that was previously shown
    setSolution(null);
    setCurrentStep(0);
  };

  // Get a random scrambled cube state from the backend
  const scrambleCube = async () => {
    try {
      setLoading(true);
      // Request a scrambled cube from the API
      const response = await axios.get(`${API}/cube/scramble`);
      // Update the cube display with the scrambled state
      setCubeState(response.data);
      // Clear any previous solution
      setSolution(null);
      setCurrentStep(0);
    } catch (error) {
      console.error('Error scrambling cube:', error);
      alert('Error generating scrambled cube. Please try again.');
    } finally {
      // Stop showing loading indicator
      setLoading(false);
    }
  };

  // Send the current cube state to backend to get a solution
  const solveCube = async () => {
    try {
      setLoading(true);
      // Send current cube state to the backend solver
      const response = await axios.post(`${API}/cube/solve`, cubeState);
      // Store the solution steps returned from the backend
      setSolution(response.data);
      // Start from the first step
      setCurrentStep(0);
    } catch (error) {
      console.error('Error solving cube:', error);
      let errorMessage = 'Error solving cube. Please try again.';

      // Check for specific error types from the backend
      if (error.response?.status === 400) {
        // 400 = Invalid cube state (e.g., wrong color distribution)
        const detail = error.response.data?.detail;
        if (typeof detail === 'string') {
          errorMessage = detail;
        } else if (Array.isArray(detail)) {
          errorMessage = `Invalid cube state: ${detail.join(', ')}`;
        } else {
          errorMessage = 'Invalid cube state. Please check your cube configuration.';
        }
      } else if (error.response?.status === 500) {
        // 500 = Server error
        errorMessage = 'Server error occurred. Please try again later.';
      }

      // Show the error message to the user
      alert(errorMessage);
    } finally {
      // Stop showing loading indicator
      setLoading(false);
    }
  };

  // Move to the next solution step when user clicks "Execute Step"
  const executeStep = () => {
    if (solution && currentStep < solution.steps.length) {
      setIsAnimating(true);
      // Wait a moment before showing the next step (for animation effect)
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsAnimating(false);
      }, 1000);
    }
  };

  return (
    <div className="app-container">
      {/* Header with title */}
      <header className="app-header">
        <h1>Rubik's Cube Solver</h1>
        <p>Set up your cube state and get step-by-step solution</p>
      </header>

      <div className="main-content">
        {/* Left side: Cube input interface where user sets up their cube */}
        <div className="cube-section">
          <Card>
            <CardHeader>
              <CardTitle>Cube Setup</CardTitle>
              <CardDescription>
                Click on any square to change its color. Set up your cube to match the current state.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Display the unfolded cube net for user input */}
              <div className="cube-container">
                <div className="cube-layout">
                  {/* Top row: UP face */}
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

                  {/* Middle row: LEFT, FRONT, RIGHT, BACK faces */}
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

                  {/* Bottom row: DOWN face */}
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

              {/* Control buttons for cube operations */}
              <div className="control-buttons">
                {/* Reset cube to solved state */}
                <Button onClick={resetCube} variant="outline">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                {/* Generate a random scrambled cube */}
                <Button onClick={scrambleCube} variant="outline" disabled={loading}>
                  <Shuffle className="w-4 h-4 mr-2" />
                  Scramble
                </Button>
                {/* Send cube to backend and get solution steps */}
                <Button onClick={solveCube} disabled={loading}>
                  Solve Cube
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right side: Shows solution steps after user clicks Solve */}
        {solution && (
          <div className="solution-section">
            <Card>
              <CardHeader>
                <CardTitle>Solution Steps</CardTitle>
                {/* Show total number of moves and which algorithm is being used */}
                <CardDescription>
                  Total moves: {solution.total_moves} | Algorithm: {solution.algorithm_used}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Progress bar showing how many steps we've completed */}
                <div className="solution-progress">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      // Calculate progress bar width based on current step
                      style={{ width: `${(currentStep / solution.steps.length) * 100}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">
                    Step {currentStep} of {solution.steps.length}
                  </span>
                </div>

                {/* Display all solution steps */}
                <div className="solution-steps">
                  {solution.steps.map((step, index) => (
                    <SolutionStep
                      key={index}
                      step={step}
                      // Highlight the step we're currently on
                      isActive={index === currentStep}
                      onExecute={executeStep}
                    />
                  ))}
                </div>

                {/* Show celebration message when all steps are complete */}
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

      {/* Floating color picker modal that appears when user clicks a cube square */}
      <ColorPicker
        selectedColor={colorPicker}
        onColorSelect={handleColorSelect}
        onClose={() => setColorPicker(null)}
      />
    </div>
  );
};

// Main App component with routing
function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          {/* Route to home page with cube solver */}
          <Route path="/" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
