import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthenticationContext } from './Auth-Context';

const ProtectedRoute = ({ element: Element, ...rest }) => {
  const { isAuthenticated } = useContext(AuthenticationContext);

  return isAuthenticated ? <Element {...rest} /> : <Navigate to="/account" />;
};

export default ProtectedRoute;
