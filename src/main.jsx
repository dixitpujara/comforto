import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.jsx';
import './assets/css/index.css';
import { UsersProvider } from './context/UsersContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ProductsProvider } from './context/ProductsContext.jsx';
import { WishlistProvider } from './context/WishlistContext.jsx';
import { CompareProvider } from './context/CompareContext.jsx';
import { CollectionProvider } from './context/CollectionContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <UsersProvider>
        <AuthProvider>
          <ProductsProvider>
            <WishlistProvider>
              <CompareProvider>
                <CollectionProvider>
                  <App />
                </CollectionProvider>
              </CompareProvider>
            </WishlistProvider>
          </ProductsProvider>
        </AuthProvider>
      </UsersProvider>
    </HashRouter>
  </React.StrictMode>,
)
