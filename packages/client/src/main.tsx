import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './model/store';
import { BrowserRouter } from 'react-router-dom';
import { Router } from './Router';
import './main.css';
import './styles/globals.css';
import { addLogSender, isRunningUnitTest } from '@shared';
import { clientLogSender } from './util';
import { logRocketInit } from '@shared';
import { ThemeProvider, createTheme } from '@mui/material';
import ScrollToTop from './components/ScrollToTop';
import { FeatureFlagManager } from './components/FeatureFlagManager';
import { hotJarInit } from '@shared';

hotJarInit();
logRocketInit();
addLogSender(clientLogSender);

const theme = createTheme({ typography: { fontFamily: 'Lato, sans-serif' } });

if (!isRunningUnitTest()) {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <BrowserRouter>
            <ScrollToTop />
            <Router />
            <FeatureFlagManager />
          </BrowserRouter>
        </ThemeProvider>
      </Provider>
    </React.StrictMode>,
  );
}
