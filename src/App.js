import React from 'react';
import {BrowserRouter} from 'react-router-dom';
import AppRouter from './components/AppRouter';
import {observer} from "mobx-react-lite";
import { Toaster } from 'react-hot-toast';

const App = observer(() => {
    return (<>
        <Toaster />
        <BrowserRouter>
            <AppRouter />
        </BrowserRouter></>
    );
});

export default App;