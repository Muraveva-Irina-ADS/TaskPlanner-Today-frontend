import React, { createContext } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import UserStore from "./store/UserStore";

export const Context = createContext(null);

// Создаем корень приложения
const root = ReactDOM.createRoot(document.getElementById('root'));

// Рендерим приложение
root.render(
    <Context.Provider value={{
        user: new UserStore()
    }}>
        <App />
    </Context.Provider>
);