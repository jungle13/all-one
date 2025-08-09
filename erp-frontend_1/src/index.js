import React from 'react';
// Import createRoot from react-dom/client
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import './index.css';
// Import the App component from ./App.js
import App from './App';

// Get the root element
const container = document.getElementById('root');

// Create a root
const root = createRoot(container);

// Initial render using the new root API
root.render(
    <React.StrictMode>
        {/* Router should wrap the App component as App.js now handles routing logic internally */}
        <Router>
            <App />
        </Router>
    </React.StrictMode>
);
