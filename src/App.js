import React from 'react';
import { Provider } from 'react-redux';
import store from './redux/store';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import './index.css';

function App() {
  return (
    <Provider store={store}>
      <div className="App min-h-screen">
        <Header />
        <Dashboard />
      </div>
    </Provider>
  );
}

export default App;