import React, { useContext, useState, useEffect } from 'react';
import {get_profile_settings_email, get_profile_user_email, profile_user_put, profile_settings_put, get_profile_matrix_email, profile_matrix_put,
get_profile_status_email, get_admin_settings_note, get_admin_matrix_note, get_admin_status_note, profile_status_put, profile_status_add,
execution_status_add, execution_status_put, get_executionStatus, get_repeat_types, repeat_type_put } from "../../api/commonApi";
import { observer } from "mobx-react-lite";
import { Context } from "../../index";
import NavBar from "../../components/NavBar";
import { Button, Form, Modal} from 'react-bootstrap';//, Table 
import moment from 'moment';
import './Profile.css';
import '../../styles/common.css'
import { useNavigate } from "react-router-dom";
import backIcon from '../../images/назад.png';
import toast from 'react-hot-toast';

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
  const getYourSettings = async () => {
     try {
      const yourSettings = await get_profile_settings_email();
      setYourSettings(yourSettings);
    } catch (e) {
      console.error('Ошибка при взаимодействии с сервером:', e);
      const message = e.response?.data?.error || 'Произошла ошибка';
      setError(message);
    }
  };
  const getYourUser = async () => {
    try {
     const data = await get_profile_user_email();
     setYourUser(data);
   } catch (e) {
     console.error('Ошибка при взаимодействии с сервером:', e);
     const message = e.response?.data?.error || 'Произошла ошибка';
     setError(message);
   }
 };
 const getYourMatrix = async () => {
    try {
     const yourMatrix = await get_profile_matrix_email();
     setYourMatrix(yourMatrix);
   } catch (e) {
     console.error('Ошибка при взаимодействии с сервером:', e);
     const message = e.response?.data?.error || 'Произошла ошибка';
     setError(message);
   }
 };
 const getYourStatus = async () => {
    try {
     const yourStatus = await get_profile_status_email();
     setYourStatus(yourStatus);
   } catch (e) {
     console.error('Ошибка при взаимодействии с сервером:', e);
     const message = e.response?.data?.error || 'Произошла ошибка';
     setError(message);
   }
 };
 const getRepeatType = async () => {
    try {
     const repeatType = await get_repeat_types();
     setRepeatType(repeatType);
   } catch (e) {
     console.error('Ошибка при взаимодействии с сервером:', e);
     const message = e.response?.data?.error || 'Произошла ошибка';
     setError(message);
   }
 }; 
 const getExecutionStatus = async () => {
    try {
     const executionStatus = await get_executionStatus();
     setExecutionStatus(executionStatus);
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

    const closeModal = () => {
      setShowModal(false);
      setSelectedUser(null);
      setModalType(null);
      setError('');
  };
  const handleChange = (e, index = null) => {
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
    }
};
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
              }
              else {
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
      }
      };
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
            console.log(formData)
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
          }
          };
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
    <div className="app-profile-wrapper">
        <NavBar />
        {modalType==='yourUser_modal' ? (<> <Modal show={showModal} onHide={closeModal} modalType={modalType} centered>
                    <Modal.Header closeButton>
                        <Modal.Title className="h1-prof">{'Изменить информацию о пользователе'}</Modal.Title>
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

                            <p>Для изменения пароля введите текущий пароль. Если пароль не меняете - оставьте поле пустым</p>

                            <Form.Group className="mb-3">
                            <Form.Label className="field-label">Текущий пароль</Form.Label><br/>
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
                            
                            {user.role === 'admin' ?
                                <Form.Group className="mb-3">
                                <Form.Label className="field-label">Роль</Form.Label><br/>
                                {yourUser.note !== 'Администратор системы'?
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
                            : <></> }

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

                            {user.role === "admin" && (
                                <p>
                                    "Администратор системы" означает, что текущий администратор - главный.
                                    Замечание с таким значением обязательно должно быть только у одного администратора.
                                </p>
                            )}

                            <Form.Group className="mb-3">
                            <Form.Label className="field-label">Замечания</Form.Label><br/>
                            {yourUser.note === 'Администратор системы' ? 
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
                        </Form>
                    </Modal.Body>
                    
                    <Modal.Footer>
                        <Button variant="secondary" onClick={closeModal}>Закрыть</Button>
                        <Button variant="primary" onClick={handleUser}>{'Сохранить'}</Button>
                    </Modal.Footer>
                </Modal> </> ) : <></>}
                {modalType==='yourSettings_modal' ? (<> <Modal show={showModal} onHide={closeModal} modalType={modalType} centered>
                    <Modal.Header closeButton>
                        <Modal.Title className="h1-prof">{'Изменить настройки пользователя'}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                        {error && <div className="error-message">{error}</div>}
                        <p>Поле Лимит задач содержит информацию о максимальном количестве задач в день. Если не хотите иметь лимит задач в день, введите достаточно большое число</p>
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
                            <p>Поля Длительность подидора и Длительность отдыха содержат информацию о количестве минут. 
                                Классический формат метода Pomodoro — 25 минут работы над одной конкретной задачей и 5 минут отдыха.
                                Можно увеличить время рабочего блока до 45 или 50 минут с последующим отдыхом в 10–15 минут. Такой формат удобен 
                                для глубоких и аналитических задач, требующих длительной концентрации и минимального количества переключений.
                                Длительность можно настройти под себя, однако время не должно превышать одного часа.</p>
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
                            <p>Поля Начало и Конец рабочего дня содержат информацию о времеми начала и окончания рабочего дня соответственно. 
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
                                {error && <div className="error-message">{error}</div>}
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={closeModal}>Закрыть</Button>
                        <Button variant="primary" onClick={handleSaveSettings}>{'Сохранить'}</Button>
                    </Modal.Footer>
                </Modal> </> ) : <></>}

                {modalType === 'yourMatrix_modal' ? (
    <Modal show={showModal} onHide={closeModal} centered size="lg">
        <Modal.Header closeButton>
            <Modal.Title className="h1-prof">Настройки матрицы Эйзенхауэра</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form>
                {error && <div className="error-message">{error}</div>}
                <div className="matrix-edit-grid mb-4">
                    {formData && Array.isArray(formData) && 
                        formData
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
                                                onChange={(e) => handleChange(e, index)}
                                                placeholder="Введите название"
                                            />
                                            <p style={{color: "grey"}}>По умолчанию Название квадранта: {adminMatrix[index].matrix_name}</p>
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="field-label">Описание</Form.Label>
                                            <Form.Control
                                            className="mt-3 custom-input"
                                                as="textarea"
                                                rows={3}
                                                name={"description"}
                                                value={cell.description}
                                                onChange={(e) => handleChange(e, index)}
                                                placeholder="Введите описание"
                                            />
                                            <p style={{color: "grey"}}>По умолчанию Описание: {adminMatrix[index].description}</p>
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="matrix-field-label">Цвет квадранта</Form.Label>
                                            <div className="color-picker-container">
                                                <Form.Control
                                                    type="color"
                                                    name={"color"}
                                                    value={cell.color}
                                                    onChange={(e) => handleChange(e, index)}
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
                                        <p style={{color: "grey"}}>По умолчанию Цвет квадранта: {adminMatrix[index].color}</p> 
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
                {error && <div className="error-message">{error}</div>}
            </Form>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={closeModal}>Отмена</Button>
            <Button variant="primary" onClick={handleSaveMatrix}>Сохранить</Button>
        </Modal.Footer>
    </Modal>
) : null}

{modalType === 'yourStatus_modal' ? (
    <Modal show={showModal} onHide={closeModal} centered size="lg">
        <Modal.Header closeButton>
            <Modal.Title className="h1-prof">Настройки статусов задачи</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form>
                {error && <div className="error-message">{error}</div>}
                <div className="matrix-edit-grid mb-4">
                    {formData && Array.isArray(formData) && 
                        formData
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
                                                onChange={(e) => handleChange(e, index)}
                                                placeholder="Введите название"
                                            />
                                            <p style={{color: "grey"}}>По умолчанию Название статуса: {adminStatus[index].status_name}</p>
                                        </Form.Group>
                                        {user.role === 'admin' && yourUser.note === 'Администратор системы' && (
                                            <Form.Group className="mb-3">
                                                <Form.Label className="field-label">Системный код</Form.Label><br/>
                                                <Form.Control
                                                    className="mt-3 custom-input"
                                                        type="text"
                                                        name="system_code"
                                                        value={element.system_code}
                                                        onChange={(e) => handleChange(e, index)}
                                                        readOnly
                                                    />
                                                </Form.Group>
                                        )}
                                </div>
                            ))
                    }
                </div>
            </Form>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={closeModal}>Отмена</Button>
            <Button variant="primary" onClick={handleSaveStatus}>Сохранить</Button>
        </Modal.Footer>
    </Modal>
) : null}
{modalType === 'executionStatus_modal' ? (
    <Modal show={showModal} onHide={closeModal} centered size="lg">
        <Modal.Header closeButton>
            <Modal.Title className="h1-prof">Настройки статусов выполнения</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form>
                {error && <div className="error-message">{error}</div>}
                <p>При изменении названий типов поторений обращайте внимание на текущий смысл названия!</p>
                <div className="matrix-edit-grid mb-4">
                    {formData && Array.isArray(formData) && 
                        formData
                        .sort((a, b) => a.id - b.id)
                            .map((element, index) => (
                                <div>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="field-label">Название статуса</Form.Label>
                                            <Form.Control
                                            className="mt-3 custom-input"
                                                type="text"
                                                name="exec_status_name"
                                                value={element.exec_status_name}
                                                onChange={(e) => handleChange(e, index)}
                                                placeholder="Введите название"
                                            />
                                        </Form.Group>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="field-label">Системный код</Form.Label><br/>
                                                <Form.Control
                                                    className="mt-3 custom-input"
                                                        type="text"
                                                        name="code"
                                                        value={element.code}
                                                        onChange={(e) => handleChange(e, index)}
                                                        readOnly
                                                    />
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="field-label">Цвет</Form.Label><br/>
                                                <Form.Control
                                                    className="color-picker"
                                                    type="color"
                                                    name="exec_color"
                                                    value={element.exec_color}
                                                    onChange={(e) => handleChange(e, index)}
                                                    title="Выберите цвет"
                                                    />
                                        </Form.Group>                                        
                                </div>
                            ))
                    }
                </div>
            </Form>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={closeModal}>Отмена</Button>
            <Button variant="primary" onClick={handleSaveExecutionStatus}>Сохранить</Button>
        </Modal.Footer>
    </Modal>
) : null}
{modalType === 'repeatType' ? (
    <Modal show={showModal} onHide={closeModal} centered size="lg">
        <Modal.Header closeButton>
            <Modal.Title className="h1-prof">Редактирование типов повторений</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form>
                {error && <div className="error-message">{error}</div>}
                <p>При изменении названий типов поторений обращайте внимание на текущий смысл названия!</p>
                <div className="matrix-edit-grid mb-4">
                    {formData && Array.isArray(formData) && 
                        formData
                        .sort((a, b) => a.id - b.id)
                            .map((element, index) => (
                                <div>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="field-label">Название типа</Form.Label>
                                            <Form.Control
                                            className="mt-3 custom-input"
                                                type="text"
                                                name="type_name"
                                                value={element.type_name}
                                                onChange={(e) => handleChange(e, index)}
                                                placeholder="Введите название"
                                            />
                                        </Form.Group>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="field-label">Описание</Form.Label><br/>
                                                <Form.Control
                                                    className="mt-3 custom-input"
                                                        type="text"
                                                        name="description"
                                                        value={element.description}
                                                        onChange={(e) => handleChange(e, index)}
                                                    />
                                                </Form.Group>
                                </div>
                            ))
                    }
                </div>
            </Form>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={closeModal}>Отмена</Button>
            <Button variant="primary" onClick={handleSaveRepeatType}>Сохранить</Button>
        </Modal.Footer>
    </Modal>
) : null}
{modalType === 'newStatus_modal' ? (
    <Modal show={showModal} onHide={closeModal} centered size="lg">
        <Modal.Header closeButton>
            <Modal.Title className="h1-prof">Добавление статуса</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form>
                {error && <div className="error-message">{error}</div>}
                                        <Form.Group className="mb-3">
                                            <Form.Label className="field-label">Название статуса</Form.Label>
                                            <Form.Control
                                            className="mt-3 custom-input"
                                                type="text"
                                                name="status_name"
                                                value={formData.status_name  || ''}
                                                onChange={handleChange}
                                                placeholder="Введите название"
                                            />
                                            <p style={{color: "grey"}}>Следующие коды уже есть в базе данных</p>
                                            {adminStatus && Array.isArray(adminStatus) && 
                                            adminStatus.sort((a, b) => a.id - b.id).map((element, index) => (
                                            <p style={{color: "grey"}}>{element.system_code}</p>
                                            ))}
                                        </Form.Group>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="field-label">Системный код</Form.Label><br/>
                                                <Form.Control
                                                    className="mt-3 custom-input"
                                                        type="text"
                                                        name="system_code"
                                                        value={formData.system_code  || ''}
                                                        onChange={handleChange}
                                                        placeholder="Введите системный код"
                                                    />
                                                </Form.Group>
                                            <p>Будьте аккуратны при добавлении статуса. Системный код изменить будет нельзя, и удалить статус тоже будет нельзя</p>   
            </Form>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={closeModal}>Отмена</Button>
            <Button variant="primary" onClick={handleAddStatus}>Сохранить</Button>
        </Modal.Footer>
    </Modal>
) : null}
{modalType === 'newExecutionStatus_modal' ? (
    <Modal show={showModal} onHide={closeModal} centered size="lg">
        <Modal.Header closeButton>
            <Modal.Title className="h1-prof">Добавление статуса выполнения</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form>
                {error && <div className="error-message">{error}</div>}
                                        <Form.Group className="mb-3">
                                            <Form.Label className="field-label">Название статуса</Form.Label>
                                            <Form.Control
                                            className="mt-3 custom-input"
                                                type="text"
                                                name="exec_status_name"
                                                value={formData.exec_status_name  || ''}
                                                onChange={handleChange}
                                                placeholder="Введите название"
                                            />
                                            <p style={{color: "grey"}}>Следующие коды уже есть в базе данных</p>
                                            {executionStatus && Array.isArray(executionStatus) && 
                                            executionStatus.sort((a, b) => a.id - b.id).map((element, index) => (
                                            <p style={{color: "grey"}}>{element.code}</p>
                                            ))}
                                        </Form.Group>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="field-label">Системный код</Form.Label><br/>
                                                <Form.Control
                                                    className="mt-3 custom-input"
                                                        type="text"
                                                        name="code"
                                                        value={formData.code  || ''}
                                                        onChange={handleChange}
                                                        placeholder="Введите системный код"
                                                    />
                                        </Form.Group>
                                            <p>Будьте аккуратны при добавлении статуса. Системный код изменить будет нельзя, и удалить статус тоже будет нельзя</p>   
                                        <Form.Group className="mb-3">
                                            <Form.Label className="field-label">Цвет</Form.Label><br/>
                                                <Form.Control
                                                    className="color-picker"
                                                    type="color"
                                                    name="exec_color"
                                                    value={formData.exec_color}
                                                    onChange={handleChange}
                                                    title="Выберите цвет"
                                                    />
                                        </Form.Group> 
            </Form>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={closeModal}>Отмена</Button>
            <Button variant="primary" onClick={handleAddExecutionStatus}>Сохранить</Button>
        </Modal.Footer>
    </Modal>
) : null}
            <div className="back-button-container">
                <button onClick={() => navigate(-1)} className="back-button">
                <img src={backIcon} className="back-icon"/>Назад</button>
            </div>
        <div className="profile-header">
                <h1 className="h1-prof">Информация о пользователе</h1>
        </div>
        <div className="two-column-layout">  
                <div className="profile-section">
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

        {/* Настройки помидорок */}
        <div className="profile-section">
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
        <div className="profile-header">
            <h2 className="section-title">Настройка матрицы</h2>
        </div>
        <div className="matrix-settings-section">
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
        <div className="profile-header">
            <h2 className="section-title">Настройка статусов</h2>
        </div>
        {user.role === 'admin' && yourUser?.note === 'Администратор системы' && (
        <div className="text-end mb-3">
                <Button variant="primary" style={{height: '60px'}} onClick={() => openModal(null, 'newStatus_modal')}>Добавить статус</Button>
        </div>
        )}
        <div className="status-grid">
            {error && <div className="error-message">{error}</div>}
                {yourStatus && Array.isArray(yourStatus) && yourStatus.map((element, index) => (
                    <div className="profile-field">
                        <span className="field-label">{index+1}. Название статуса</span>                        
                        <span className="field-value">{element.status_name}</span>                  
                    </div>                   
                ))}
            <Button variant="outline-primary" className="edit-btn" onClick={() => openModal(yourStatus, 'yourStatus_modal')}>Редактировать</Button>
        </div>
        {user.role === 'admin' && (<>
            <div className="profile-header">
                <h2 className="section-title">Настройка статусов выполнения</h2>
            </div>
            {user.role === 'admin' && yourUser?.note === 'Администратор системы' && (
            <div className="text-end mb-3">
                    <Button variant="primary" style={{height: '60px'}} onClick={() => openModal(null, 'newExecutionStatus_modal')}>Добавить статус выполнения</Button>
            </div>
            )}
            <div className="status-grid">
                {error && <div className="error-message">{error}</div>}
                    {executionStatus && Array.isArray(executionStatus) && executionStatus.map((element, index) => (
                        <div className="profile-field" style={{borderTop: `8px solid ${element.exec_color}`}}>
                            <span className="field-label">{index+1}. Название статуса</span>                        
                            <span className="field-value">{element.exec_status_name}</span>                  
                        </div>                   
                    ))}
                <Button variant="outline-primary" className="edit-btn" onClick={() => openModal(executionStatus, 'executionStatus_modal')}>Редактировать</Button>
            </div>
            </>)}
        {user.role === 'admin' && (<>
        <div className="profile-header">
            <h2 className="section-title">Настройка типов повторений</h2>
        </div>
        <div className="status-grid">
            {error && <div className="error-message">{error}</div>}
                {repeatType && Array.isArray(repeatType) && repeatType.map((element) => (
                    <div className="profile-field">
                        <span className="field-label">Название типа</span>                        
                        <span className="field-value">{element.type_name}</span>                  
                    </div>                   
                ))}
            <Button variant="outline-primary" className="edit-btn" onClick={() => openModal(repeatType, 'repeatType')}>Редактировать</Button>
        </div></>)}
    </div>
);
});

export default AppProfile;