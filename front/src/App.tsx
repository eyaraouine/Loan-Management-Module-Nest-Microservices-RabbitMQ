import React from 'react';
import './App.css'; // Assuming you have a CSS file for styling
import LoanForm from './components/LoanForm.tsx';
//import CreditService from './components/CreditService.tsx'; // Import CreditService component
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Use BrowserRouter as Router instead of Routes
import Header from './components/Header.tsx';

const App: React.FC = () => {
  return (
    <Router>
      <div>
        <Header />
        <Routes>
          <Route path="/" element={<LoanForm />} />
          <Route path="/credit" element={<></>} /> {/* Render CreditService component for '/credit-service' path */}
        </Routes>
      </div>
    </Router>
  );
};

export default App;
