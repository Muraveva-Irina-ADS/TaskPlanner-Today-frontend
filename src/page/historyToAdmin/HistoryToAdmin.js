import React, { useState, useEffect } from 'react';
import {get_datesTasks, get_export_date_from_dates_tasks_history, post_dates_tasks_history, get_pomodoro, get_export_date_from_pomodoro_history,
    post_pomodoro_history, get_datesStages } from "../../api/commonApi";
import { useNavigate } from 'react-router-dom';
import backIcon from '../../images/назад.png'; 
import NavBar from '../../components/NavBar';
import './HistoryToAdmin.css';
import '../../styles/common.css'
import Navigate from '../../components/Navigate';
import { Button, Form, InputGroup, Table } from 'react-bootstrap';
import ModalStr from '../../components/ModalStructure';

const AppHistoryToAdmin = () => {
    const navigate = useNavigate();
    const [last_export_date_dates_tasks, setLlastExportDate_datesTasks] = useState(''); 
    const [last_export_date_pomodoro, setLlastExportDate_pomodoro] = useState('');
    const [dateInput, setDateInput] = useState('');
    const [dateInputPomodoro, setDateInputPomodoro] = useState('');    
    const [error, setError] = useState('');
    const [datesTasks, setDatesTasks] = useState([]);
    const [datesStages, setDatesStages] = useState([]);    
    const [pomodoro, setPomodoro] = useState([]);    
    const [showModal, setShowModal] = useState(false);
    const [modalData, setModalData] = useState([]);
    const [field, setField] = useState('');

    //Получение информации о сроках выполнения задач всех пользователей
    const getDatesTasks = async () => {
        try {
            let data;
            data = await get_datesTasks();
            if (data) {
                if (Array.isArray(data)) {
                    setDatesTasks(data);
                } else {
                    setDatesTasks([data]);
                }
            }
        } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
    }};
    //Получение информации о сроках выполнения этапов всех пользователей
    const getDatesStages = async () => {
        try {
            let data;
            data = await get_datesStages();
            if (data) {
                if (Array.isArray(data)) {
                    setDatesStages(data);
                } else {
                    setDatesStages([data]);
                }
            }
        } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
    }};
    //Получение информации о выполненных помидорах всех пользователей
    const getPomodoro = async () => {
        try {
            let data;
            data = await get_pomodoro();
            if (data) {
                if (Array.isArray(data)) {
                    setPomodoro(data);
                } else {
                    setPomodoro([data]);
                }
            }
        } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
    }};
    //Получение информации о дате последней выгрузки данных из таблицы dates_tasks_history 
    const get_exportDateTasks = async () => {
        try {
            let data;
            data = await get_export_date_from_dates_tasks_history();
            if (data && data[0].last_export_date) {
                const date = new Date(data[0].last_export_date);
                const formattedDate = date.toLocaleDateString('ru-RU');
                setLlastExportDate_datesTasks(formattedDate);
            } else {
                setError('Данные в исторической таблице сроков задач не найдены');
                setLlastExportDate_datesTasks(`'Дата не найдена'`);
            }
        } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setLlastExportDate_datesTasks(`'Дата не найдена'`);
            setError(message);
    }};
    //Получение информации о дате последней выгрузки данных из таблицы pomodoro_history
    const get_exportPomodoro = async () => {
        try {
            let data;
            data = await get_export_date_from_pomodoro_history();
            if (data && data[0].last_export_date) {
                const date = new Date(data[0].last_export_date);
                const formattedDate = date.toLocaleDateString('ru-RU');
                setLlastExportDate_pomodoro(formattedDate);
            } else {
                setError('Данные в исторической таблице сроков Pomodoro не найдены');
                setLlastExportDate_pomodoro(`'Дата не найдена'`);
            }
        } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setLlastExportDate_pomodoro(`'Дата не найдена'`);
            setError(message);
    }}; 
    //Хук useEffect, в котором вызываются функции для получения данных из базы данных с помощью API-функций
    useEffect(() => {
        getDatesTasks();
        get_exportDateTasks();
        getPomodoro();
        get_exportPomodoro();    
        getDatesStages();
    }, []);
    //Функция для представления даты в формате YYYY-MM-DD
    const formatDateForSQL = (dateValue) => {
        if (!dateValue) return null;
        const date = new Date(dateValue);
        if (isNaN(date)) return null;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    //Функция для представления даты в формате DD.MM.YYYY
    const formatDateWithDots = (dateStr) => {
        const [year, month, day] = dateStr.split('-');
        return `${day}.${month}.${year}`;
    };
    //Валидация введённой даты, затем открытие модальное окно с предупреждением перед выгрузкой данных в историю (в dates_tasks_history)
    const uploadingDataDatesTasks = async () => {
        try {
            if (!dateInput) {
                setError('Поле даты должно быть заполнено');
                return;
            }     
            const today = new Date().toISOString().split('T')[0];
            if (dateInput > today) {
                setError('Дата не может быть позже сегодняшнего дня');
                return;
            }     
            if (!datesTasks || datesTasks.length === 0) {
                setError('Нет данных для сравнения, таблица пустая, нет данных для выгрузки');
                return;
            }
            if (formatDateForSQL(datesTasks[0].execution_date) > formatDateForSQL(new Date())) {
                setError(`Самая ранняя дата в таблице сроков задач позднее сегодняшней, выгружать такие данные нерационально`);
                return;
            }       
            if (formatDateForSQL(dateInput) < formatDateForSQL(datesTasks[0].execution_date)) {
                setError(`Дата должна быть не ранее ${new Date(datesTasks[0].execution_date).toLocaleDateString('ru-RU')}, так как это самая ранняя дата в таблице сроков задач`);
                return;
            }            
            const hasCompletedToday = datesTasks.some(task => {
                const taskDate = new Date(task.execution_date).toISOString().split('T')[0];
                return taskDate >= formatDateForSQL(datesTasks[0].execution_date) && 
                       taskDate <= formatDateForSQL(dateInput) && 
                       task.code === 'выполнение';
            });
            const datesArray = [{dateInput: new Date(dateInput).toLocaleDateString('ru-RU'), erlDate: new Date(datesTasks[0].execution_date).toLocaleDateString('ru-RU'), hasCompletedToday: hasCompletedToday}];
            setModalData(datesArray);
            setField('warning_dates_tasks');
            setError('');
            setShowModal(true);
        } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
    }}; 
    //Валидация введённой даты, затем открытие модальное окно с предупреждением перед выгрузкой данных в историю (в pomodoro_history)
    const uploadingDataPomodoro = async () => {
        try {
            if (!dateInputPomodoro) {
                setError('Поле даты должно быть заполнено');
                return;
            }     
            const today = new Date().toISOString().split('T')[0];
            if (dateInputPomodoro > today) {
                setError('Дата не может быть позже сегодняшнего дня');
                return;
            }     
            if (!pomodoro || pomodoro.length === 0) {
                setError('Нет данных для сравнения, таблица пустая, нет данных для выгрузки');
                return;
            }
            const earliestExecutionDate = new Date(pomodoro[0].pomodoro_date);
            const correctedEarliestDate = new Date(earliestExecutionDate);
            correctedEarliestDate.setDate(correctedEarliestDate.getDate() + 1);
            const userDate = new Date(dateInputPomodoro + 'T24:00:00');
            const correctedDateStr = correctedEarliestDate.toISOString().split('T')[0];
            const userDateStr = userDate.toISOString().split('T')[0];
            if (correctedDateStr > today) {
                setError(`Самая ранняя дата в таблице позднее сегоднешней, выгружать такие данные нерационально`);
                return;
            }
            if (userDateStr < correctedDateStr) {
                setError(`Дата должна быть не ранее ${formatDateWithDots(correctedDateStr)}, так как это самая ранняя дата в таблице`);
                return;
            }
            const datesArray = [{dateInput: formatDateWithDots(userDateStr), erlDate: formatDateWithDots(correctedDateStr)}];
            setModalData(datesArray);
            setField('warning_pomodoro');
            setError('');
            setShowModal(true);
        } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
    }};
    //Функция закрытия модального окна
    const closeModal = () => {
        setField('');
        setShowModal(false);
    };
    //Возвращает массив заголовков колонок таблиц dates_tasks и dates_stages в зависимости от выбранных пользователем видимых полей   
    const getColumnHeaders = (name) => {
        const headers = [];
        if (name === 'Задача')
            headers.push('Задача');
        else
            headers.push('Этап')
        headers.push('Дата выполнения');
        headers.push('План. время начала');
        headers.push('План. время окончания');
        headers.push('Факт. время начала');
        headers.push('Факт. время окончания');
        headers.push('Статус выполнения');
        return headers;
    };
    //Возвращает массив ключей для доступа к данным в таблиц dates_tasks и dates_stages, соответствующих выбранным видимым колонкам
    const getColumnKeys = (name) => {
        const keys = []; 
        if (name === 'Задача')
            keys.push('task_name');
        else
            keys.push('stage_name')        
        keys.push('execution_date');
        keys.push('planned_start_time');
        keys.push('planned_end_time');
        keys.push('actual_start_time');
        keys.push('actual_end_time');
        keys.push('exec_status_name');
        return keys;
    };
    //Возвращает массив заголовков колонок таблицы pomodoro в зависимости от выбранных пользователем видимых полей
    const getColumnHeadersPomodoro = () => {
        const headers = [];
        headers.push('Пользователь');
        headers.push('Дата выполнения');
        headers.push('Время начала');
        headers.push('Время окончания');
        headers.push('Длительность помодоро в мин.');        
        headers.push('Остановлен вручную');
        return headers;
    };
    //Возвращает массив ключей для доступа к данным в таблице pomodoro, соответствующих выбранным видимым колонкам
    const getColumnKeysPomodoro = () => {
        const keys = []; 
        keys.push('email');
        keys.push('pomodoro_date');
        keys.push('start_time');
        keys.push('end_time');
        keys.push('duration');
        keys.push('was_interrupted');
        return keys;
    };
    //Форматирует значения некоторых полей и возвращает значение для отображения в таблице
    const getFormattedValue = (value, key, type) => {
        if (type === 'pomodoro') {
            if (key === 'pomodoro_date' && value) 
                return new Date(value).toLocaleDateString('ru-RU');
            if (key.includes('_time') && value) 
                return new Date(value).toLocaleString('ru-RU', {
                    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
                }).replace(',', '');
            if (key === 'was_interrupted') 
                return value ? 'Да' : 'Нет';
        }
        if (key === 'execution_date' && value) 
            return new Date(value).toLocaleDateString('ru-RU');
        return value || '-';
    };
    //Вызов API-функции для перемещенения строк из таблиц dates_tasks и dates_stages в dates_tasks_history и dates_stages_history
    const handleUploading = async() => {
        try {
        let data;
        data = await post_dates_tasks_history(dateInput);
        if (data) {
            alert('Данные выгружены'); 
            getDatesTasks();
            get_exportDateTasks();
            getDatesStages();           
            closeModal();
            setError('')
        }
    } catch (e) {
        console.error('Ошибка при взаимодействии с сервером:', e);
        const message = e.response?.data?.error || 'Произошла ошибка';
        setError(message);
    }};
    //Вызов API-функции для перемещенения строк из таблицы pomodoro в pomodoro_history
    const handleUploadingPomodoro = async() => {
        try {
        let data;
        data = await post_pomodoro_history(dateInputPomodoro);
        if (data) {
            alert('Данные выгружены'); 
            getPomodoro();
            get_exportPomodoro();
            closeModal();
            setError('')
        }
    } catch (e) {
        console.error('Ошибка при взаимодействии с сервером:', e);
        const message = e.response?.data?.error || 'Произошла ошибка';
        setError(message);
    }};
    //Отображение таблицы
    const renderTable = (title, data, getHeadersFunc, getKeysFunc, formatType) => {
        return (<>
            <h2 className="h1-prof">Таблица содержит {data.length} строк</h2>
            <h2 className="h1-prof">Пример данных таблицы {title}</h2>
            <div className="table-horizontal-scroll">
                <Table striped bordered hover responsive className="users-table">
                    {/*Заголовки колонок таблицы*/}
                    <thead>
                        <tr>
                            {getHeadersFunc().map((header, index) => (<th key={index}>{header}</th>))}
                        </tr>
                    </thead>
                    <tbody>
                        {/*Отображение строк с информацией*/}
                        {data.slice(0, 5).map((element) => (
                            <tr key={element.id} className="user-main-row">
                                {getKeysFunc().map((key, colIndex) => (
                                    <td key={colIndex}>
                                        {getFormattedValue(element[key], key, formatType)}
                                        </td>
                                ))}
                            </tr>
                        ))}
                        {data.length === 0 && (
                            <tr>
                                <td colSpan={getHeadersFunc().length} className="text-center">
                                    Нет данных для отображения
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </div>
        </>);
    };
    return (
        <div className="project-wrapper">
            <NavBar />
            <div className="project-layout">
                <Navigate/>
                <div className="projectHistory-content">
                    {/*Кнопка Назад*/}
                    <div className="back-button-container">
                        <button onClick={() => navigate(-1)} className="back-button">
                        <img src={backIcon} className="back-icon"/>Назад</button>
                    </div>
                    {field === 'warning_dates_tasks' && (<ModalStr show={showModal} onHide={closeModal} modalType={''} title={'Предупреждение'}
                                formData={{}} onChange={''} onSave={handleUploading} error={error} isNew={true}
                                fields={[field]} users={modalData}/>)}
                    {field === 'warning_pomodoro' && (<ModalStr show={showModal} onHide={closeModal} modalType={''} title={'Предупреждение'}
                                formData={{}} onChange={''} onSave={handleUploadingPomodoro} error={error} isNew={true}
                                fields={[field]} users={modalData}/>)}                       
                    {/*Заголовок страницы*/}
                    <div className="profile-header">
                        <h1 className="h1-prof">Выгрузка данных в исторические таблицы</h1>
                    </div>
                    {error && <div className="error-message">{error}</div>}
                    <div className="section-select">
                        <h2 className="h1-prof">Таблицы сроков выполнения задач и этапов</h2>
                        <div className="display-tasks">
                            <h2 className="h1-prof">До какого числа выгружать включительно:</h2>
                            {/*Блок для ввода даты*/}
                            <div className="calendar-date-picker">
                                <InputGroup style={{ width: '250px' }}>
                                    <Form.Control type="date" value={dateInput} onChange={(e) => setDateInput(e.target.value)}/>
                                </InputGroup>
                            </div>
                            <div className="text-end mb-3">
                                <Button variant="primary" style={{height: '60px'}} onClick={() => uploadingDataDatesTasks()}>Выгрузить данные таблиц Сроков задач и Сроков этапов</Button>
                            </div>
                        </div>
                        <h2 className="h1-prof">Последний раз данные выгружались за {last_export_date_dates_tasks}</h2>
                        {renderTable('Сроков задач', datesTasks, () => getColumnHeaders('Задача'), () => getColumnKeys('Задача'), 'dates_tasks')}
                        {renderTable('Сроков этапов', datesStages, () => getColumnHeaders('Этап'), () => getColumnKeys('Этап'), 'dates_stages')}
                    </div>
                    {error && <div className="error-message">{error}</div>}
                    <div className="section-select">
                        <h2 className="h1-prof">Таблица Pomodoro и даты их создания</h2>
                        <div className="display-tasks">
                            <h2 className="h1-prof">До какого числа выгружать включительно:</h2>
                            {/*Блок для ввода даты*/}
                            <div className="calendar-date-picker">
                                <InputGroup style={{ width: '250px' }}>
                                    <Form.Control type="date" value={dateInputPomodoro} onChange={(e) => setDateInputPomodoro(e.target.value)}/>
                                </InputGroup>
                            </div>
                            <div className="text-end mb-3">
                                <Button variant="primary" style={{height: '60px'}} onClick={() => uploadingDataPomodoro()}>Выгрузить данные таблицы Pomodoro</Button>
                            </div>
                        </div>
                        <h2 className="h1-prof">Последний раз данные выгружались за {last_export_date_pomodoro}</h2>
                        {renderTable('Pomodoro', pomodoro, () => getColumnHeadersPomodoro(), () => getColumnKeysPomodoro(), 'pomodoro')}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppHistoryToAdmin;