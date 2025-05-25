![](https://github.com/xyflow/web/blob/main/assets/codesandbox-header-ts.png?raw=true)

# React Flow 8-Puzzle Solver (Vite + TS)

This project is an interactive 8-puzzle solver and visualizer built with React Flow, Vite, and TypeScript. It allows users to input an 8-puzzle configuration, see the solving process step-by-step using Breadth-First Search (BFS), and explore the search tree visually.

## Features

- **Interactive 8-Puzzle Input**: Users can define the initial state of the 8-puzzle.
- **BFS Algorithm Visualization**: Watch the BFS algorithm explore states to find the solution.
- **Step-by-Step Animation**: Control the animation speed and pause/resume the solving process.
- **Graph Visualization**: The search tree is rendered using React Flow, showing explored nodes, the current path, the solution path, and nodes in the queue.
- **Node Expansion**: Users can manually expand nodes in the graph to explore different paths after the animation is complete or paused.
- **Routing**: The application uses `react-router-dom` to navigate between a home page and the 8-puzzle solver page.

## Getting up and running

To get this project up and running on your local machine:

1.  **Clone the repository (if you haven't already):**
    ```bash
    # If you're using this as a template or starting point, you might use degit:
    # npx degit your-username/your-repo-name my-8-puzzle-app
    # cd my-8-puzzle-app
    
    # Otherwise, clone your repository:
    git clone <your-repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**
    This project uses `pnpm` as the package manager. If you don't have `pnpm`, you can install it via `npm install -g pnpm`.
    ```bash
    pnpm install
    ```
    Alternatively, you can use `npm` or `yarn`:
    ```bash
    # npm install
    # yarn install
    ```

3.  **Start the development server:**
    Vite is used as the development server and build tool.
    ```bash
    pnpm run dev
    ```
    This will start the development server, typically on `http://localhost:5173`.

While the development server is running, changes you make to the code will be automatically reflected in the browser.

## Project Structure

-   `src/App.tsx`: Main application component, sets up routing.
-   `src/components/`: Contains reusable UI components like `ControlPanel.tsx` and `PuzzleGridDisplay.tsx`.
-   `src/pages/`: Contains page-level components like `HomePage.tsx` and the 8-puzzle solver page (extracted into `App.tsx` as `EightPuzzlePage`).
-   `src/nodes/`: (If used for custom React Flow nodes beyond default)
-   `src/edges/`: (If used for custom React Flow edges beyond default)
-   `public/`: Static assets.

## How to Use

1.  Navigate to the application in your browser.
2.  From the Home Page, click on the "8 Puzzle Solver" link.
3.  You will see an initial 8-puzzle configuration.
4.  **Set State**: You can change the initial puzzle by entering 9 comma-separated numbers (0-8, where 0 is the empty tile) into the input field and clicking "Set State".
5.  **Start Animation**: Click "Start Animation" to watch the BFS algorithm solve the puzzle.
6.  **Control Animation**: Adjust the animation speed using the "Delay (ms)" input or stop the animation with the "Stop Animation" button.
7.  **Explore Graph**: After the animation finishes or is stopped, you can click on nodes in the graph to manually expand them and see their children (if they were not already fully explored by the algorithm).

## Future Enhancements (Things to try):

-   Implement other search algorithms (e.g., DFS, A\*).
-   Allow users to select the search algorithm.
-   Improve the graph layout for very large search trees.
-   Add more visual cues or statistics about the search process.
-   Persist user settings or puzzle states.

## Resources

Links:

-   [React Flow - Docs](https://reactflow.dev)
-   [Vite - Docs](https://vitejs.dev)
-   [React Router - Docs](https://reactrouter.com)

Learn:

-   [React Flow – Custom Nodes](https://reactflow.dev/learn/customization/custom-nodes)
-   [React Flow – Layouting](https://reactflow.dev/learn/layouting/layouting)
