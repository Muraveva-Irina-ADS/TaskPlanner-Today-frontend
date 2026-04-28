import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import {get_tasks, get_dates_stages_history, get_export_date_from_dates_tasks_history, get_profile_settings_email} from "../../api/commonApi";
import { observer } from "mobx-react-lite";
import backIcon from '../../images/назад.png';
import { Context } from '../../index';
import NavBar from "../../components/NavBar";
import { Button, Form, InputGroup } from 'react-bootstrap';
import './Calendar.css';
import '../../styles/common.css'
import { useNavigate } from "react-router-dom";
import ModalStr from '../../components/ModalStructure';
import HelpTip from '../../components/HelpTip';
import toast from 'react-hot-toast';

const AppCalendar = observer(() => {
    const { user } = useContext(Context);
    const location = useLocation();
    const navigate = useNavigate();
    const [view, setView] = useState('day');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [tasks, setTasks] = useState([]);
    const [yourSettings, setYourSettings] = useState();
    const [dates_stages_history, setDatesStagesHistory] = useState([]);
    const [groupBy, setGroupBy] = useState('none');
    const [error, setError] = useState('');
    const [dateInput, setDateInput] = useState('');
    const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    const [lastExportDate, setLastExportDate] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({});
    const [archiveRange, setArchiveRange] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState(null);

    // Восстанавление состояний при возврате
    useEffect(() => {
        if (location.state?.returnDate) {
            setCurrentDate(new Date(location.state.returnDate));
            setView(location.state.returnView || 'day');
            setGroupBy(location.state.returnGroupBy || 'none');
            setSelectedProject(location.state.selectedProject || '');
            setSelectedStatus(location.state.selectedStatus || '');
        }
    }, [location.state]);

    // Обновление поля ввода при изменении даты
    useEffect(() => {
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        setDateInput(`${year}-${month}-${day}`);
    }, [currentDate]);

    const getTasks = async () => {
        try {
            const tasksData = await get_tasks();
            setTasks(tasksData);
        } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
        }
    };
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
    const getDatesStagesHistory = async () => {
        try {
            if (!formData.archiveStartDate || !formData.archiveEndDate) {
                setError('Пожалуйста, заполните начальную и конечную даты');
                return;
            }
            const startDate = new Date(formData.archiveStartDate);
            const endDate = new Date(formData.archiveEndDate);
            const exportDate = new Date(lastExportDate);
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(0, 0, 0, 0);
            exportDate.setHours(0, 0, 0, 0);
            if (startDate > endDate) {
                setError('Начальная дата не может быть позже конечной даты');
                return;
            }
            if (endDate > exportDate || startDate > exportDate) {
                setError(`Введенная дата должна быть раньше даты последней выгрузки (${exportDate.toLocaleDateString('ru-RU')})`);
                return;
            }
            const historyDates = await get_dates_stages_history(formData.archiveStartDate, formData.archiveEndDate);
            setDatesStagesHistory(historyDates);
            setTasks(prevTasks => [...historyDates, ...prevTasks]);
            if (historyDates) {
                const newRange = {startDate: formData.archiveStartDate, endDate: formData.archiveEndDate};
                setArchiveRange(prev => [...prev, newRange]);
                toast.success('Данные получены');
                closeModal();
            }
        } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
        }
    };
    const get_exportDateTasks = async () => {
        try {
            let data;
            data = await get_export_date_from_dates_tasks_history();
            if (data && data[0].last_export_date) {
                const date = new Date(data[0].last_export_date);
                const formattedDate = date.toLocaleDateString('en-CA');
                setLastExportDate(formattedDate);
            }
            else {
                if (user.role === 'admin')
                    setError('Данные в исторической таблице сроков задач не найдены');
                setLastExportDate('1970-01-01');
            }
          } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setLastExportDate('1970-01-01');
            setError(message);
          }
    }; 
    useEffect(() => {
        getTasks();
        get_exportDateTasks();
        getYourSettings();
    }, []);

    const handleDateInputChange = (e) => {setDateInput(e.target.value);};

    const formatDateForComparison = (date) => {
        if (!date) return '';
        if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
            return date;
        }
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const getDays = () => {
        const days = [];
        const today = new Date(currentDate);
        
        switch(view) {
            case 'day':
                days.push(new Date(today));
                break;
            case 'week':
                const startOfWeek = new Date(today);
                startOfWeek.setDate(today.getDate() - today.getDay() + 1);
                for (let i = 0; i < 7; i++) {
                    const day = new Date(startOfWeek);
                    day.setDate(startOfWeek.getDate() + i);
                    days.push(day);
                }
                break;
            case 'month':
                const year = today.getFullYear();
                const month = today.getMonth();
                const firstDay = new Date(year, month, 1);
                const lastDay = new Date(year, month + 1, 0);
                const firstDayOfWeek = firstDay.getDay() || 7;
                const prevMonthDays = firstDayOfWeek - 1;
                for (let i = prevMonthDays; i > 0; i--) {
                    const prevDate = new Date(year, month, 1 - i);
                    days.push(prevDate);
                }
                for (let d = 1; d <= lastDay.getDate(); d++) {
                    days.push(new Date(year, month, d));
                }
                const totalDays = days.length;
                const remainingDays = 42 - totalDays;
                for (let i = 1; i <= remainingDays; i++) {
                    const nextDate = new Date(year, month + 1, i);
                    days.push(nextDate);
                }
                break;
        }
        return days;
    };

    // Получение задач для конкретной даты
    const getTasksForDate = (date) => {
        if (!tasks || tasks.length === 0) return [];
        const tasksForDate = tasks.filter(task => {
            if (task.execution_date)
                return formatDateForComparison(task.execution_date) === formatDateForComparison(date);
            return false;
        });
        return tasksForDate;
    };

    // Группировка задач
    const groupTasks = (tasksForDate) => {
        if (groupBy === 'none') return { 'Задачи': tasksForDate };
        if (!tasksForDate.length) return {};
        
        const grouped = {};
        tasksForDate.forEach(task => {
            let groupKey;
            switch(groupBy) {
                case 'project':
                    groupKey = task.project_name || 'Без проекта';
                    break;
                case 'status':
                    groupKey = task.status_name || 'Без статуса';
                    break;
                case 'matrix':
                    groupKey = task.matrix_name || 'Без матрицы';
                    break;
                default:
                    groupKey = 'Задачи';
            }
            if (!grouped[groupKey]) {
                grouped[groupKey] = [];
            }
            grouped[groupKey].push(task);
        });
        
        return grouped;
    };

    // Навигация по датам
    const navigateDate = (direction) => {
        const newDate = new Date(currentDate);
        
        switch(view) {
            case 'day':
                newDate.setDate(currentDate.getDate() + direction);
                break;
            case 'week':
                newDate.setDate(currentDate.getDate() + direction * 7);
                break;
            case 'month':
                newDate.setMonth(currentDate.getMonth() + direction);
                break;
        }
        
        setCurrentDate(newDate);
    };
    const isDateValid = (dateToCheck) => {
        const exportDate = new Date(lastExportDate);
        exportDate.setHours(0, 0, 0, 0);
        
        const checkDate = new Date(dateToCheck);
        checkDate.setHours(0, 0, 0, 0);
        if (archiveRange.length > 0) {
            for (const range of archiveRange) {
                const rangeStart = new Date(range.startDate);
                const rangeEnd = new Date(range.endDate);
                rangeStart.setHours(0, 0, 0, 0);
                rangeEnd.setHours(0, 0, 0, 0);
                if (checkDate >= rangeStart && checkDate <= rangeEnd) {
                    return true;
                }
            }
        }
        switch(view) {
            case 'day':
                return checkDate >= exportDate;
            case 'week':
                const startOfWeek = new Date(dateToCheck);
                startOfWeek.setDate(checkDate.getDate() - checkDate.getDay() + 1);
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6);
                return endOfWeek >= exportDate;
            case 'month':
                const monthEnd = new Date(checkDate.getFullYear(), checkDate.getMonth() + 1, 0);
                monthEnd.setHours(0, 0, 0, 0);
                return monthEnd >= exportDate;
            default:
                return checkDate >= exportDate;
        }
    };
    const goToDate = () => {
        const date = new Date(dateInput);
        if (!isNaN(date.getTime())) {
            if (!isDateValid(date)) {
                openModal();
                const year = currentDate.getFullYear();
                const month = String(currentDate.getMonth() + 1).padStart(2, '0');
                const day = String(currentDate.getDate()).padStart(2, '0');
                setDateInput(`${year}-${month}-${day}`);
            } else {
                setCurrentDate(date);
            }
        }
    };
    const goToDateBack = () => {
        const newDate = new Date(currentDate);
        switch(view) {
            case 'day':
                newDate.setDate(currentDate.getDate() - 1);
                break;
            case 'week':
                newDate.setDate(currentDate.getDate() - 7);
                break;
            case 'month':
                newDate.setMonth(currentDate.getMonth() - 1);
                break;
            default:
                newDate.setDate(currentDate.getDate() - 1);
        }
        if (!isDateValid(newDate)) {
            if (dates_stages_history.length <= 0)
                openModal();
            else
                alert('Перейдите с помощью ввода даты в нужный период и затем используйте стрелку в пределах этого диапазона');
        } else {
            setCurrentDate(newDate);
        }
    };
    const getWeekdayName = (date) => {
        if (!date) return '';
        const dayIndex = date.getDay();
        const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1;
        return weekdays[adjustedIndex];
    };
    const openModal = () => {
        setFormData([]);      
        setShowModal(true);
        setError('');
    };
    
    const closeModal = () => {
        setShowModal(false);
        setError('');
    };
    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };
    // Форматирование заголовка
    const getHeaderText = () => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        
        switch(view) {
            case 'day':
                return currentDate.toLocaleDateString('ru-RU', options);
            case 'week': {
                const startOfWeek = new Date(currentDate);
                startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1);
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6);
                
                return `${startOfWeek.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })} - ${endOfWeek.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}`;
            }
            case 'month':
                return currentDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
        }
    };
    
    const days = getDays();
    const today = new Date();

    const handleTaskClick = (task, date) => {
        if (lastExportDate && new Date(lastExportDate) >= new Date(task.execution_date)) {
            alert('Нельзя перейти к задаче, так как данные за эту дату были выгружены');
            return;
        }
        navigate(`/project/${task.project_id}/task/${task.task_id}`, { 
            state: { returnTo: 'calendar', returnDate: date, returnView: view, returnGroupBy: groupBy, returnIsNeedAllTasks: false, selectedProject: selectedProject, selectedStatus: selectedStatus}
        });
    }
    return (
        <div className="calendar-wrapper">
            <NavBar />
            <div className="back-button-container">
                <button onClick={() => navigate(-1)} className="back-button">
                <img src={backIcon} className="back-icon"/>Назад</button>
            </div>
            <ModalStr show={showModal} onHide={closeModal} modalType={'history_dates_tasks'} title={'Получение архивных данных'}
                        formData={formData} onChange={handleChange} onSave={getDatesStagesHistory} error={error} isNew={true}
                        fields={['archiveStartDate', 'archiveEndDate']}/>
            <div className="calendar-header">
                <div className="calendar-nav">
                    <Button variant="outline-primary" onClick={() => goToDateBack()}>←</Button>
                    <h2 className="calendar-title">{getHeaderText()}</h2>
                    <Button variant="outline-primary" onClick={() => navigateDate(1)}>→</Button>
                </div>
                <div className="calendar-date-picker">
                    <InputGroup style={{ width: '250px' }}>
                        <Form.Control type="date" value={dateInput} onChange={handleDateInputChange}/>
                        <Button variant="primary" onClick={goToDate}>Перейти</Button>
                    </InputGroup>
                </div>
                {dates_stages_history.length > 0 && (
                    <Button variant="primary" onClick={() => openModal()}>Получить еще архивные данные</Button>
                )}
                
                <div className="calendar-view-selector">
                    <Form.Select value={view} onChange={(e) => setView(e.target.value)}>
                        <option value="day">День</option>
                        <option value="week">Неделя</option>
                        <option value="month">Месяц</option>
                    </Form.Select>
                    
                    <Form.Select value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
                        <option value="none">Без группировки</option>
                        <option value="project">По проектам</option>
                        <option value="status">По статусам</option>
                        <option value="matrix">По матрице</option>
                    </Form.Select>
                    <Form.Select value={selectedProject || ''} onChange={(e) => setSelectedProject(e.target.value || null)}>
                        <option value="">Все проекты</option>
                        {tasks && tasks.length > 0 && Array.from(new Map(tasks
                            .filter(task => task.project_id && task.project_name)
                            .map(task => [task.project_id, {id: task.project_id, name: task.project_name}])
                            ).values())
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map(project => (
                                <option key={project.id} value={project.id}>{project.name}</option>
                            ))}
                    </Form.Select>
                    <Form.Select value={selectedStatus || ''} onChange={(e) => setSelectedStatus(e.target.value || null)}>
                        <option value="">Все статусы</option>
                        {tasks && tasks.length > 0 && Array.from(new Map(tasks
                            .filter(task => task.status_id && task.status_name)
                            .map(task => [task.status_id, {id: task.status_id, name: task.status_name}])
                            ).values())
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map(status => (
                                <option key={status.id} value={status.id}>{status.name}</option>))}
                    </Form.Select>
                </div>

            </div>
            
            <div className={`calendar-grid calendar-${view}`}>
                {(view === 'week' || view === 'month') && (
                    <div className="calendar-weekdays">
                        {weekdays.map((day, index) => (<div key={index} className="weekday">{day}</div>))}
                    </div>
                )}
                {view === 'day' && (
                    <div className="calendar-weekdays">
                        <div className="weekday">{getWeekdayName(currentDate)}</div>
                    </div>
                )}
                
                <div className={`calendar-days ${view}`}>
                    {days.map((date, index) => {
                        const isToday = formatDateForComparison(date) === formatDateForComparison(today);
                        const isCurrentMonth = view === 'month' && date.getMonth() === currentDate.getMonth();
                        const tasksForDate = getTasksForDate(date);
                        const groupedTasks = groupTasks(tasksForDate);
                        
                        return (
                            <div key={index} 
                                className={`calendar-day ${isToday ? 'today' : ''} ${!isCurrentMonth && view === 'month' ? 'other-month' : ''}`}
                            >
                                <div className="day-header" style={{ position: 'relative' }}>
                                {view === 'day' && (<HelpTip>
                                    количество задач на этот день / лимит задач из настроек профиля
                                </HelpTip>)}
                                    <span className="day-number" title="Число">{date.getDate()}</span>
                                    {tasksForDate.length >= 0 && yourSettings && (
                                        <span 
                                        className={`tasks-count ${
                                            tasksForDate.length < yourSettings.limit_tasks ? 'normal' :
                                            tasksForDate.length === yourSettings.limit_tasks ? 'warning' : 'danger'
                                        }`}
                                        title={`${tasksForDate.length} из ${yourSettings.limit_tasks} задач`}
                                    >
                                        {tasksForDate.length}/{yourSettings.limit_tasks}
                                    </span>)}
                                </div>
                                
                                <div className="tasks-list">
                                    {Object.entries(groupedTasks).map(([groupName, groupTasks]) => (
                                        <div key={groupName} className="task-group">
                                            {groupBy !== 'none' && (
                                                <div className="task-group-header">
                                                    <span className="task-group-name">{groupName}</span>
                                                    <span className="task-group-count">{groupTasks.length}</span>
                                                </div>
                                            )}
                                            {groupTasks
                                            .filter(task => !selectedProject || Number(task.project_id) === Number(selectedProject))
                                            .filter(task => !selectedStatus || Number(task.status_id) === Number(selectedStatus))
                                            .map(task => {
                                            return (
                                                <div key={task.id || Math.random()} 
                                                    className="calendar-task"
                                                    style={{ 
                                                        borderLeft: `5px solid ${task.project_color || '#ccc'}`,
                                                        background: task.system_code === 'завершение' ? '#c8f0c9' : '#f8f9fa'
                                                    }}
                                                    onClick={() => handleTaskClick(task, date)}
                                                    title={task.system_code === 'завершение' ? 'Задача завершена' : ''}
                                                >
                                                    <div className="task-indicators">
                                                        {task.matrix_color && (
                                                            <span className="task-matrix-indicator" 
                                                                style={{ backgroundColor: task.matrix_color || 'red' }}
                                                                title={task.matrix_name || 'Матрица'}
                                                            ></span>
                                                        )}
                                                        <span className={`task-status-badge`} style={{backgroundColor: task.exec_color}} title = "Статус выполнения">{task.exec_status_name}</span>
                                                    </div>
                                                    
                                                    <span className="task-name-tag" title="Название задачи">{task.task_name}</span>
                                                    {task.project_name && groupBy !== 'project' && (
                                                        <span className="task-project-tag" style={{ color: task.project_color }}
                                                        title="Название проекта">{task.project_name}</span>
                                                    )}
                                                    {task.status_name && groupBy !== 'status' && (
                                                        <span className="task-project-tag" title="Статус задачи">{task.status_name}</span>
                                                    )}                                                 
                                                </div>
                                            )})}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            
            {error && <div className="error-message">{error}</div>}
        </div>
    );
});

export default AppCalendar;