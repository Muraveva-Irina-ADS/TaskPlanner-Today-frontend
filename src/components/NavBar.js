import React, {useContext} from 'react';
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "react-bootstrap";
import { observer } from "mobx-react-lite";
import Container from "react-bootstrap/Container";
import { Context } from "../index";

const NavBar = observer(() => {
    const navigate = useNavigate();
    const { user } = useContext(Context);
    const location = useLocation();
    return (
        <Navbar bg="primary" variant="light" style={{ backgroundColor: '#e8f5e9' }}>
            <Container style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', margin: '10px'}}>
                    <span style={{fontSize: '20px', fontWeight: '800', background: 'linear-gradient(135deg, #4CAF50, #81C784, #2E7D32)',
                                WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', letterSpacing: '1px', fontFamily: "'Inter', sans-serif"}}>
                        СЕГОДНЯ
                    </span>
                </div>
                <Nav className="nav-buttons" style={{ display: 'flex', gap: '10px' }}>
                    {user.role==='admin' && location.pathname !== "/users" && !user.passwordChange && (
                        <Button variant="outline-light" onClick={() => navigate("/users")} style={{ margin: '10px' }}>Пользователи</Button>
                    )}
                    {location.pathname !== "/project" && !user.passwordChange && (
                        <Button variant="outline-light" onClick={() => navigate("/project")} style={{ margin: '10px' }}>Проекты</Button>
                    )}
                    {location.pathname !== "/profile" && !user.passwordChange && (
                        <Button variant="outline-light" onClick={() => navigate("/profile")} style={{ margin: '10px' }}>Профиль</Button>
                    )}
                    <Button variant="outline-light" 
                        onClick={() => {
                            localStorage.setItem('token', '');
                            user.setEmail("");
                            user.setRole("");
                            user.setUser("");
                            user.setIsAuth(false);
                            user.setPasswordChange(false);
                            navigate("/");
                        }}>Выйти</Button>
                </Nav>
            </Container>
        </Navbar>
    );
});

export default NavBar;