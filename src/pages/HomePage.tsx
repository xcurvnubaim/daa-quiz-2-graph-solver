import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div>
      <h1>Welcome to the Algorithm Visualizer</h1>
      <nav>
        <ul>
          <li>
            <Link to="/8-puzzle">8 Puzzle Solver</Link>
          </li>
          <li>
            <Link to="/new-page">New Page</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default HomePage;
