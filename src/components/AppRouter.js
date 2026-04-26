import React, {useContext, useEffect} from 'react';
import {Routes, Route, Navigate, useLocation} from 'react-router-dom';
import {notAuthRoutes, userRoutes, adminRoutes} from "../routes";
import {Context} from "../index.js";
import {observer} from "mobx-react-lite";

const AppRouter = observer(() => {
    const {user} = useContext(Context);
    const location = useLocation();
    const token = localStorage.getItem('token');
    if (token && !user.isAuth) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(atob(base64));
        user.setEmail(payload.email);
        user.setRole(payload.role);
        user.setIsAuth(true);
    }
    useEffect(() => {
        const publicPaths = notAuthRoutes.map(route => route.path);
        if (publicPaths.includes(location.pathname)) {
            if (localStorage.getItem('token')) {
                localStorage.setItem('token', '');
                user.setEmail("");
                user.setRole("");
                user.setUser("");
                user.setIsAuth(false);
                user.setPasswordChange(false);
            }
        }
    }, [location.pathname]);      
    return (
    <Routes>
        {notAuthRoutes.map(({path, Component}) =>
            <Route key={path} path={path} element={<Component />} />
            )}
        {user.role === 'user' && userRoutes.map(({path, Component}) =>
            <Route key={path} path={path} element={<Component />} />
                )}
        {user.role === 'admin' && adminRoutes.map(({path, Component}) =>
            <Route key={path} path={path} element={<Component />} />
                )}                                
         <Route path="*" element={<Navigate to="/" />} />
    </Routes>
);});

export default AppRouter;