import React, { useContext, useState } from 'react';
import { Container, Form } from "react-bootstrap";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import { NavLink, useNavigate } from "react-router-dom";
import { login } from "../../api/commonApi";
import { observer } from "mobx-react-lite";
import { Context } from "../../index";
import './Auth.css';
import '../../styles/common.css'


const AppAuth = observer(() => {
    const { user } = useContext(Context);
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

 const click = async () => {
    setError('');
    if (!email || !password) {
        setError('Пожалуйста, заполните все поля.');
        return;
    }
    if (!email.includes('@')) {
        setError('Введите корректный email с символом @');
        return false;
    }
    try {
        let data;
        data = await login(email, password);
        if (data) {
            user.setUser(data.user[0]);
            user.setEmail(email);
            user.setIsAuth(true);
            user.setRole(data.user[0].role_name);
            localStorage.setItem('token', data.token);
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
            const lastChangeDate = new Date(data.user[0].last_password_change_date);
            const needsPasswordChange = lastChangeDate < threeMonthsAgo;
            if (needsPasswordChange) {
                user.setPasswordChange(true);
                alert(`Требуется смена пароля, поменяйте пароль в личном кабинете в блоке основные данные
                        (на эту страницу вы будете перенаправлены). Для этого введите текущий и новый пароль и нажмите сохранить`)
                navigate("/profile");
            } else {
                user.setPasswordChange(false);
                navigate("/project");
            }
        }
    } catch (e) {
        console.error('Ошибка при взаимодействии с сервером:', e);
        const message = e.response?.data?.error || 'Произошла ошибка';
        setError(message);
    }
};
    return (
        <Container className="auth-container" >
            <Card className="auth-card p-5">
                <h1 className="m-auto">Добро пожаловать в задачник</h1> 
                <span style={{fontSize: '28px', fontWeight: '800', background: 'linear-gradient(135deg, #4CAF50, #81C784, #2E7D32)',
                            WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', letterSpacing: '1px', fontFamily: "'Inter', sans-serif"}}>
                    СЕГОДНЯ
                </span>               
                <h2 className="m-auto">Авторизация</h2>
                {error && <div className="error-message">{error}</div>}
                <Form className="d-flex flex-column">
                    <div><label className="d-block">Введите почту (email)</label> 
                    <Form.Control
                        className="mt-3 custom-input"
                        placeholder="Введите ваш email..."
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        type="email"
                    /></div>
                    <div><label className="d-block">Введите пароль</label>
                    <Form.Control
                        className="mt-3 custom-input"
                        placeholder="Введите ваш пароль..."
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        type="password"
                    /></div>
                    <Row className="d-flex justify-content-between mt-3 pl-3 pr-3 auth-links">
                        <div className="auth-text">
                        Нет аккаунта? <NavLink to="/registration" className="auth-link">Зарегистрируйся!</NavLink>
                        </div>
                    </Row>
                    <div className="button-container">
                        <Button variant={"outline-success"} onClick={click}>Войти</Button>
                    </div>
                </Form>
            </Card>
        </Container>
    );
});

export default AppAuth;