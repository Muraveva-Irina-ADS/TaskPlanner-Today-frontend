import React, { useContext, useState } from 'react';
import { Container, Form } from "react-bootstrap";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import { NavLink, useNavigate } from "react-router-dom";
import { registration } from "../../api/commonApi";
import { observer } from "mobx-react-lite";
import { Context } from "../../index";
import './Registration.css';
import '../../styles/common.css'

const AppRegistration = observer(() => {
    const { user } = useContext(Context);
    const navigate = useNavigate();
    const [last_name, setLastName] = useState('');
    const [first_name, setFirstName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [repeat_password, setRepeatPassword] = useState('');    
    const [phone_number, setPhoneNumber] = useState('');
    const [birthday, setBirthday] = useState('');
    const [error, setError] = useState('');

    //Функция для представления даты в формате DD.MM.YYYY
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        if (isNaN(date)) return '';
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    };
    //Валидация полей основных данных пользователя 
    const validate = () => {
        if (!last_name.trim() || !first_name.trim() || !email.trim() || !password.trim() || !repeat_password.trim() || !phone_number.trim()) {
            setError('Пожалуйста, заполните все поля.');
            return false;
        }
        if (!email.includes('@') || !email.includes('.')) {
            setError('Введите корректный email с символом @ и .');
            return false;
        }
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            setError('Некорректный формат электронной почты');
            return false;
        }
        const phoneRegex = /^[0-9+\-\s()]{10,20}$/;
        if (!phoneRegex.test(phone_number)) {
            setError('Некорректный формат номера телефона');
            return false;
        }
        if (!/^\d+$/.test(phone_number)) {
            setError('Номер телефона должен содержать только цифры.');
            return false;
        }   
        if (password.length < 6) {
            setError('Пароль должен содержать не менее 6 символов');
            return false;
        }
        if (password !== repeat_password) {
            setError('Пароли не совпадают');
            return false;
        }
        if (!birthday) {
            setError('Пожалуйста, выберите дату рождения.');
            return false;
        }
        const birthDate = new Date(birthday);
        const today = new Date();
        if (isNaN(birthDate.getTime())) {
            setError('Некорректный формат даты рождения');
            return false;
        }
        if (birthDate > today) {
            setError('Дата рождения не может быть в будущем');
            return false;
        }
        setError('');
        return true;
    };
    //Валидация полей основных данных и вызов API-функции для регистрации пользователя 
    const click = async () => {
        if (!validate()) return;
        try {
            const formattedBirthday = formatDate(birthday);
            if (formattedBirthday) {
            const data = await registration(first_name, last_name, email, password, phone_number, birthday);
            if (data) {
                user.setUser(data.user);
                user.setEmail(email);
                user.setIsAuth(true);
                user.setRole(data.user.role_name);
                localStorage.setItem('token', data.token);
                navigate("/project");
            }}
        } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
        }
    };
    return (
        <Container className="reg-container" >
            <Card className="reg-card p-5">
                <h1 className="m-auto">Добро пожаловать в задачник</h1>  
                <span className="logo">СЕГОДНЯ</span>              
                <h2 className="m-auto">Регистрация</h2>
                <Form className="d-flex flex-column">
                    {error && <div className="error-message">{error}</div>}
                    <div><label className="d-block">Введите фамилию</label>
                        <Form.Control className="mt-3 custom-input" placeholder="Введите фамилию..." value={last_name} onChange={e => setLastName(e.target.value)}/>
                    </div>
                    <div><label className="d-block">Введите имя</label><br/>
                        <Form.Control className="mt-3 custom-input" placeholder="Введите имя..." value={first_name} onChange={e => setFirstName(e.target.value)}/>
                    </div>
                    <div><label className="d-block">Введите почту (email)</label>
                        <Form.Control className="mt-3 custom-input" placeholder="Введите почту..." value={email} onChange={e => setEmail(e.target.value)} type="email"/>
                    </div>
                    <div><label className="d-block">Введите пароль</label>
                        <Form.Control className="mt-3 custom-input" placeholder="Введите пароль..." value={password} onChange={e => setPassword(e.target.value)} 
                        type="password"/>
                    </div>
                    <div><label className="d-block">Повторите пароль</label>
                        <Form.Control className="mt-3 custom-input" placeholder="Повторите пароль..." value={repeat_password} 
                        onChange={e => setRepeatPassword(e.target.value)} type="password"/>
                    </div>                    
                    <div><label className="d-block">Введите номер телефона</label>
                        <Form.Control className="mt-3 custom-input" placeholder="Введите номер телефона..." value={phone_number} 
                        onChange={e => setPhoneNumber(e.target.value)}/>
                    </div>
                    <div><label className="d-block">Введите дату рождения</label>
                        <Form.Control className="mt-3 custom-input" type="date" value={birthday} onChange={e => setBirthday(e.target.value)} />
                    </div>
                    <Row className="d-flex justify-content-between mt-3 pl-3 pr-3">
                        <div className="auth-text">Есть аккаунт? <NavLink to="/login" className="auth-link">Войдите!</NavLink></div>
                    </Row>
                    <div className="button-container mt-4"><Button variant="outline-success" style={{ display: "flex" }} onClick={click}>Зарегистрироваться</Button></div>
                </Form>
            </Card>
        </Container>
    );
});

export default AppRegistration;