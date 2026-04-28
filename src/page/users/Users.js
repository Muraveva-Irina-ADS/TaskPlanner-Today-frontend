import React, { useState, useEffect, useContext } from 'react';
import {get_settings, get_users, get_matrix, get_status, get_admin_settings_note, get_admin_matrix_note, get_admin_status_note,
user_post, user_put } from "../../api/commonApi";
import { observer } from "mobx-react-lite";
import NavBar from "../../components/NavBar";
import { Context } from "../../index";
import { Button, Form, Modal, Table, InputGroup, FormControl} from 'react-bootstrap';
import './Users.css';
import '../../styles/common.css'
import moment from 'moment';
import { useNavigate } from "react-router-dom";
import backIcon from '../../images/назад.png';
import toast from 'react-hot-toast';
import ModalStr from '../../components/ModalStructure';

const AppUsers = observer(() => {
    const { user } = useContext(Context);
    const [users, setUsers] = useState([]);
    const [settings, setSettings] = useState([]);
    const [matrix, setMatrix] = useState([]); 
    const [status, setStatus] = useState([]);
    const [adminSettings, setAdminSettings] = useState();
    const [adminMatrix, setAdminMatrix] = useState({});     
    const [adminStatus, setAdminStatus] = useState({});     
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isNewUser, setIsNewUser] = useState(false);
    const [formData, setFormData] = useState({});
    const [modalType, setModalType] = useState(null);   
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [visibleColumns, setVisibleColumns] = useState({
            last_name: true,
            first_name: true,
            email: true,
            phone_number: true,
            birthday: true,
            note: true,
            role_name: true,
            created_at: true,
            last_password_change_date: true,
            limit_tasks: false,
            pomodoro_duration: false,
            start_working_day: false,
            end_working_day: false,
            number_pomodoro_per_day: false,
            rest_duration: false,
            matrix_part: false,
            matrix_name: false,
            description: false,
            color: false,
            status_name: false,
            system_code: false
    });    
    const [filterField, setFilterField] = useState('email');
    const [filterValue, setFilterValue] = useState('');
    const [filteredUsers, setFilteredUsers] = useState([]);

    const getSettings = async () => {
        try {
            const settings = await get_settings();
            setSettings(settings);
        } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
        }
    };
    
    const getUsers = async () => {
        try {
            const data = await get_users();
            setUsers(data);
        } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
        }
    };
    
    const getMatrix = async () => {
        try {
            const matrix = await get_matrix();
            setMatrix(matrix);
        } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
        }
    };
    
    const getStatus = async () => {
        try {
            const status = await get_status();
            setStatus(status);
        } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
        }
    };
    const getAdminSettings = async () => {
        try {
         const adminSettings = await get_admin_settings_note("Администратор системы");
         setAdminSettings(adminSettings);
       } catch (e) {
         console.error('Ошибка при взаимодействии с сервером:', e);
         const message = e.response?.data?.error || 'Произошла ошибка';
         setError(message);
       }
     };
    const getAdminMatrix = async () => {
       try {
        const adminMatrix = await get_admin_matrix_note();
        setAdminMatrix(adminMatrix);
      } catch (e) {
        console.error('Ошибка при взаимодействии с сервером:', e);
        const message = e.response?.data?.error || 'Произошла ошибка';
        setError(message);
      }
    };
    const getAdminStatus = async () => {
       try {
        const adminStatus = await get_admin_status_note("Администратор системы");
        setAdminStatus(adminStatus);
      } catch (e) {
        console.error('Ошибка при взаимодействии с сервером:', e);
        const message = e.response?.data?.error || 'Произошла ошибка';
        setError(message);
      }
    };

    useEffect(() => {
        getSettings();
        getUsers();
        getMatrix();
        getStatus();
        getAdminSettings();
        getAdminMatrix();
        getAdminStatus();
    }, []);
    
    useEffect(() => {
        if (users && users.length > 0) {
            let filtered = users;
            
            if (filterValue.trim() !== '') {
                filtered = users.filter(user => {
                    const userSettings = settings?.find(s => s?.users_id === user?.id);
                    const userMatrix = matrix?.filter(m => m?.users_id === user?.id) || [];
                    const userStatus = status?.filter(s => s?.users_id === user?.id) || [];
                    const userFieldValue = user[filterField];
                    if (userFieldValue !== undefined && userFieldValue !== null) {
                        if (String(userFieldValue).toLowerCase().includes(filterValue.toLowerCase())) {
                            return true;
                        }
                    }
                    if (userSettings) {
                        const settingsFieldValue = userSettings[filterField];
                        if (settingsFieldValue !== undefined && settingsFieldValue !== null) {
                            if (String(settingsFieldValue).toLowerCase().includes(filterValue.toLowerCase())) {
                                return true;
                            }
                        }
                    }
                    if (userMatrix.length > 0) {
                        const matrixMatch = userMatrix.some(item => {
                            const matrixFieldValue = item[filterField];
                            if (matrixFieldValue === undefined || matrixFieldValue === null) return false;
                            return String(matrixFieldValue).toLowerCase().includes(filterValue.toLowerCase());
                        });
                        if (matrixMatch) return true;
                    }
                    if (userStatus.length > 0) {
                        const statusMatch = userStatus.some(item => {
                            const statusFieldValue = item[filterField];
                            if (statusFieldValue === undefined || statusFieldValue === null) return false;
                            return String(statusFieldValue).toLowerCase().includes(filterValue.toLowerCase());
                        });
                        if (statusMatch) return true;
                    }
                    return false;
                });
            }
            
            setFilteredUsers(filtered);
        } else {
            setFilteredUsers([]);
        }
    }, [users, settings, matrix, status, filterField, filterValue]);
    
    const openModal = (userData = null, modalType = null) => {
        if(userData){
            const userSettings = settings?.find(s => s?.users_id === userData?.id);
            const userMatrix = matrix?.filter(m => m?.users_id === userData?.id) || [];
            const userStatus = status?.filter(s => s?.users_id === userData?.id) || [];
            setFormData({
                ...userData,
                ...userSettings,
                matrix: userMatrix,
                status: userStatus,
            });
            setSelectedUser(userData);
            setIsNewUser(false);            
        } else {

            setSelectedUser(null);
            setFormData({
                ...adminSettings,
            matrix: adminMatrix,
            status: adminStatus});
            setIsNewUser(true);
        }
        setModalType(modalType);
        setShowModal(true);
    };
    
    const closeModal = () => {
        setShowModal(false);
        setSelectedUser(null);
        setIsNewUser(false);
        setModalType(null);
        setError('');
    };
    
    const handleChange = (e, index = null, dataType = 'user') => {
        const { name, value, type } = e.target;
        if (dataType === 'matrix' && index !== null && Array.isArray(formData.matrix)) {
            const updatedArray = [...formData.matrix];
            updatedArray[index] = {
                ...updatedArray[index], [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value
            };
            setFormData({...formData,
                matrix: updatedArray});
        }
        else if (dataType === 'status' && index !== null && Array.isArray(formData.status)) {
            const updatedArray = [...formData.status];
            updatedArray[index] = {
                ...updatedArray[index], [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value
            };
            setFormData({...formData,
                status: updatedArray});
        }
        else {
            if (type === 'number') {
                setFormData(prev => ({...prev, [name]: value === '' ? '' : Number(value)}));
            } else {
                setFormData(prev => ({...prev, [name]: value}));
            }
        }
    };
    
    const handleColumnToggle = (column) => {
        setVisibleColumns(prev => ({
            ...prev,
            [column]: !prev[column]
        }));
    };
    
    const getColumnHeaders = () => {
        const headers = [];
        if (visibleColumns.last_name) headers.push('Фамилия');
        if (visibleColumns.first_name) headers.push('Имя');
        if (visibleColumns.email) headers.push('Почта');
        if (visibleColumns.phone_number) headers.push('Телефон');
        if (visibleColumns.birthday) headers.push('День рождения');
        if (visibleColumns.note) headers.push('Замечания');
        if (visibleColumns.role_name) headers.push('Роль');
        if (visibleColumns.created_at) headers.push('Создан'); 
        if (visibleColumns.last_password_change_date) headers.push('Дата посл. смены пароля');       
        if (visibleColumns.limit_tasks) headers.push('Лимит задач');
        if (visibleColumns.pomodoro_duration) headers.push('Длит. помидора');
        if (visibleColumns.start_working_day) headers.push('Начало дня');
        if (visibleColumns.end_working_day) headers.push('Конец дня');
        if (visibleColumns.number_pomodoro_per_day) headers.push('Макс. кол-во помидоров в день');
        if (visibleColumns.rest_duration) headers.push('Отдых');
        return headers;
    };

    const getColumnKeys = () => {
        const keys = []; 
        if (visibleColumns.last_name) keys.push('last_name');
        if (visibleColumns.first_name) keys.push('first_name');
        if (visibleColumns.email) keys.push('email');
        if (visibleColumns.phone_number) keys.push('phone_number');
        if (visibleColumns.birthday) keys.push('birthday');
        if (visibleColumns.note) keys.push('note');
        if (visibleColumns.role_name) keys.push('role_name');
        if (visibleColumns.created_at) keys.push('created_at'); 
        if (visibleColumns.last_password_change_date) keys.push('last_password_change_date');   
        if (visibleColumns.limit_tasks) keys.push('limit_tasks');
        if (visibleColumns.pomodoro_duration) keys.push('pomodoro_duration');
        if (visibleColumns.start_working_day) keys.push('start_working_day');
        if (visibleColumns.end_working_day) keys.push('end_working_day');
        if (visibleColumns.number_pomodoro_per_day) keys.push('number_pomodoro_per_day');
        if (visibleColumns.rest_duration) keys.push('rest_duration');
        return keys;
    };
    const handleSelectAll = () => {
        const allSelected = Object.values(visibleColumns).every(value => value === true);
        const newVisibleColumns = {};
        Object.keys(visibleColumns).forEach(key => {
            newVisibleColumns[key] = !allSelected;
        });
        
        setVisibleColumns(newVisibleColumns);
    };
    const handleUser = () => {
        const userData = {
            user: {
                last_name: formData.last_name,
                first_name: formData.first_name,
                phone_number: formData.phone_number,
                email: formData.email,
                curPassword: formData.curPassword,
                newPassword: formData.newPassword,
                birthday: formData.birthday,
                role_name: formData.role_name,
                note: formData.note
            },
            settings: {
                limit_tasks: formData.limit_tasks,
                pomodoro_duration: formData.pomodoro_duration,
                start_working_day: formData.start_working_day,
                end_working_day: formData.end_working_day,
                number_pomodoro_per_day: formData.number_pomodoro_per_day,
                rest_duration: formData.rest_duration
            },
            matrix: formData.matrix,
            status: formData.status
        };
        if (!userData.user.first_name || !userData.user.last_name || !userData.user.email ||
             !userData.user.phone_number || !userData.user.birthday || !userData.user.note) {
                setError('Все поля должны быть заполнены');
                return;
        }
        if (!userData.user.curPassword && isNewUser && userData.user.curPassword.length < 6) {
            setError('Пароль должен содержать минимум 6 символов');
            return;
        }
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(userData.user.email)) {
            setError('Некорректный формат электронной почты');
            return;
        }
        if (!selectedUser) {
            const existingUser = users.find(elem => elem.email === userData.user.email);
            if (existingUser) {
                setError(`Пользователь с таким email уже существует`);
                return;
            }
        }
        else {
            const existingUser = users.find(elem => elem.email === userData.user.email && elem.id !== selectedUser.id
            );
            if (existingUser) {
                setError(`Пользователь с таким email уже существует`);
                return;
            }
        }
        const phoneRegex = /^[0-9+\-\s()]{10,20}$/;
        if (!phoneRegex.test(userData.user.phone_number)) {
            setError('Некорректный формат номера телефона');
            return;
        }
        const birthDate = new Date(userData.user.birthday);
        const today = new Date();
        if (birthDate > today) {
            setError('Дата рождения не может быть в будущем');
            return;
        }
        if (isNaN(birthDate.getTime())) {
            setError('Некорректный формат даты рождения');
            return;
        }
          if (userData.settings.limit_tasks <= 0 || userData.settings.pomodoro_duration <= 0 || 
            userData.settings.number_pomodoro_per_day <= 0 || userData.settings.rest_duration <= 0) {
                setError('Все поля у настроек должны быть заполнены неотрицательными числами');
                return;
        }
        if (userData.settings.pomodoro_duration > 60 || userData.settings.rest_duration > 60) {
            setError('Длительность помодоро или отдыха не должна превышать одного часа');
            return;
        }          
        const checkInteger = (value, fieldName) => {
          if (!Number.isInteger(Number(value))) {
            setError(`${fieldName} должно быть целым числом`);
            return;
          }
      };
      checkInteger(userData.settings.limit_tasks, 'Лимит задач');
      checkInteger(userData.settings.pomodoro_duration, 'Длительность помидора');
      checkInteger(userData.settings.number_pomodoro_per_day, 'Максимальное количество помидоров в день');
      checkInteger(userData.settings.rest_duration, 'Длительность отдыха');
      const timeToMinutes = (timeStr) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
      };
      const startMinutes = timeToMinutes(userData.settings.start_working_day);
      const endMinutes = timeToMinutes(userData.settings.end_working_day);
    
      let workingDayMinutes;
      if (endMinutes >= startMinutes) {
          workingDayMinutes = endMinutes - startMinutes;
      } else {
        setError('Рабочий день должен быть в пределах одного дня');
      }
    if (workingDayMinutes < 60) {
        setError('Рабочий день должен быть не менее 1 часа');
        return;
    }
    const pomodoroCycleMinutes = Number(userData.settings.pomodoro_duration) + Number(userData.settings.rest_duration);
    const maxPossiblePomodoros = Math.floor(workingDayMinutes / pomodoroCycleMinutes);
    if (userData.settings.number_pomodoro_per_day > maxPossiblePomodoros) {
        setError(`Запрошено слишком много помидоров. Максимально возможное количество для вашего рабочего дня: ${maxPossiblePomodoros}`);
        return;
      }  
    for (const element of userData.matrix)
      if (element.matrix_part <= 0 || !element.matrix_name || !element.description) {
        setError('Все поля в матрице должны быть заполнены');
        return;
    } 
    for (const elem of userData.status)
      if (!elem.status_name) {
        setError('Все поля у статусов должны быть заполнены');
        return;
    } 
        if (isNewUser)
            handleAddUser(userData);
        else
            handleSaveUser(userData);
    }
    const handleAddUser = async(userData) => {
        try {
        const data = await user_post(userData);
            if (data) {
                toast.success('Добавлено');                
                if (data.updatedAdminUser) 
                    if (data.updatedAdminUser.email === user.email) {
                        user.setUser(data.updatedAdminUser);
                        alert('Вы больше не являетесь главным администратором');
                    }
                closeModal();
                getSettings();
                getUsers();
                getMatrix();
                getStatus();
                if (userData.user.note === 'Администратор системы') {
                    getAdminSettings();
                    getAdminMatrix();
                    getAdminStatus();
                }
            }
        } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
        }
    }
    const handleSaveUser = async(userData) => {
        try {
            const data = await user_put(selectedUser.id, userData);
                if (data) {
                    toast.success('Сохранено');
                    if (data.updatedAdminUser) 
                        if (data.updatedAdminUser.email === user.email) {
                            user.setUser(data.updatedAdminUser);
                            alert('Вы больше не являетесь главным администратором');
                        }
                    if (selectedUser.email === user.email)
                        if (user.email !== userData.user.email || user.role !== userData.user.role_name) {
                                localStorage.setItem('token', '');
                                user.setEmail("");
                                user.setRole("");
                                user.setUser("");
                                user.setIsAuth(false);
                                user.setPasswordChange(false);
                                alert("Были изменены настройки профиля, пожалуйста авторизуйтесь заново");
                                navigate("/");
                            }
                    closeModal();
                    getSettings();
                    getUsers();
                    getMatrix();
                    getStatus();
                    if (userData.user.note === 'Администратор системы') {
                        getAdminSettings();
                        getAdminMatrix();
                        getAdminStatus();
                    }
                }
        } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
        }
    }
    return (
        <div className="app-profile-wrapper">
            <NavBar />
            {modalType === 'user_modal' && (<ModalStr show={showModal} onHide={closeModal} modalType={modalType} title={isNewUser ? 'Добавление нового пользователя' : 'Редактирование настроек пользователя'}
                        formData={formData} onChange={handleChange} onSave={handleUser} error={error} isNew={isNewUser}
                        fields={['first_name', 'last_name', 'email', 'curPassword', 'newPassword', 'role_name_users', 'phone_number', 'birthday', 'note_users', 
                        'limit_tasks', 'pomodoro_duration', 'rest_duration', 'start_working_day', 'end_working_day', 'number_pomodoro_per_day',
                        'matrix_put', 'status_put']} 
                        extraData={{user: user, selectedUser: selectedUser, adminSettings: adminSettings,
                        adminMatrix: adminMatrix, adminStatus: adminStatus}}/>)}
            
            {modalType==='user_modal' ? (<> <Modal show={showModal} onHide={closeModal} modalType={modalType} centered>
                    <Modal.Header closeButton>
                        <Modal.Title className="h1-prof">{isNewUser ? 'Добавление нового пользователя' : 'Редактирование настроек пользователя'}</Modal.Title>
                    </Modal.Header>
                    
                    <Modal.Body>
                        <Form>
                        {error && <div className="error-message">{error}</div>}
                            <Form.Group className="mb-3">
                                <Form.Label className="field-label">Имя</Form.Label><br/>
                                <Form.Control
                                className="mt-3 custom-input"
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name || ''}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                            
                            <Form.Group className="mb-3">
                            <Form.Label className="field-label">Фамилия</Form.Label><br/>
                                <Form.Control
                                className="mt-3 custom-input"
                                    type="text"
                                    name="last_name"
                                    value={formData.last_name || ''}
                                    onChange={handleChange}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                            <Form.Label className="field-label">Почта</Form.Label><br/>
                                <Form.Control
                                className="mt-3 custom-input"
                                    type="email"
                                    name="email"
                                    value={formData.email || ''}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                            {!isNewUser && (
                                <p>Для изменения пароля введите текущий пароль. Если пароль не меняете - оставьте поле пустым</p>
                            )}
                            

                            <Form.Group className="mb-3">
                            <Form.Label className="field-label">{!isNewUser ? 'Текущий пароль' : 'Пароль'}</Form.Label><br/>
                                <Form.Control
                                className="mt-3 custom-input"
                                    type="password"
                                    name="curPassword"
                                    value={formData.curPassword || ''}
                                    onChange={handleChange}
                                />
                            </Form.Group>

                            {formData.curPassword && selectedUser != null && (
                                <Form.Group className="mb-3">
                                    <Form.Label className="field-label">Новый пароль</Form.Label><br/>
                                    <Form.Control
                                    className="mt-3 custom-input"
                                        type="password"
                                        name="newPassword"
                                        value={formData.newPassword || ''}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            )}
                            
                                <Form.Group className="mb-3">
                                    <Form.Label className="field-label">Роль</Form.Label><br/>
                                    {!selectedUser || selectedUser.note !== 'Администратор системы'?
                                    <Form.Select
                                    className="mt-3 mb-3 p-4 modal-input"
                                        name="role_name"
                                        value={formData.role_name || 'user'}
                                        onChange={handleChange}
                                    >
                                        <option value="user">Пользователь</option>
                                        <option value="admin">Администратор</option>
                                    </Form.Select> : 
                                    <Form.Control
                                className="mt-3 custom-input"
                                    type="text"
                                    name="role_name"
                                    value={formData.role_name === 'admin' ? 'Администратор' : 'Пользователь'}
                                    readOnly
                                />}
                                </Form.Group> 

                            <Form.Group className="mb-3">
                            <Form.Label className="field-label">Номер телефона</Form.Label><br/>
                                <Form.Control
                                className="mt-3 custom-input"
                                    type="tel"
                                    name="phone_number"
                                    value={formData.phone_number || ''}
                                    onChange={handleChange}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                            <Form.Label className="field-label">Дата рождения</Form.Label><br/>
                                <Form.Control
                                className="mt-3 custom-input"
                                    type="date"
                                    name="birthday"
                                    value={formData.birthday ? moment(formData.birthday).format('YYYY-MM-DD') : ''}
                                    onChange={handleChange}
                                />
                            </Form.Group>

                            <p>
                                "Администратор системы" означает, что текущий администратор - главный.
                                Замечание с таким значением обязательно должно быть только у одного администратора (а у пользователя быть не должно).
                            </p>

                            <Form.Group className="mb-3">
                            <Form.Label className="field-label">Замечания</Form.Label><br/>
                            {selectedUser && selectedUser.note === 'Администратор системы' ? 
                                <Form.Control
                                className="mt-3 custom-input"
                                    as="textarea"
                                    rows={2}
                                    name="note"
                                    value={formData.note || ''}
                                    readOnly 
                                /> : <Form.Control
                                className="mt-3 custom-input"
                                    as="textarea"
                                    rows={2}
                                    name="note"
                                    value={formData.note || ''}
                                    onChange={handleChange} />}

                            </Form.Group>

                            <Modal.Title className="h1-prof">{'Изменить информацию о настройках пользователя'}</Modal.Title>
                            <p>Поле Лимит задач хранит максимальное количество задач в день. Если не хотите иметь лимит задач в день, введите достаточно большое число</p>
                            <Form.Group className="mb-3">
                                <Form.Label className="field-label">Лимит задач</Form.Label><br/>
                                <Form.Control
                                className="mt-3 custom-input"
                                    type="number"
                                    name="limit_tasks"
                                    value={formData.limit_tasks || ''}
                                    onChange={handleChange}
                                />
                                <p style={{color: "grey"}}>По умолчанию Лимит задач: {adminSettings?.limit_tasks}</p>
                            </Form.Group>
                            <p>Поля Длительность подидора и Длительность отдыха хранят количество минут. 
                                Классический формат метода Pomodoro — 25 минут работы над одной конкретной задачей и 5 минут отдыха.
                                Увеличение рабочего блока до 45 или 50 минут с последующим отдыхом в 10–15 минут. Такой формат удобен 
                                для глубоких и аналитических задач, требующих длительной концентрации и минимального количества переключений.</p>
                            <Form.Group className="mb-3">
                            <Form.Label className="field-label">Длительность помидора</Form.Label><br/>
                                <Form.Control
                                className="mt-3 custom-input"
                                    type="number"
                                    name="pomodoro_duration"
                                    value={formData.pomodoro_duration || ''}
                                    onChange={handleChange}
                                />
                                <p style={{color: "grey"}}>По умолчанию Длительность помидора: {adminSettings?.pomodoro_duration}</p>
                            </Form.Group>
                            <Form.Group className="mb-3">
                            <Form.Label className="field-label">Длительность отдыха</Form.Label><br/>
                                <Form.Control
                                className="mt-3 custom-input"
                                    type="number"
                                    name="rest_duration"
                                    value={formData.rest_duration || ''}
                                    onChange={handleChange}
                                />
                                <p style={{color: "grey"}}>По умолчанию Длительность отдыха: {adminSettings?.rest_duration}</p>
                            </Form.Group>
                            <p>Поля Начало и Конец рабочего дня хранят время начала и окончания рабочего дня соответственно. 
                                Введите 00:00 и 23:59, если хотите, чтобы рабочий день длился весь день</p>
                            <Form.Group className="mb-3">
                            <Form.Label className="field-label">Начало рабочего дня</Form.Label><br/>
                                <Form.Control
                                className="mt-3 custom-input"
                                    type="time"
                                    name="start_working_day"
                                    value={formData.start_working_day || ''}
                                    onChange={handleChange}
                                />
                                <p style={{color: "grey"}}>По умолчанию Начало рабочего дня: {adminSettings?.start_working_day.substring(0, 5)}</p>
                            </Form.Group>
                            <Form.Group className="mb-3">
                            <Form.Label className="field-label">Конец рабочего дня</Form.Label><br/>
                                <Form.Control
                                className="mt-3 custom-input"
                                    type="time"
                                    name="end_working_day"
                                    value={formData.end_working_day || ''}
                                    onChange={handleChange}
                                />
                                <p style={{color: "grey"}}>По умолчанию Конец рабочего дня: {adminSettings?.end_working_day.substring(0, 5)}</p>
                            </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label className="field-label">Максимальное количество помидоров в день</Form.Label><br/>
                                    <Form.Control
                                    className="mt-3 custom-input"
                                        type="number"
                                        name="number_pomodoro_per_day"
                                        value={formData.number_pomodoro_per_day || ''}
                                        onChange={handleChange}
                                    />
                                    <p style={{color: "grey"}}>По умолчанию Максимальное количество помидоров в день: {adminSettings?.number_pomodoro_per_day}</p>
                                </Form.Group>
                                <Modal.Title className="h1-prof">{'Изменить информацию о настройках матрицы пользователя'}</Modal.Title>
                                <div className="matrix-edit-grid mb-4">
                                    {formData.matrix && Array.isArray(formData.matrix) && 
                                        formData.matrix
                                            .sort((a, b) => a.matrix_part - b.matrix_part)
                                            .map((cell, index) => (
                                                <div key={cell.matrix_part} className="matrix-edit-cell">
                                                    <div className="matrix-quadrant-header">
                                                        <div className="quadrant-number-badge">
                                                            {cell.matrix_part}
                                                        </div>
                                                    </div>
                                                    <div className="matrix-edit-form">
                                                        <Form.Group className="mb-3">
                                                            <Form.Label className="field-label">Название квадранта</Form.Label>
                                                            <Form.Control
                                                            className="mt-3 custom-input"
                                                                type="text"
                                                                name="matrix_name"
                                                                value={cell.matrix_name}
                                                                onChange={(e) => handleChange(e, index, 'matrix')}
                                                                placeholder="Введите название"
                                                            />
                                                            <p style={{color: "grey"}}>По умолчанию Название квадранта: {adminMatrix[index]?.matrix_name}</p>
                                                        </Form.Group>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label className="field-label">Описание</Form.Label>
                                                            <Form.Control
                                                            className="mt-3 custom-input"
                                                                as="textarea"
                                                                rows={3}
                                                                name={"description"}
                                                                value={cell.description}
                                                                onChange={(e) => handleChange(e, index, 'matrix')}
                                                                placeholder="Введите описание"
                                                            />
                                                            <p style={{color: "grey"}}>По умолчанию Описание: {adminMatrix[index]?.description}</p>
                                                        </Form.Group>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label className="matrix-field-label">Цвет квадранта</Form.Label>
                                                            <div className="color-picker-container">
                                                                <Form.Control
                                                                    type="color"
                                                                    name={"color"}
                                                                    value={cell.color}
                                                                    onChange={(e) => handleChange(e, index, 'matrix')}
                                                                    className="color-picker"
                                                                    title="Выберите цвет"
                                                                />
                                                                <span className="color-preview" 
                                                                    style={{ 
                                                                        backgroundColor: cell.color 
                                                                    }}>
                                                                </span>
                                                                <span className="color-value">
                                                                    {cell.color}
                                                                </span>                                               
                                                            </div>
                                                        </Form.Group>
                                                        <p style={{color: "grey"}}>По умолчанию Цвет квадранта: {adminMatrix[index]?.color}</p> 
                                                    </div>
                                                    <div className="matrix-preview">
                                                        <div 
                                                            className="matrix-preview-cell"
                                                            style={{ 
                                                                backgroundColor: cell.color
                                                            }}
                                                        >
                                                            <div className="preview-number">{cell.matrix_part}</div>
                                                            <div className="preview-name">
                                                                {cell.matrix_name}
                                                            </div>
                                                            <div className="preview-description">
                                                                {cell.description}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                    }
                                </div>
                                <Modal.Title className="h1-prof">{'Изменить информацию о настройках статусов пользователя'}</Modal.Title>
                                <div className="matrix-edit-grid mb-4">
                                    {formData.status && Array.isArray(formData.status) && 
                                        formData.status
                                        .sort((a, b) => a.id - b.id)
                                            .map((element, index) => (
                                                <div>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label className="field-label">Название статуса</Form.Label>
                                                            <Form.Control
                                                            className="mt-3 custom-input"
                                                                type="text"
                                                                name="status_name"
                                                                value={element.status_name}
                                                                onChange={(e) => handleChange(e, index, 'status')}
                                                                placeholder="Введите название"
                                                            />
                                                            <p style={{color: "grey"}}>По умолчанию Название статуса: {adminStatus[index]?.status_name}</p>
                                                        </Form.Group>                                                      
                                                </div>
                                            ))
                                    }
                                </div>
                                {error && <div className="error-message">{error}</div>}
                        </Form>
                    </Modal.Body>
                    
                    <Modal.Footer>
                        <Button variant="secondary" onClick={closeModal}>Закрыть</Button>
                        <Button variant="primary" onClick={handleUser}>{isNewUser ? 'Добавить' : 'Сохранить'}</Button>
                    </Modal.Footer>
                </Modal> </> ) : <></>}


            <div className="back-button-container">
                <button onClick={() => navigate(-1)} className="back-button">
                <img src={backIcon} className="back-icon"/>Назад</button>
            </div>
            <div className="profile-header">
                <h1 className="h1-prof">Управление данными пользователей</h1>
            </div>
            
            <div className="text-end mb-3">
                <Button variant="primary" style={{height: '60px'}} onClick={() => openModal(null, 'user_modal')}>Добавить пользователя</Button>
                <Button variant="primary" style={{height: '60px'}} onClick={() => navigate("/all-projects")}>Информация о всех проектах</Button>
                <Button variant="primary" style={{height: '60px'}} onClick={() => navigate("/all-tasks")}>Информация о всех задачах</Button>
            </div>

            <div className="columns-selector">
                <div className="profile-header">
                    <h2 className="h1-prof">Выберите колонки для отображения:</h2>
                </div>
                <div className="profile-grid">
                    <Form.Check className="profile-field1" type="checkbox" label="Выделить все" 
                        checked={Object.values(visibleColumns).every(value => value === true)} onChange={handleSelectAll} />
                    <Form.Check className="profile-field1" type="checkbox" label="Фамилия" 
                        checked={visibleColumns.last_name} onChange={() => handleColumnToggle('last_name')} />
                    <Form.Check className="profile-field1" type="checkbox" label="Имя" 
                        checked={visibleColumns.first_name} onChange={() => handleColumnToggle('first_name')} />
                    <Form.Check className="profile-field1" type="checkbox" label="Почта" 
                        checked={visibleColumns.email} onChange={() => handleColumnToggle('email')} />
                    <Form.Check className="profile-field1" type="checkbox" label="Телефон" 
                        checked={visibleColumns.phone_number} onChange={() => handleColumnToggle('phone_number')} />
                    <Form.Check className="profile-field1" type="checkbox" label="День рождения" 
                        checked={visibleColumns.birthday} onChange={() => handleColumnToggle('birthday')} />
                    <Form.Check className="profile-field1" type="checkbox" label="Замечания" 
                        checked={visibleColumns.note} onChange={() => handleColumnToggle('note')} />              
                    <Form.Check className="profile-field1" type="checkbox" label="Роль" 
                        checked={visibleColumns.role_name} onChange={() => handleColumnToggle('role_name')} />
                    <Form.Check className="profile-field1" type="checkbox" label="Создан" 
                        checked={visibleColumns.created_at} onChange={() => handleColumnToggle('created_at')} />
                    <Form.Check className="profile-field1" type="checkbox" label="Дата посл. смены пароля" 
                        checked={visibleColumns.last_password_change_date} onChange={() => handleColumnToggle('last_password_change_date')} />
                    <Form.Check className="profile-field1" type="checkbox" label="Лимит задач" 
                        checked={visibleColumns.limit_tasks} onChange={() => handleColumnToggle('limit_tasks')} />
                    <Form.Check className="profile-field1" type="checkbox" label="Длит. помидора" 
                        checked={visibleColumns.pomodoro_duration} onChange={() => handleColumnToggle('pomodoro_duration')} />
                    <Form.Check className="profile-field1" type="checkbox" label="Начало дня" 
                        checked={visibleColumns.start_working_day} onChange={() => handleColumnToggle('start_working_day')} />
                    <Form.Check className="profile-field1" type="checkbox" label="Конец дня" 
                        checked={visibleColumns.end_working_day} onChange={() => handleColumnToggle('end_working_day')} />
                    <Form.Check className="profile-field1" type="checkbox" label="Макс. помидоров" 
                        checked={visibleColumns.number_pomodoro_per_day} onChange={() => handleColumnToggle('number_pomodoro_per_day')} />
                    <Form.Check className="profile-field1" type="checkbox" label="Отдых" 
                        checked={visibleColumns.rest_duration} onChange={() => handleColumnToggle('rest_duration')} />                     
                    <Form.Check className="profile-field1" type="checkbox" label="Номер квадранта" 
                        checked={visibleColumns.matrix_part} onChange={() => handleColumnToggle('matrix_part')} />
                    <Form.Check className="profile-field1" type="checkbox" label="Название матрицы" 
                        checked={visibleColumns.matrix_name} onChange={() => handleColumnToggle('matrix_name')} />
                    <Form.Check className="profile-field1" type="checkbox" label="Описание" 
                        checked={visibleColumns.description} onChange={() => handleColumnToggle('description')} />
                    <Form.Check className="profile-field1" type="checkbox" label="Цвет" 
                        checked={visibleColumns.color} onChange={() => handleColumnToggle('color')} />
                    <Form.Check className="profile-field1" type="checkbox" label="Название статуса" 
                        checked={visibleColumns.status_name} onChange={() => handleColumnToggle('status_name')} />
                    <Form.Check className="profile-field1" type="checkbox" label="Системный код" 
                        checked={visibleColumns.system_code} onChange={() => handleColumnToggle('system_code')} />
                </div>
            </div>
            
            <div className="filter-section">
                <div className="section-select">
                    <h2 className="h1-prof">Фильтрация</h2>
                    <InputGroup className="mb-3">
                        <InputGroup.Text className="field-label">Поле для фильтрации</InputGroup.Text>
                        <Form.Select className="mt-3 select" value={filterField} onChange={(e) => setFilterField(e.target.value)}>
                            <option value="email">Почта</option>
                            <option value="last_name">Фамилия</option>
                            <option value="first_name">Имя</option>
                            <option value="phone_number">Телефон</option>
                            <option value="birthday">День рождения</option>
                            <option value="role_name">Роль</option>
                            <option value="created_at">Создан</option>
                            <option value="last_password_change_date">Дата последней смены пароля</option>                            
                            <option value="note">Замечания</option>
                            <option value="limit_tasks">Лимит задач</option>
                            <option value="pomodoro_duration">Длительность помидора</option>
                            <option value="start_working_day">Начало рабочего дня</option>
                            <option value="end_working_day">Конец рабочего дня</option>    
                            <option value="number_pomodoro_per_day">Количество помидоров в день</option>    
                            <option value="rest_duration">Длительность отдыха</option>                        
                            <option value="matrix_name">Название матрицы</option>
                            <option value="matrix_part">Номер квадранта</option>
                            <option value="description">Описание</option>              
                            <option value="status_name">Название статуса</option>
                            <option value="system_code">Системный код</option>
                        </Form.Select>
                        
                        <InputGroup.Text className="field-label">Значение</InputGroup.Text>
                        <FormControl className="mt-3 select" placeholder="Введите значение для поиска..."
                            value={filterValue} onChange={(e) => setFilterValue(e.target.value)} />
                    </InputGroup>
                </div>
            </div>
            
            <div className="users-table-container">
            <Table striped bordered hover responsive className="users-table">
            <thead>
                <tr>
                    {getColumnHeaders().map((header, index) => (
                        <th key={index}>{header}</th>
                    ))}
                    <th className="actions-header">Действия</th>
                </tr>
            </thead>
            <tbody>
                {filteredUsers.map((user) => {
                    const userSettings = settings?.find(s => s?.users_id === user?.id);
                    const userMatrix = matrix?.filter(m => m?.users_id === user?.id) || [];
                    const userStatus = status?.filter(s => s?.users_id === user?.id) || [];
                    
                    const sortedMatrix = [...userMatrix].sort((a, b) => (a.matrix_part || 0) - (b.matrix_part || 0));
                    const sortedStatus = [...userStatus].sort((a, b) => (a.order_number || 0) - (b.order_number || 0));

                    const showMatrix = visibleColumns.matrix_part || visibleColumns.matrix_name || 
                                    visibleColumns.description || visibleColumns.color;
                    const showStatus = visibleColumns.status_name || visibleColumns.system_code;
                    return (
                        <React.Fragment key={user.id}>
                            <tr className="user-main-row">
                                {getColumnKeys().map((key, colIndex) => {
                                    let value;
                                    if (['limit_tasks', 'pomodoro_duration', 'number_pomodoro_per_day', 'rest_duration'].includes(key)) {
                                        value = userSettings?.[key];
                                    } 
                                    else if (['start_working_day', 'end_working_day'].includes(key)) {
                                        value = userSettings?.[key].substring(0, 5);
                                    }
                                    else {
                                        value = user[key];
                                    }
                                    if ((key === 'birthday' || key === 'created_at' || key === 'last_password_change_date') && value) {
                                        value = new Date(value).toLocaleDateString('ru-RU');
                                    }
                                    return <td key={colIndex} className="user-data-cell">{value || '-'}</td>;
                                })}
                                
                                <td className="actions-cell">
                                        <Button variant="primary" onClick={() => openModal(user, 'user_modal')}>Редактировать</Button>
                                </td>
                            </tr>
                            {(showMatrix || showStatus) && (
                                <tr className="user-details-row">
                                    {showMatrix && (
                                        <td colSpan={showStatus ? getColumnHeaders().length / 2 : getColumnHeaders().length} 
                                            className="matrix-cell1">
                                            <div className="matrix-section">
                                                <div className="section-title1">Матрица Эйзенхауэра</div>
                                                <div className="grid-users">
                                                    {sortedMatrix.map((item) => (
                                                        <div key={item.id} className="matrix-item" 
                                                        style={visibleColumns.color ? { backgroundColor: item.color || '#757575 ' } : { backgroundColor: '#757575 ' }}>
                                                            {visibleColumns.matrix_part && (
                                                                <span className="matrix-part">{item.matrix_part}</span>
                                                            )}
                                                            {visibleColumns.matrix_name && (
                                                                <span className="matrix-name">{item.matrix_name || '—'}</span>
                                                            )}
                                                            {visibleColumns.description && (
                                                                <span className="matrix-description">{item.description || ''}</span>
                                                            )}
                                                        </div>
                                                    ))}
                                                    {sortedMatrix.length === 0 && (
                                                        <div className="no-data">Нет данных матрицы</div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    )}
                                    {showStatus && (
                                        <td colSpan={showMatrix ? getColumnHeaders().length / 2 : getColumnHeaders().length} 
                                            className="status-cell">
                                            <div className="status-section">
                                                <div className="section-title1">Статусы задач</div>
                                                <div className="grid-users">
                                                    {sortedStatus.map((item) => (
                                                        <div key={item.id} className="status-item">
                                                            {visibleColumns.status_name && (
                                                                <span className="status-name">{item.status_name || '—'}</span>
                                                            )}
                                                            {visibleColumns.system_code && item.system_code && (
                                                                <span className="status-code">({item.system_code})</span>
                                                            )}
                                                        </div>
                                                    ))}
                                                    {sortedStatus.length === 0 && (
                                                        <div className="no-data">Нет данных статусов</div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            )}
                        </React.Fragment>
                    );
                })}
                {filteredUsers.length === 0 && (
                    <tr>
                        <td colSpan={getColumnHeaders().length + 1} className="text-center">
                            Нет данных для отображения
                        </td>
                    </tr>
                )}
            </tbody>
        </Table>
    </div>
    </div>
    );
});

export default AppUsers;