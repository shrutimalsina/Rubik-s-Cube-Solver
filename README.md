# 🎲 Rubik's Cube Solver

A full-stack web application that allows users to input a scrambled Rubik's Cube state and receive step-by-step solving instructions. Built with an interactive React frontend and a powerful Python backend that validates cube states, checks solvability, and calculates optimal solution sequences.

## Features

- **Interactive Cube Input**: Click on cube squares to set colors representing your scrambled cube state
- **Real-time Validation**: Validates that the cube configuration is physically possible
- **Solvability Check**: Confirms the cube can be solved before attempting resolution
- **Step-by-Step Solutions**: Provides detailed solving instructions using the Layer-by-Layer method
- **Move Notation**: Uses standard Rubik's Cube notation (R, L, U, D, F, B, and their inverse moves)
- **Solution Tracking**: Stores all solved cube states and solutions in MongoDB for reference
- **Scramble Generation**: Generate random valid scrambled cube states for practice
- **Responsive Design**: Works seamlessly on desktop and mobile devices

##  Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                       │
│  - Interactive 2D cube grid representation             │
│  - Color picker for cube setup                         │
│  - Solution step visualization                         │
│  - Real-time state management                          │
└──────────────────┬──────────────────────────────────────┘
                   │ HTTP/REST API
┌──────────────────▼──────────────────────────────────────┐
│                   FastAPI Backend                       │
│  - Cube state validation                               │
│  - Mathematical solvability checking                   │
│  - Layer-by-Layer solving algorithm                    │
│  - Solution generation with move sequences             │
└──────────────────┬──────────────────────────────────────┘
                   │ Async Connection
┌──────────────────▼──────────────────────────────────────┐
│                   MongoDB Database                      │
│  - Cube state records                                  │
│  - Solution history                                    │
│  - User session data                                   │
└─────────────────────────────────────────────────────────┘
```


## 💡 How It Works - Technical Deep Dive

### Frontend Flow
1. User clicks cube squares to set colors
2. React component manages cube state
3. User clicks "Solve Cube"
4. Axios sends POST request with cube state as JSON
5. Response received and parsed
6. Solution steps displayed sequentially

### Backend Flow
1. Receives cube state JSON from frontend
2. Validates using Pydantic models
3. Checks color counts and configuration
4. Verifies cube is solvable
5. Runs Layer-by-Layer algorithm
6. Generates step-by-step instructions
7. Stores solution in MongoDB
8. Returns solution with move sequences

### Validation & Solvability
- Ensures each color appears exactly 9 times
- Verifies cube configuration is mathematically valid
- Checks that the scrambled state is reachable from a solved cube
- Prevents impossible configurations

Built with ❤️ by Shruti Timalsina**
