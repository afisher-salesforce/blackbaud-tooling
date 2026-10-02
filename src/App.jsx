import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import Overview from './pages/Overview';
import CapabilityMap from './pages/CapabilityMap';
import CapabilityDetail from './pages/CapabilityDetail';
import ValueStream from './pages/ValueStream';

export default function App() {
  return (
    <Layout>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Navigate to="/overview" replace />} />
          <Route path="/overview" element={<Overview />} />
          <Route path="/map" element={<CapabilityMap />} />
          <Route path="/capability/:id" element={<CapabilityDetail />} />
          <Route path="/a2r" element={<ValueStream stream="A2R" />} />
          <Route path="/i2r" element={<ValueStream stream="I2R" />} />
          <Route path="*" element={<Navigate to="/overview" replace />} />
        </Routes>
      </ErrorBoundary>
    </Layout>
  );
}
