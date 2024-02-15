import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthenticationContext } from 'path-to-AuthenticationContext'; // Adjust the import path
import AppRoutes from 'path-to-AppRoutes'; // Your authenticated routes
import AccountRoutes from 'path-to-AccountRoutes'; // Your non-authenticated routes

export const Navigation = () => {
    const { isAuthenticated } = useContext(AuthenticationContext);

    return (
        <div className="container">
            <Router>
                {isAuthenticated
                    ? <Routes>{/* Define your authenticated routes here, using AppRoutes */}</Routes>
                    : <Routes>{/* Define your non-authenticated routes here, using AccountRoutes */}</Routes>}
            </Router>
        </div>
    );
};
