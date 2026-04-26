import React, { useState, useEffect } from 'react';
import { deleteTask, get_tasks_with_user, get_users, task_post, get_profile_matrix_email, get_projects_with_user } from "../../api/commonApi";
import backIcon from '../../images/назад.png'; 
import { observer } from "mobx-react-lite";
import NavBar from "../../components/NavBar";
import { Button, Form, Table, InputGroup, FormControl } from 'react-bootstrap';
import './AllTasks.css';
import '../../styles/common.css'
import { useNavigate } from "react-router-dom";
import ModalStr from '../../components/ModalStructure';
import toast from 'react-hot-toast';

const AppAllTasks = observer(() => {
    const [tasks, setTasks] = useState([]);
    const [matrix, setMatrix] = useState([]);
    const [projects, setProjects] = useState([]);    
    const [showModal, setShowModal] = useState(false);
    const [isNewTask, setIsNewTask] = useState(false);
    const [formData, setFormData] = useState({});
    const [modalType, setModalType] = useState(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [visibleColumns, setVisibleColumns] = useState({
        users_id: true,
        project_id: true,
        task_name: true,
        description: false,
        status_name: true,
        matrix_name: true,
        deadline: false,
        pomodoros_planned: false,
        final_deadline: false,
        pomodoros_spent: false,
        created_at: true,
        repeat_type_name: false,
        number_repeat: false,
        min_time_period_dates_tasks: true,
        max_time_period_dates_tasks: true,
        stage_name: true,
        stage_description: false,
        stage_deadline: false,
        stage_pomodoros_planned: false,
        stage_final_deadline: false,
        stage_pomodoros_spent: false,
        stage_created_at: true,
        min_time_period_dates_stages: true,
        max_time_period_dates_stages: true
    });
    const [filterField, setFilterField] = useState('email');
    const [filterValue, setFilterValue] = useState('');
    const [filteredTasks, setFilteredTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const getProjects = async () => {
        try {
            const projects = await get_projects_with_user();
            setProjects(projects);
        } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
        }
    };
    const getTasks = async () => {
        try {
            const tasksData = await get_tasks_with_user();
            
            // Группировка задач и этапов
            const groupedTasks = {};
            
            tasksData.forEach(row => {
                const taskId = row.id;
                
                if (!groupedTasks[taskId]) {
                    // Создаем объект задачи без этапов
                    groupedTasks[taskId] = {
                        id: row.id,
                        task_name: row.task_name,
                        description: row.description,
                        status_name: row.status_name,
                        matrix_name: row.matrix_name,
                        deadline: row.deadline,
                        pomodoros_planned: row.pomodoros_planned,
                        final_deadline: row.final_deadline,
                        pomodoros_spent: row.pomodoros_spent,
                        created_at: row.created_at,
                        repeat_type_name: row.repeat_type_name,
                        number_repeat: row.number_repeat,
                        users_id: row.users_id,
                        email: row.email,
                        first_name: row.first_name,
                        last_name: row.last_name,
                        project_id: row.project_id,
                        project_name: row.project_name,
                        min_time_period_dates_tasks: row.min_time_period_dates_tasks,
                        max_time_period_dates_tasks: row.max_time_period_dates_tasks,
                        stages: []
                    };
                }
                
                // Если есть этап, добавляем его
                if (row.stage_id) {
                    groupedTasks[taskId].stages.push({
                        id: row.stage_id,
                        stage_name: row.stage_name,
                        stage_description: row.stage_description,
                        stage_deadline: row.stage_deadline,
                        stage_pomodoros_planned: row.stage_pomodoros_planned,
                        stage_final_deadline: row.stage_final_deadline,
                        stage_pomodoros_spent: row.stage_pomodoros_spent,
                        stage_created_at: row.stage_created_at,
                        min_time_period_dates_stages: row.min_time_period_dates_stages,
                        max_time_period_dates_stages: row.max_time_period_dates_stages
                    });
                }
            });
            
            // Преобразуем объект в массив
            const tasksArray = Object.values(groupedTasks);
            setTasks(tasksArray);
            
        } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
        }
    };

    const getUsers = async () => {
        try {
            const usersData = await get_users();
            setUsers(usersData);
        } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
        }
    };

    const getMatrix = async () => {
        try {
            const m = await get_profile_matrix_email();
            setMatrix(m);
            return m;
        } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
        }
    };

    useEffect(() => {
        getTasks();
        getUsers();
        getMatrix();
        getProjects();
    }, []);

    useEffect(() => {
        if (tasks && tasks.length > 0) {
            let filtered = tasks;
            
            if (filterValue.trim() !== '') {
                filtered = tasks.filter(task => {
                    // 1. Проверяем поля самой задачи
                    let fieldValue = task[filterField];
                    if (filterField === 'userEmail') {
                        const userEmail = task.email || 'Неизвестный пользователь';
                        return userEmail.toLowerCase().includes(filterValue.toLowerCase());
                    }
                    if (filterField === 'number_repeat') {
                        const formattedRepeat = formatRepeatDays(task.repeat_type_name, task.number_repeat);
                        return formattedRepeat.toLowerCase().includes(filterValue.toLowerCase());
                    }
                    // Обработка дат в задаче
                    if ((filterField.includes('created_at') && fieldValue) || 
                        (filterField.includes('deadline') && fieldValue) || 
                        (filterField.includes('period') && fieldValue)) {
                        const dateStr = new Date(fieldValue).toLocaleDateString('ru-RU');
                        if (dateStr.toLowerCase().includes(filterValue.toLowerCase())) {
                            return true;
                        }
                    }
                    
                    // Если нашли в задаче - возвращаем true
                    if (fieldValue !== undefined && fieldValue !== null) {
                        if (String(fieldValue).toLowerCase().includes(filterValue.toLowerCase())) {
                            return true;
                        }
                    }
                    
                    // 2. Если поле фильтрации относится к этапам - ищем в этапах
                    if (filterField.startsWith('stage_') && task.stages && task.stages.length > 0) {
                        const stageField = filterField; // stage_name, stage_description и т.д.
                        const foundInStages = task.stages.some(stage => {
                            let stageValue = stage[stageField];
                            
                            // Обработка дат в этапах
                            if ((stageField.includes('created_at') && stageValue) || 
                                (stageField.includes('deadline') && stageValue) || 
                                (stageField.includes('period') && stageValue)) {
                                const dateStr = new Date(stageValue).toLocaleDateString('ru-RU');
                                return dateStr.toLowerCase().includes(filterValue.toLowerCase());
                            }
                            
                            if (stageValue === undefined || stageValue === null) return false;
                            return String(stageValue).toLowerCase().includes(filterValue.toLowerCase());
                        });
                        
                        if (foundInStages) return true;
                    }
                    
                    return false;
                });
            }
            setFilteredTasks(filtered);
        } else {
            setFilteredTasks([]);
        }
    }, [tasks, filterField, filterValue]);

    const openModal = (modalType = null) => {
        setFormData({task_name: '', description: '', matrix_id: matrix[0].id, project_id: projects[0].id});
        setIsNewTask(true);
        setModalType(modalType);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setIsNewTask(false);
        setModalType(null);
        setFormData({})
        setError('');
    };

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        if (type === 'number') {
            setFormData(prev => ({ ...prev, [name]: value === '' ? '' : Number(value) }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
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
        if (visibleColumns.project_id) headers.push('Название проекта');
        if (visibleColumns.task_name) headers.push('Название задачи');
        if (visibleColumns.description) headers.push('Описание задачи');
        if (visibleColumns.status_name) headers.push('Статус задачи');
        if (visibleColumns.matrix_name) headers.push('Матрица');
        if (visibleColumns.deadline) headers.push('Дедлайн задачи');
        if (visibleColumns.pomodoros_planned) headers.push('План. количество помидоров на задачу');
        if (visibleColumns.final_deadline) headers.push('Окончательный дедлайн задачи');
        if (visibleColumns.pomodoros_spent) headers.push('Потраченное количество помидоров на задачу');
        if (visibleColumns.created_at) headers.push('Дата создания задачи');
        if (visibleColumns.repeat_type_name) headers.push('Тип повторения');
        if (visibleColumns.number_repeat) headers.push('Дни повторений');
        if (visibleColumns.min_time_period_dates_tasks) headers.push('Мин. срок выполнения задачи');
        if (visibleColumns.max_time_period_dates_tasks) headers.push('Макс. срок выполнения задачи');
        if (visibleColumns.stage_name) headers.push('Название этапа');
        if (visibleColumns.stage_description) headers.push('Описание этапа');
        if (visibleColumns.stage_deadline) headers.push('Дедлайн этапа');
        if (visibleColumns.stage_pomodoros_planned) headers.push('План. количество помидоров на этап');
        if (visibleColumns.stage_final_deadline) headers.push('Окончательный дедлайн этапа');
        if (visibleColumns.stage_pomodoros_spent) headers.push('Потраченное количество помидоров на этап');
        if (visibleColumns.stage_created_at) headers.push('Дата создания этапа');
        if (visibleColumns.min_time_period_dates_stages) headers.push('Мин. срок выполнения этапа');
        if (visibleColumns.max_time_period_dates_stages) headers.push('Макс. срок выполнения этапа');
        return headers;
    };

    const getTaskColumnKeys = () => {
        const keys = [];
        if (visibleColumns.project_id) keys.push('project_name');
        if (visibleColumns.task_name) keys.push('task_name');
        if (visibleColumns.description) keys.push('description');
        if (visibleColumns.status_name) keys.push('status_name');
        if (visibleColumns.matrix_name) keys.push('matrix_name');
        if (visibleColumns.deadline) keys.push('deadline');
        if (visibleColumns.pomodoros_planned) keys.push('pomodoros_planned');
        if (visibleColumns.final_deadline) keys.push('final_deadline');
        if (visibleColumns.pomodoros_spent) keys.push('pomodoros_spent');
        if (visibleColumns.created_at) keys.push('created_at');
        if (visibleColumns.repeat_type_name) keys.push('repeat_type_name');
        if (visibleColumns.number_repeat) keys.push('number_repeat');
        if (visibleColumns.min_time_period_dates_tasks) keys.push('min_time_period_dates_tasks');
        if (visibleColumns.max_time_period_dates_tasks) keys.push('max_time_period_dates_tasks');
        return keys;
    };

    const getStageColumnKeys = () => {
        const keys = [];
        if (visibleColumns.stage_name) keys.push('stage_name');
        if (visibleColumns.stage_description) keys.push('stage_description');
        if (visibleColumns.stage_deadline) keys.push('stage_deadline');
        if (visibleColumns.stage_pomodoros_planned) keys.push('stage_pomodoros_planned');
        if (visibleColumns.stage_final_deadline) keys.push('stage_final_deadline');
        if (visibleColumns.stage_pomodoros_spent) keys.push('stage_pomodoros_spent');
        if (visibleColumns.stage_created_at) keys.push('stage_created_at');
        if (visibleColumns.min_time_period_dates_stages) keys.push('min_time_period_dates_stages');
        if (visibleColumns.max_time_period_dates_stages) keys.push('max_time_period_dates_stages');
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

    const handleTask = () => {
        if (!formData.task_name || !formData.description) {
            setError('Все поля должны быть заполнены');
            return;
        }
        handleAddTask();
    };

    const handleAddTask = async () => {
        try {
            const data = await task_post(Number(formData.project_id), formData);
            if (data) {
                toast.success('Добавлена задача');
                closeModal();
                getTasks();
            }
        } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
        }
    };

    const handleDeleteTask = async (taskId) => {
        try {
            const data = await deleteTask(taskId);
            if (data) {
                toast.success('Удалена задача');
                getTasks();
            }
        } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
        }
    };

    // Группировка задач по пользователям
    const tasksByUser = filteredTasks.reduce((acc, task) => {
        const userEmail = task.email || 'Неизвестный пользователь';
        if (!acc[userEmail]) {
            acc[userEmail] = {
                userId: task.users_id,
                tasks: []
            };
        }
        // Добавляем userEmail в каждую задачу для фильтрации
        acc[userEmail].tasks.push({
            ...task,
            userEmail: userEmail
        });
        return acc;
    }, {});

    const renderCellValue = (item, key) => {
        let value = item[key];
        if (key === 'number_repeat')
            return formatRepeatDays(item.repeat_type_name, item[key])
        // Специальная обработка для помидоров
        if (key === 'pomodoros_planned' || key === 'stage_pomodoros_planned') {
            if (value === -1 || value === null || value === undefined) return 'Не указано';
            return value;
        }
        
        // Обработка окончательного дедлайна
        if (key === 'final_deadline' || key === 'stage_final_deadline') {
            if (!value) return '';
            const date = new Date(value);
            if (date.getFullYear() === 1900 && date.getMonth() === 0 && date.getDate() === 1) {
                return 'Не закончена';
            }
            return date.toLocaleDateString('ru-RU');
        }
        
        // Обработка дедлайнов
        if (key === 'deadline' || key === 'stage_deadline') {
            if (!value) return '';
            return new Date(value).toLocaleDateString('ru-RU');
        }
        
        // Обработка дат
        if ((key.includes('created_at') || key.includes('period')) && value) {
            return new Date(value).toLocaleDateString('ru-RU');
        }
        
        if (value === undefined || value === null) return '';
        if (Array.isArray(value)) return value.join(', ');
        return String(value);
    };
    const formatRepeatDays = (repeatType, numberRepeat) => {
        if (!numberRepeat || numberRepeat.length === 0 || (numberRepeat.length === 1 && numberRepeat[0] === 0)) return 'Нет';
        
        switch(repeatType) {
            case 'Ежедневно':
                return 'Каждый день';
            case 'Еженедельно':
                const weekdays = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
                return numberRepeat.map(day => weekdays[day-1] || day).join(', ');
            case 'Ежемесячно':
                return numberRepeat.map(day => `${day}-е число`).join(', ');
            case 'Ежегодно':
                return numberRepeat.map(day => `${day} января`).join(', ');
            case 'Раз в N дней':
                return `Каждые ${numberRepeat[0]} дней`;
            default:
                return numberRepeat.join(', ');
        }
    };
    const handleTaskClick = (task) => {
        if (!task.min_time_period_dates_tasks) return alert('Переход невозможен')
        const returnDate = task.min_time_period_dates_tasks ? formatDateForSQL(task.min_time_period_dates_tasks) : new Date();
        navigate(`/project/${task.project_id}/task/${task.id}`, {
            state: {
                returnTo: 'AllTasks',
                returnDate: returnDate
            }
        });
    };
    const handleStageClick = (task, stage) => {
        if (!stage.min_time_period_dates_stages) return alert('Переход невозможен')
        const returnDate = stage.min_time_period_dates_stages
            ? formatDateForSQL(stage.min_time_period_dates_stages)
            : (task.min_time_period_dates_tasks ? formatDateForSQL(task.min_time_period_dates_tasks) : new Date());

        navigate(`/project/${task.project_id}/task/${task.id}/stage/${stage.id}`, {
            state: {
                returnTo: 'AllTasks',
                returnDate: returnDate
            }
        });
    };
    const formatDateForSQL = (dateValue) => {
        if (!dateValue) return null;
        const date = new Date(dateValue);
        if (isNaN(date)) return null;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
    };
    return (
        <div className="app-profile-wrapper">
            <NavBar />
            <div className="back-button-container">
                <button onClick={() => navigate(-1)} className="back-button">
                    <img src={backIcon} className="back-icon" alt="Назад"/>Назад
                </button>
            </div>

            <ModalStr show={showModal} onHide={closeModal} modalType={modalType} title={'Создание задачи'} formData={formData} onChange={handleChange} 
                onSave={handleTask} error={error} isNew={true} fields={['task_name', 'description', 'projects_select']} users={projects}
            />

            <div className="profile-header">
                <h1 className="h1-prof">Управление задачами пользователей</h1>
            </div>

            <div className="text-end mb-3">
                <Button variant="primary" style={{height: '60px'}} onClick={() => openModal('task_modal')}>
                    Добавить задачу
                </Button>
            </div>

            {/* Блок выбора колонок */}
            <div className="columns-selector">
                <div className="profile-header">
                    <h2 className="h1-prof">Выберите колонки для отображения:</h2>
                </div>
                
                <div className="columns-group">
                    <h3 className="columns-group-title">Основные поля задачи</h3>
                    <div className="profile-grid">
                        <Form.Check className="profile-field1" type="checkbox" label="Выделить все" 
                            checked={Object.values(visibleColumns).every(value => value === true)} 
                            onChange={handleSelectAll} />
                        <Form.Check className="profile-field1" type="checkbox" label="Название проекта" 
                            checked={visibleColumns.project_id} onChange={() => handleColumnToggle('project_id')} />
                        <Form.Check className="profile-field1" type="checkbox" label="Название задачи" 
                            checked={visibleColumns.task_name} onChange={() => handleColumnToggle('task_name')} />
                        <Form.Check className="profile-field1" type="checkbox" label="Описание задачи" 
                            checked={visibleColumns.description} onChange={() => handleColumnToggle('description')} />
                        <Form.Check className="profile-field1" type="checkbox" label="Статус задачи" 
                            checked={visibleColumns.status_name} onChange={() => handleColumnToggle('status_name')} />
                        <Form.Check className="profile-field1" type="checkbox" label="Матрица" 
                            checked={visibleColumns.matrix_name} onChange={() => handleColumnToggle('matrix_name')} />
                        <Form.Check className="profile-field1" type="checkbox" label="Дедлайн задачи" 
                            checked={visibleColumns.deadline} onChange={() => handleColumnToggle('deadline')} />
                        <Form.Check className="profile-field1" type="checkbox" label="Окончательный дедлайн задачи" 
                            checked={visibleColumns.final_deadline} onChange={() => handleColumnToggle('final_deadline')} />
                        <Form.Check className="profile-field1" type="checkbox" label="План. количество помидоров на задачу" 
                            checked={visibleColumns.pomodoros_planned} onChange={() => handleColumnToggle('pomodoros_planned')} />
                        <Form.Check className="profile-field1" type="checkbox" label="Потраченное количество помидоров на задачу" 
                            checked={visibleColumns.pomodoros_spent} onChange={() => handleColumnToggle('pomodoros_spent')} />
                        <Form.Check className="profile-field1" type="checkbox" label="Мин. срок выполнения задачи" 
                            checked={visibleColumns.min_time_period_dates_tasks} onChange={() => handleColumnToggle('min_time_period_dates_tasks')} />
                        <Form.Check className="profile-field1" type="checkbox" label="Макс. срок выполнения задачи" 
                            checked={visibleColumns.max_time_period_dates_tasks} onChange={() => handleColumnToggle('max_time_period_dates_tasks')} />
                        <Form.Check className="profile-field1" type="checkbox" label="Тип повторения" 
                            checked={visibleColumns.repeat_type_name} onChange={() => handleColumnToggle('repeat_type_name')} />
                        <Form.Check className="profile-field1" type="checkbox" label="Дни повторений" 
                            checked={visibleColumns.number_repeat} onChange={() => handleColumnToggle('number_repeat')} />
                        <Form.Check className="profile-field1" type="checkbox" label="Дата создания задачи" 
                            checked={visibleColumns.created_at} onChange={() => handleColumnToggle('created_at')} />
                    </div>
                </div>
                
                <div className="columns-group">
                    <h3 className="columns-group-title">Этапы</h3>
                    <div className="profile-grid">
                        <Form.Check className="profile-field1" type="checkbox" label="Название этапа" 
                            checked={visibleColumns.stage_name} onChange={() => handleColumnToggle('stage_name')} />
                        <Form.Check className="profile-field1" type="checkbox" label="Описание этапа" 
                            checked={visibleColumns.stage_description} onChange={() => handleColumnToggle('stage_description')} />
                        <Form.Check className="profile-field1" type="checkbox" label="Дедлайн этапа" 
                            checked={visibleColumns.stage_deadline} onChange={() => handleColumnToggle('stage_deadline')} />
                        <Form.Check className="profile-field1" type="checkbox" label="Окончательный дедлайн этапа" 
                            checked={visibleColumns.stage_final_deadline} onChange={() => handleColumnToggle('stage_final_deadline')} />
                        <Form.Check className="profile-field1" type="checkbox" label="План. количество помидоров на этап" 
                            checked={visibleColumns.stage_pomodoros_planned} onChange={() => handleColumnToggle('stage_pomodoros_planned')} />
                        <Form.Check className="profile-field1" type="checkbox" label="Потраченное количество помидоров на этап" 
                            checked={visibleColumns.stage_pomodoros_spent} onChange={() => handleColumnToggle('stage_pomodoros_spent')} />
                        <Form.Check className="profile-field1" type="checkbox" label="Мин. срок выполнения этапа" 
                            checked={visibleColumns.min_time_period_dates_stages} onChange={() => handleColumnToggle('min_time_period_dates_stages')} />
                        <Form.Check className="profile-field1" type="checkbox" label="Макс. срок выполнения этапа" 
                            checked={visibleColumns.max_time_period_dates_stages} onChange={() => handleColumnToggle('max_time_period_dates_stages')} />
                        <Form.Check className="profile-field1" type="checkbox" label="Дата создания этапа" 
                            checked={visibleColumns.stage_created_at} onChange={() => handleColumnToggle('stage_created_at')} />
                    </div>
                </div>
            </div>
            
            {/* Блок фильтрации */}
            <div className="filter-section">
                <div className="section-select">
                    <h2 className="h1-prof">Фильтрация</h2>
                    <InputGroup className="mb-3">
                        <InputGroup.Text className="field-label">Поле для фильтрации</InputGroup.Text>
                        <Form.Select className="mt-3 select" value={filterField} onChange={(e) => setFilterField(e.target.value)}>
                            <option value="userEmail">Пользователь</option>
                            <option value="project_name">Название проекта</option>
                            <option value="task_name">Название задачи</option>
                            <option value="description">Описание задачи</option>
                            <option value="status_name">Статус задачи</option>
                            <option value="matrix_name">Матрица</option>
                            <option value="deadline">Дедлайн задачи</option>
                            <option value="final_deadline">Окончательный дедлайн задачи</option>
                            <option value="pomodoros_planned">План. количество помидоров на задачу</option>
                            <option value="pomodoros_spent">Потраченное количество помидоров на задачу</option>
                            <option value="min_time_period_dates_tasks">Мин. срок выполнения задачи</option>
                            <option value="max_time_period_dates_tasks">Макс. срок выполнения задачи</option>
                            <option value="repeat_type_name">Тип повторения</option>
                            <option value="number_repeat">Дни повторений</option>
                            <option value="created_at">Дата создания задачи</option>
                            <option value="stage_name">Название этапа</option>
                            <option value="stage_description">Описание этапа</option>
                            <option value="stage_deadline">Дедлайн этапа</option>
                            <option value="stage_final_deadline">Окончательный дедлайн этапа</option>
                            <option value="stage_pomodoros_planned">План. количество помидоров на этап</option>
                            <option value="stage_pomodoros_spent">Потраченное количество помидоров на этап</option>
                            <option value="min_time_period_dates_stages">Мин. срок выполнения этапа</option>
                            <option value="max_time_period_dates_stages">Макс. срок выполнения этапа</option>
                            <option value="stage_created_at">Дата создания этапа</option>
                        </Form.Select>
                        <InputGroup.Text className="field-label">Значение</InputGroup.Text>
                        <FormControl className="mt-3 select" placeholder="Введите значение для поиска..."
                            value={filterValue} onChange={(e) => setFilterValue(e.target.value)} />
                    </InputGroup>
                </div>
            </div>
            
            {/* Таблица с группировкой */}
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
                        {Object.entries(tasksByUser).map(([userEmail, userData]) => {
                            const userTasks = userData.tasks;
                            const taskKeys = getTaskColumnKeys();
                            const stageKeys = getStageColumnKeys();
                            const hasStageColumns = stageKeys.length > 0;
                            
                            return (
                                <React.Fragment key={userEmail}>
                                    {/* Заголовок пользователя */}
                                    <tr className="user-group-header">
                                        <td colSpan={getColumnHeaders().length + 1} className="user-header-cell">
                                            <strong>Пользователь: {userEmail}</strong>
                                        </td>
                                    </tr>
                                    
                                    {/* Задачи пользователя */}
                                    {userTasks.length > 0 ? (
                                        userTasks.map((task) => {
                                            const taskStages = task.stages || [];
                                            const hasStages = taskStages.length > 0;
                                            
                                            return (
                                                <React.Fragment key={`task-${task.id}`}>
                                                    {/* Строка задачи */}
                                                    <tr className="task-row">
                                                        {taskKeys.map((key, colIndex) => (
                                                            <td key={colIndex} className="task-cell">
                                                                {renderCellValue(task, key)}
                                                            </td>
                                                        ))}
                                                        {/* Пустые ячейки для колонок этапов */}
                                                        {hasStageColumns && stageKeys.map((_, idx) => (
                                                            <td key={`stage-empty-${idx}`} className="task-cell"></td>
                                                        ))}
                                                        <td className="actions-cell">
                                                            <Button 
                                                                variant="primary" 
                                                                size="sm" 
                                                                onClick={() => handleTaskClick(task)}
                                                                style={{ marginRight: '5px' }}
                                                            >
                                                                Перейти
                                                            </Button>
                                                            <Button 
                                                                variant="danger" 
                                                                size="sm" 
                                                                onClick={() => {
                                                                    if (window.confirm(`Задача "${task.task_name}" будет удалена без возможности восстановления. Продолжить?`)) {
                                                                        handleDeleteTask(task.id);
                                                                    }
                                                                }}
                                                            >
                                                                Удалить
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                    
                                                    {/* Этапы задачи (с отступом) */}
                                                    {hasStages && taskStages.map((stage) => (
                                                        <tr key={`stage-${task.id}-${stage.id}`} className="stage-row">
                                                            {/* Пустые ячейки для колонок задачи */}
                                                            {taskKeys.map((_, idx) => (
                                                                <td key={`task-empty-${idx}`} className="stage-cell stage-indent"></td>
                                                            ))}
                                                            {/* Ячейки для этапов */}
                                                            {stageKeys.map((key, idx) => (
                                                                <td key={idx} className="stage-cell stage-indent">
                                                                    {renderCellValue(stage, key)}
                                                                </td>
                                                            ))}
                                                            <td>
                                                            <Button 
                                                                variant="info" 
                                                                size="sm"
                                                                onClick={() => handleStageClick(task, stage)}
                                                            >
                                                                Перейти к этапу
                                                            </Button>
                                                            </td>
                                                            
                                                        </tr>
                                                    ))}
                                                </React.Fragment>
                                            );
                                        })
                                    ) : (
                                        <tr className="no-tasks-row">
                                            <td colSpan={getColumnHeaders().length + 1} className="text-center">
                                                <span className="no-tasks-message">У пользователя нет задач</span>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })}
                        
                        {filteredTasks.length === 0 && (
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
export default AppAllTasks;