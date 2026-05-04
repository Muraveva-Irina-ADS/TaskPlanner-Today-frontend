import React, { useContext, useState, useEffect } from 'react';
import {get_profile_settings_email, get_profile_user_email, profile_user_put, profile_settings_put, get_profile_matrix_email, profile_matrix_put,
get_profile_status_email, get_admin_settings_note, get_admin_matrix_note, get_admin_status_note, profile_status_put, profile_status_add,
execution_status_add, execution_status_put, get_executionStatus, get_repeat_types, repeat_type_put } from "../../api/commonApi";
import { observer } from "mobx-react-lite";
import { Context } from "../../index";
import NavBar from "../../components/NavBar";
import { Button} from 'react-bootstrap'; 
import moment from 'moment';
import './Profile.css';
import '../../styles/common.css'
import { useNavigate } from "react-router-dom";
import backIcon from '../../images/назад.png';
import toast from 'react-hot-toast';
import ModalStr from '../../components/ModalStructure';
import Navigate from '../../components/Navigate';

const AppProfile = observer(() => {
    const { user } = useContext(Context);
    const [yourUser, setYourUser] = useState();
    const [yourSettings, setYourSettings] = useState();
    const [yourMatrix, setYourMatrix] = useState({}); 
    const [yourStatus, setYourStatus] = useState({});
    const [repeatType, setRepeatType] = useState({});   
    const [executionStatus, setExecutionStatus] = useState({});
    const [adminSettings, setAdminSettings] = useState();
    const [adminMatrix, setAdminMatrix] = useState({});     
    const [adminStatus, setAdminStatus] = useState({});      
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({});
    const [modalType, setModalType] = useState(null);  
    const [error, setError] = useState('');
    const navigate = useNavigate();

    //Получение информации о настройках пользователя
    const getYourSettings = async () => {           
        try {
            const yourSettings = await get_profile_settings_email();
            setYourSettings(yourSettings);
        } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
    }};
    //Получение информации об основных данных пользователя
    const getYourUser = async () => {               
        try {
            const data = await get_profile_user_email();
            setYourUser(data);
        } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
    }};
    //Получение информации о настройках матрицы
    const getYourMatrix = async () => {             
        try {
            const yourMatrix = await get_profile_matrix_email(0);
            setYourMatrix(yourMatrix);
        } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
    }};
    //Получение информации о настройках статуов пользователя
    const getYourStatus = async () => {             
        try {
            const yourStatus = await get_profile_status_email(0);
            setYourStatus(yourStatus);
        } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
    }};
    //Получение информации о настройках пользователя
    const getRepeatType = async () => {             
        try {
            const repeatType = await get_repeat_types();
            setRepeatType(repeatType);
        } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
    }}; 
    //Получение информации о статусах выполнения
    const getExecutionStatus = async () => {        
        try {
            const executionStatus = await get_executionStatus();
            setExecutionStatus(executionStatus);
        } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
    }}; 
    //Получение информации о настройках главного администратора 
    const getAdminSettings = async () => {          
        try {
            const adminSettings = await get_admin_settings_note("Администратор системы");
            setAdminSettings(adminSettings);
        } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
    }};
    //Получение информации о настройках матрицы главного администратора
    const getAdminMatrix = async () => {            
        try {
            const adminMatrix = await get_admin_matrix_note();
            setAdminMatrix(adminMatrix);
        } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
    }};
    //Получение информации о настройках статусов главного администратора
    const getAdminStatus = async () => {            
        try {
            const adminStatus = await get_admin_status_note("Администратор системы");
            setAdminStatus(adminStatus);
        } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
    }};
    //Хук useEffect, в котором вызываются функции для получения данных из базы данных с помощью API-функций
    useEffect(() => {
        getYourSettings();
        getYourUser();
        getYourMatrix();
        getYourStatus();
        getRepeatType();
        getAdminSettings();
        getAdminMatrix();
        getAdminStatus();
        getExecutionStatus();
    }, []);
    //Функция открытия модального окна
    const openModal = (userData = null, modalType = null) => {           
        if(userData){
            setSelectedUser(userData);
            setFormData(userData);
        } else {
            setSelectedUser(null);
            setFormData({});
        }
        setModalType(modalType);
        setShowModal(true);
    };
    //Функция закрытия модального окна
    const closeModal = () => {                                          
        setShowModal(false);
        setSelectedUser(null);
        setModalType(null);
        setError('');
    };
    //Функция для изменения состояния полей формы в модальном окне
    const handleChange = (e, index = null, dataType = null) => {                         
        const { name, value, type } = e.target;
        if (index !== null && Array.isArray(formData)) {
            const updatedArray = [...formData];
            updatedArray[index] = {
                ...updatedArray[index], [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value
            };
            setFormData(updatedArray);
        }
        else {
            if (type === 'number') {
                setFormData(prev => ({...prev, [name]: value === '' ? '' : Number(value)}));
            } else {
                setFormData(prev => ({...prev, [name]: value}));
            }
    }};
    //Валидация полей основных данных пользователя и вызов API-функции для изменения данных в таблице users (основные данные)
    const handleUser = async () => {           
        try {
            if (user.role === 'user')
                formData.role_name = 'user';
            if (!formData.first_name || !formData.last_name || !formData.email || !formData.role_name || !formData.note || !formData.phone_number || !formData.birthday) {
                setError('Все поля должны быть заполнены');
                return false;
            }
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(formData.email)) {
                setError('Некорректный формат электронной почты');
                return false;
            }
            const phoneRegex = /^[0-9+\-\s()]{10,20}$/;
            if (!phoneRegex.test(formData.phone_number)) {
                setError('Некорректный формат номера телефона');
                return false;
            }
            const birthDate = new Date(moment(formData.birthday).format('YYYY-MM-DD'));
            const today = new Date();
            if (isNaN(birthDate.getTime())) {
                setError('Некорректный формат даты рождения');
                return false;
            }
            if (birthDate > today) {
                setError('Дата рождения не может быть в будущем');
                return false;
            }
            let data;
            if (formData.curPassword === undefined || formData.curPassword === '')
                data = await profile_user_put(selectedUser.id, formData.last_name, formData.first_name, formData.email,
                formData.curPassword, '', formData.phone_number, moment(formData.birthday).format('YYYY-MM-DD'),
                formData.role_name, formData.note);
            else
                data = await profile_user_put(selectedUser.id, formData.last_name, formData.first_name, formData.email,
                formData.curPassword, formData.newPassword, formData.phone_number, moment(formData.birthday).format('YYYY-MM-DD'),
                formData.role_name, formData.note);
            if (data) {
                if (user.email !== formData.email || user.role !== formData.role_name) {
                    localStorage.setItem('token', '');
                    user.setEmail("");
                    user.setRole("");
                    user.setUser("");
                    user.setIsAuth(false);
                    user.setPasswordChange(false);
                    alert("Были изменены настройки профиля, пожалуйста авторизуйтесь заново");
                    navigate("/");
                } else {
                    toast.success('Сохранено');
                    closeModal();
                    getYourUser();
                    const threeMonthsAgo = new Date();
                    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
                    const lastChangeDate = new Date(data.user.last_password_change_date);
                    const needsPasswordChange = lastChangeDate < threeMonthsAgo;
                    if (needsPasswordChange) {
                        user.setPasswordChange(true);
                        alert('Требуется смена пароля, поменяйте пароль в личном кабинете в блоке основные данные. Для этого введите текущий и новый пароль и нажмите сохранить')
                    } else {
                        user.setPasswordChange(false);
                    }
                }
            }
        } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
    }};
    //Валидация полей настроек пользователя и вызов API-функции для изменения данных в таблице settings (настройки)
    const handleSaveSettings = async () => {   
        try {
            if (formData.limit_tasks <= 0 || formData.pomodoro_duration <= 0 || formData.number_pomodoro_per_day <= 0 || formData.rest_duration <= 0) {
                setError('Все поля должны быть заполнены неотрицательными числами');
                return false;
            }
            if (formData.pomodoro_duration > 60 || formData.rest_duration > 60) {
                setError('Длительность помидора или отдыха не должна превышать одного часа');
                return false;
            }          
            const checkInteger = (value, fieldName) => {
              if (!Number.isInteger(Number(value))) {
                setError(`${fieldName} должно быть целым числом`);
                return false;
              }
            };
            checkInteger(formData.limit_tasks, 'Лимит задач');
            checkInteger(formData.pomodoro_duration, 'Длительность помидора');
            checkInteger(formData.number_pomodoro_per_day, 'Максимальное количество помидоров в день');
            checkInteger(formData.rest_duration, 'Длительность отдыха');
            const timeToMinutes = (timeStr) => {
                const [hours, minutes] = timeStr.split(':').map(Number);
                return hours * 60 + minutes;
            };
            const startMinutes = timeToMinutes(formData.start_working_day);
            const endMinutes = timeToMinutes(formData.end_working_day);
        
            let workingDayMinutes;
            if (endMinutes >= startMinutes) {
                workingDayMinutes = endMinutes - startMinutes;
            } else {
                setError('Рабочий день должен быть в пределах одних суток');
                return false;
            }
            if (workingDayMinutes < 60) {
                setError('Рабочий день должен быть не менее 1 часа');
                return false;
            }
            const pomodoroCycleMinutes = Number(formData.pomodoro_duration) + Number(formData.rest_duration);
            const maxPossiblePomodoros = Math.floor(workingDayMinutes / pomodoroCycleMinutes);
            if (formData.number_pomodoro_per_day > maxPossiblePomodoros) {
                setError(`Запрошено слишком много помидоров. Максимально возможное количество для вашего рабочего дня: ${maxPossiblePomodoros}`);
                return false;
            }
            let data;
            data = await profile_settings_put(selectedUser.users_id, formData);
            if (data) {
                toast.success('Сохранено');
                closeModal();
                getYourSettings();
                getAdminSettings();
            }
        } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
    }};
    //Валидация полей настроек матрицы и вызов API-функции для изменения данных в таблице matrix (настройки матрицы)
    const handleSaveMatrix = async () => {   
        try {
            let count = 0;
            let count_success = 0;
            for (const cell of formData) {  
                count = count + 1;
                const data = await profile_matrix_put(cell.id, selectedUser[count-1].users_id, cell.matrix_part, cell.matrix_name, cell.description, cell.color);
                if (data)
                    count_success = count_success + 1;
            };
            if (count === count_success) {
                toast.success('Сохранено');
                closeModal();
                getYourMatrix();
                getAdminMatrix();
            }
        } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
        }
    };
    //Валидация полей настроек статусов и вызов API-функции для изменения данных в таблице status (настройки статусов задачи)
    const handleSaveStatus = async () => {   
        try {
            let count = 0;
            let count_success = 0;
            for (const cell of formData) {  
                count = count + 1;
                const data = await profile_status_put(cell.id, cell.status_name, selectedUser[count-1].users_id, cell.system_code);
                if (data)
                    count_success = count_success + 1;
            };
            if (count === count_success) {
                toast.success('Сохранено');
                closeModal();
                getYourStatus();
                getAdminStatus();
            }
        } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
    }};
    //Валидация полей настроек статусов и вызов API-функции для добавления данных в таблицу status (настройки статусов задачи)
    const handleAddStatus = async () => {   
        try {
            const existingStatus = adminStatus.find(element => element.system_code === formData.system_code);
            if (existingStatus) {
                setError(`Статус с кодом "${formData.system_code}" уже существует`);
                return;
            }
            if (!formData.status_name || !formData.system_code) {
                setError('Все поля должны быть заполнены');
                return;
            }
            const data = await profile_status_add(formData.status_name, yourUser.id, formData.system_code);
            if (data) {
                toast.success('Сохранено');
                closeModal();
                getYourStatus();
            }
        } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
    }};
    //Валидация полей типов повторения и вызов API-функции для изменения данных в таблице repeat_types (типы повторений)
    const handleSaveRepeatType = async () => {
        try {
            let count = 0;
            let count_success = 0;
            for (const cell of formData) {  
                count = count + 1;
                if (!cell.type_name || !cell.description) {
                    setError('Все поля должны быть заполнены')
                    return
                }
                const data = await repeat_type_put(cell.id, cell.type_name, cell.description);
                if (data)
                    count_success = count_success + 1;
                };
            if (count === count_success) {
                toast.success('Сохранено');
                closeModal();
                getRepeatType();
            }
        } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
    }};
    //Валидация полей статусов выполнения и вызов API-функции для изменения данных в таблице execution_status
    const handleSaveExecutionStatus = async () => {
        try {
            let count = 0;
            let count_success = 0;
            for (const cell of formData) {  
                count = count + 1;
                if (!cell.exec_status_name) {
                    setError('Все поля должны быть заполнены')
                    return
                }
                const data = await execution_status_put(cell.id, cell.exec_status_name, cell.exec_color);
                if (data)
                    count_success = count_success + 1;
            };
            if (count === count_success) {
                toast.success('Сохранено');
                closeModal();
                getExecutionStatus();
            }
        } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
    }};
    //Валидация полей статусов выполнения и вызов API-функции для добавления данных в таблицу execution_status
    const handleAddExecutionStatus = async () => {
        try {
            const existingStatus = executionStatus.find(element => element.code === formData.code);
            if (existingStatus) {
                setError(`Статус с кодом "${formData.code}" уже существует`);
                return;
            }
            if (!formData.exec_status_name || !formData.code) {
                setError('Все поля должны быть заполнены');
                return;
            }
            const data = await execution_status_add(formData.exec_status_name, formData.code, formData.exec_color);
            if (data) {
                toast.success('Сохранено');
                closeModal();
                getExecutionStatus();
            }
        } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
    }};
    return (
    <div className="project-wrapper">
        <NavBar />
        <div className="project-layout">
            <Navigate/>
            <div className="app-profile-wrapper">
                {modalType === 'yourUser_modal' && (<ModalStr show={showModal} onHide={closeModal} modalType={modalType} title={'Изменить информацию о пользователе'}                           
                                formData={formData} onChange={handleChange} onSave={handleUser} error={error} isNew={false}
                                fields={['first_name', 'last_name', 'email', 'curPassword', 'newPassword', 'role_name', 'phone_number', 'birthday', 'note']} 
                                extraData={{user: user, yourUser: yourUser, selectedUser: selectedUser}}/>)} 
                {modalType === 'yourSettings_modal' && (<ModalStr show={showModal} onHide={closeModal} modalType={modalType} title={'Изменить настройки пользователя'}
                                formData={formData} onChange={handleChange} onSave={handleSaveSettings} error={error} isNew={false}
                                fields={['limit_tasks', 'pomodoro_duration', 'rest_duration', 'start_working_day', 'end_working_day', 'number_pomodoro_per_day']} 
                                extraData={{adminSettings: adminSettings}}/>)}
                {modalType === 'yourMatrix_modal' && (<ModalStr show={showModal} onHide={closeModal} modalType={modalType} title={'Настройки матрицы Эйзенхауэра'}
                                formData={formData} onChange={handleChange} onSave={handleSaveMatrix} error={error} isNew={false}
                                fields={['matrix_put']} 
                                extraData={{adminMatrix: adminMatrix}}/>)}                  
                {modalType === 'yourStatus_modal' && (<ModalStr show={showModal} onHide={closeModal} modalType={modalType} title={'Настройки статусов задачи'}
                                formData={formData} onChange={handleChange} onSave={handleSaveStatus} error={error} isNew={false}
                                fields={['status_put']} 
                                extraData={{user: user, yourUser: yourUser, adminStatus: adminStatus}}/>)}
                {modalType === 'executionStatus_modal' && (<ModalStr show={showModal} onHide={closeModal} modalType={modalType} title={'Настройки статусов выполнения'}
                                formData={formData} onChange={handleChange} onSave={handleSaveExecutionStatus} error={error} isNew={false}
                                fields={['execution_status_put']}/>)}     
                {modalType === 'repeatType' && (<ModalStr show={showModal} onHide={closeModal} modalType={modalType} title={'Редактирование типов повторений'}
                                formData={formData} onChange={handleChange} onSave={handleSaveRepeatType} error={error} isNew={false}
                                fields={['repeat_type_put']}/>)}   
                {modalType === 'newStatus_modal' && (<ModalStr show={showModal} onHide={closeModal} modalType={modalType} title={'Добавление статуса'}
                                formData={formData} onChange={handleChange} onSave={handleAddStatus} error={error} isNew={true}
                                fields={['status_add']}                                                                  
                                extraData={{adminStatus: adminStatus}}/>)}
                {modalType === 'newExecutionStatus_modal' && (<ModalStr show={showModal} onHide={closeModal} modalType={modalType} title={'Добавление статуса выполнения'}
                                formData={formData} onChange={handleChange} onSave={handleAddExecutionStatus} error={error} isNew={true}
                                fields={['execution_status_add']} extraData={{executionStatus: executionStatus}}/>)}                          
                {/*Кнопка Назад*/}
                <div className="back-button-container">
                    <button onClick={() => navigate(-1)} className="back-button">
                    <img src={backIcon} className="back-icon"/>Назад</button>
                </div>
                {/*Заголовок страницы*/}
                <div className="profile-header">
                        <h1 className="h1-prof">Информация о пользователе</h1>
                </div>
                <div className="two-column-layout">  
                    {/*Блок для отображения основных данных пользователя*/}
                    <div className="profile-section">
                        {/*Заголовок блока основных данных*/}
                        <div className="profile-header">
                            <h2 className="section-title">Основные данные</h2>
                        </div>
                        <div className="profile-grid">
                            {error && <div className="error-message">{error}</div>}                      
                            <div className="profile-field">
                                <span className="field-label">Имя:</span>
                                <span className="field-value">{yourUser?.first_name || 'Не указано'}</span>
                            </div>
                            <div className="profile-field">
                                <span className="field-label">Фамилия:</span>
                                <span className="field-value">{yourUser?.last_name || 'Не указано'}</span>
                            </div>
                            <div className="profile-field">
                                <span className="field-label">Email:</span>
                                <span className="field-value">{yourUser?.email || 'Не указано'}</span>
                            </div>
                            <div className="profile-field">
                                <span className="field-label">Телефон:</span>
                                <span className="field-value">{yourUser?.phone_number || 'Не указано'}</span>
                            </div>
                            <div className="profile-field">
                                <span className="field-label">Дата рождения:</span>
                                <span className="field-value">{new Date(yourUser?.birthday).toLocaleDateString('ru-RU')}</span>
                            </div>
                            <div className="profile-field">
                                <span className="field-label">Замечания</span>
                                <span className="field-value">{yourUser?.note || 'Не указано'}</span>
                            </div>
                            <div className="profile-field">
                                <span className="field-label">Дата создания пользователя:</span>
                                <span className="field-value">{new Date(yourUser?.created_at).toLocaleDateString('ru-RU')}</span>
                            </div>
                            <div className="profile-field">
                                <span className="field-label">Дата последней смены пароля:</span>
                                <span className="field-value">{new Date(yourUser?.last_password_change_date).toLocaleDateString('ru-RU')}</span>
                            </div>
                        </div>
                        <Button variant="primary" onClick={() => openModal(yourUser, 'yourUser_modal')}>Редактировать</Button>
                    </div>
                    {/*Блок для отображения настроек пользователя*/}
                    <div className="profile-section">
                        {/*Заголовок блока настроек*/}
                        <div className="profile-header">
                            <h2 className="section-title">Настройки</h2>
                        </div>
                        <div className="profile-grid">
                        {error && <div className="error-message">{error}</div>}
                            <div className="profile-field">
                                <span className="field-label">Лимит задач в день:</span>
                                <span className="field-value">{yourSettings?.limit_tasks || 'Не установлен'}</span>
                            </div>
                            <div className="profile-field">
                                <span className="field-label">Длительность помидора:</span>
                                <span className="field-value">{yourSettings?.pomodoro_duration || 25} мин</span>
                            </div>
                            <div className="profile-field">
                                <span className="field-label">Начало рабочего дня:</span>
                                <span className="field-value">{yourSettings?.start_working_day.substring(0, 5)}</span>
                            </div>
                            <div className="profile-field">
                                <span className="field-label">Конец рабочего дня:</span>
                                <span className="field-value">{yourSettings?.end_working_day.substring(0, 5)}</span>
                            </div>
                            <div className="profile-field">
                                <span className="field-label">Макс. помидоров в день:</span>
                                <span className="field-value">{yourSettings?.number_pomodoro_per_day || 'Не ограничено'}</span>
                            </div>
                            <div className="profile-field">
                                <span className="field-label">Длительность отдыха:</span>
                                <span className="field-value">{yourSettings?.rest_duration || 5} мин</span>
                            </div>
                        </div>
                        <Button variant="primary" onClick={() => openModal(yourSettings, 'yourSettings_modal')}>Редактировать</Button>
                    </div>
                </div>
                {/*Заголовок блока настройки матрицы*/}
                <div className="profile-header">                            
                    <h2 className="section-title">Настройка матрицы</h2>
                </div>
                <div className="settings-section">
                    {/*Блок для отображения матрицы пользователя*/}
                    <div className="matrix-grid">
                        {yourMatrix && Array.isArray(yourMatrix) && yourMatrix.map((cell) => (
                        <div key={cell.matrix_part} className="matrix-cell"
                            style={{ 
                                backgroundColor: cell.color,
                                background: `linear-gradient(135deg, ${cell.color}CC, ${cell.color})`
                            }}>
                            <div className="cell-number">{cell.matrix_part}</div>
                            <div className="cell-name">{cell.matrix_name}</div>
                            <div className="cell-description">{cell.description}</div>
                        </div>
                        ))}
                    </div>
                    <Button variant="outline-primary" className="edit-btn" onClick={() => openModal(yourMatrix, 'yourMatrix_modal')}>Редактировать</Button>
                </div>
                {/*Заголовок блока настройки статусов*/}
                <div className="profile-header">
                    <h2 className="section-title">Настройка статусов</h2>
                </div>
                {/*Кнопка для добавления статуса только у главного администратора*/}
                {user.role === 'admin' && yourUser?.note === 'Администратор системы' && (
                <div className="text-end mb-3">
                        <Button variant="primary" style={{height: '60px'}} onClick={() => openModal(null, 'newStatus_modal')}>Добавить статус</Button>
                </div>
                )}
                <div className="settings-section">
                    {/*Блок для отображения статусов пользователя*/}
                    <div className="status-grid">
                        {error && <div className="error-message">{error}</div>}
                            {yourStatus && Array.isArray(yourStatus) && yourStatus.map((element, index) => (
                                <div className="profile-field">
                                    <span className="field-label">{index+1}. Название статуса</span>                        
                                    <span className="field-value">{element.status_name}</span>                  
                                </div>                   
                            ))}
                    </div>                    
                    <Button variant="outline-primary" className="edit-btn" onClick={() => openModal(yourStatus, 'yourStatus_modal')}>Редактировать</Button>
                </div>
                {user.role === 'admin' && (<>
                    {/*Заголовок блока настройки статусов выполнения*/}
                    <div className="profile-header">
                        <h2 className="section-title">Настройка статусов выполнения</h2>
                    </div>
                    {/*Кнопка для добавления статуса выполнения только у главного администратора*/}
                    {user.role === 'admin' && yourUser?.note === 'Администратор системы' && (
                    <div className="text-end mb-3">
                            <Button variant="primary" style={{height: '60px'}} onClick={() => openModal(null, 'newExecutionStatus_modal')}>Добавить статус выполнения</Button>
                    </div>
                    )}
                    <div className="settings-section">
                        {/*Блок для отображения статусов выполнения*/}
                        <div className="status-grid">
                            {error && <div className="error-message">{error}</div>}
                                {executionStatus && Array.isArray(executionStatus) && executionStatus.map((element, index) => (
                                    <div className="profile-field" style={{borderTop: `8px solid ${element.exec_color}`}}>
                                        <span className="field-label">{index+1}. Название статуса</span>                        
                                        <span className="field-value">{element.exec_status_name}</span>                  
                                    </div>                   
                                ))}
                        </div>
                        <Button variant="outline-primary" className="edit-btn" onClick={() => openModal(executionStatus, 'executionStatus_modal')}>Редактировать</Button>
                    </div>    
                </>)}
                {user.role === 'admin' && (<>
                    {/*Заголовок блока настройки типов повторения*/}
                    <div className="profile-header">
                        <h2 className="section-title">Настройка типов повторений</h2>
                    </div>
                    <div className="settings-section">
                        {/*Блок для отображения типов повторения*/}
                        <div className="status-grid">
                            {error && <div className="error-message">{error}</div>}
                                {repeatType && Array.isArray(repeatType) && repeatType.map((element) => (
                                    <div className="profile-field">
                                        <span className="field-label">Название типа</span>                        
                                        <span className="field-value">{element.type_name}</span>                  
                                    </div>                   
                                ))}
                        </div>
                        <Button variant="outline-primary" className="edit-btn" onClick={() => openModal(repeatType, 'repeatType')}>Редактировать</Button>
                    </div>
                </>)}
            </div>
        </div>
    </div>
);});

export default AppProfile;