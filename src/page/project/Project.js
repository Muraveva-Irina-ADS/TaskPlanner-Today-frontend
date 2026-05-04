import React, { useState, useEffect } from 'react';
import {get_projects, project_post, project_delete, get_profile_settings_email, get_tasks_time_pomodoro, get_PomodoroWithoutTasks, 
    put_statusExec } from "../../api/commonApi";
import { observer } from 'mobx-react-lite';
import NavBar from '../../components/NavBar';
import { useNavigate } from 'react-router-dom';
import { Button, InputGroup, Form, FormControl } from 'react-bootstrap';
import './Project.css';
import '../../styles/common.css'
import ModalStr from '../../components/ModalStructure';
import Navigate from '../../components/Navigate';
import HelpTip from '../../components/HelpTip';
import toast from 'react-hot-toast';

const AppProject = observer(() => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]); 
    const [yourSettings, setYourSettings] = useState();
    const [modalType, setModalType] = useState(null);   
    const [filterField, setFilterField] = useState('project_name');
    const [filterValue, setFilterValue] = useState('');
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({});
    const [error, setError] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [tasks, setTasks] = useState([])  
    const [pomodoroWithoutTasks, setPomodoroWithoutTasks]  = useState([]) 
    
    //Получение информации о проектах пользователя
    const getProjects = async () => {
        try {
            const project = await get_projects(0);
            setProjects(project);
            if (project.length === 0) {
                setError('У Вас нет проектов, нажмите на кнопку Создать новый проект, чтобы добавить проект. Задачи можно будет добавить после создания проекта');
              }
        } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
    }};
    //Получение информации о задачах пользователя
    const getTasks = async () => {
        try {
            const tasks = await get_tasks_time_pomodoro(formatDateForSQL(selectedDate));
            setTasks(tasks);
        } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
    }};
    //Получение из базы данных с помощью вызова API-фугкции информации о статистике помидоров: всего потраченных помидоров за сегодня,
    //количество помидоров за сегодня без привязки к задаче или этапу и количество вручную остановленных помидоров
    const getPomodoroWithoutTasks = async () => {
        try {
            const count = await get_PomodoroWithoutTasks(formatDateForSQL(selectedDate));
            setPomodoroWithoutTasks(count);
        } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
    }};
    //Вызов API-функции для изменения статуса выполнения у просроченных неначатых сроках выполнения задачи
    const putStatusExec = async () => {
        try {
            await put_statusExec();
        } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
        }
    }; 
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
    //Хук useEffect, в котором вызываются функции для получения данных из базы данных с помощью API-функций
    useEffect(() => {
        getProjects();
        getTasks();
        getPomodoroWithoutTasks();
        putStatusExec();
        getYourSettings();
    }, []);
    //Хук useEffect, в котором вызываются функции для получения списка задач со сроком выполнения, равным selectedDate
    useEffect(() => {
        getTasks();
        getPomodoroWithoutTasks();
    }, [selectedDate]);
    //Хук useEffect для фильтрации списка задач в массив filteredProjects   
    useEffect(() => {
        if (projects && projects.length > 0) {
            let filtered = projects;
            if (filterValue.trim() !== '') {
                filtered = projects.filter(project => {
                    const fieldValue = project[filterField];
                    if (filterField === 'is_active') {
                        const searchValue = filterValue.toLowerCase();
                        if (searchValue === 'да' || searchValue === 'true' || searchValue === 'активен') {
                            return project.is_active === true;
                        } else if (searchValue === 'нет' || searchValue === 'false' || searchValue === 'не активен' || searchValue === 'архив') {
                            return project.is_active === false;
                        }
                        return false;
                    }
                    if (filterField === 'created_at' && fieldValue) {
                        const dateStr = new Date(fieldValue).toLocaleDateString('ru-RU');
                        return dateStr.toLowerCase().includes(filterValue.toLowerCase());
                    }
                    if (fieldValue === undefined || fieldValue === null) return false;
                    return String(fieldValue).toLowerCase().includes(filterValue.toLowerCase());
                });
            }
            setFilteredProjects(filtered);
        } else {
            setFilteredProjects([]);
        }
    }, [projects, filterField, filterValue]);
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
    //Функция для изменения состояния полей формы в модальном окне
    const handleChange = (e, index = null) => {
        const { name, value, type } = e.target;
        if (index !== null && Array.isArray(formData)) {
            const updatedArray = [...formData];
            updatedArray[index] = {...updatedArray[index], [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value};
            setFormData({...formData});
        }
        else {
            if (type === 'number') {
                setFormData(prev => ({...prev, [name]: value === '' ? '' : Number(value)}));
            } else {
                setFormData(prev => ({...prev, [name]: value}));
            }
        }
    };
    //Функция открытия модального окна
    const openModal = (modalType = null) => {
        setFormData({color: '#c3c1ec', is_active: true});
        setModalType(modalType);
        setShowModal(true);
        setError('');
    }; 
    //Функция закрытия модального окна
    const closeModal = () => {
        setFormData({});
        setShowModal(false);
        setModalType(null);
        setError('');
    };
    //Валидация полей проекта и вызов API-функции для добавления данных в таблицу projects (проекты)
    const handleAddProject = async() => {
        try {
            if (!formData.project_name || !formData.description) {
                setError('Все поля должны быть заполнены');
                return;
            }
            const data = await project_post(formData);
                if (data) {
                    toast.success('Добавлено');                
                    closeModal();
                    getProjects();
                }
        } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
        }
    }
    //Вызов API-функции для удаления данных из таблицы projects (проекты)
    const handleDelete = async (id) => {
        try {
            let data;
            data = await project_delete(id);
            if (data) {
                toast.success('Удалено'); 
                await getProjects();
            }
        } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
        }
    };
    //Изменение selectedDate на предыдущий день с ограничением: нельзя уйти более чем на 7 дней назад от текущей даты     
    const prevDay = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(selectedDate.getDate() - 1);
        const today = new Date();
        const minDate = new Date();
        minDate.setDate(today.getDate() - 8);
        if (newDate >= minDate) {
            setSelectedDate(newDate);
        } else {
            alert('Данные доступны только за последние 7 дней. Все задачи можно посмотреть в Календаре, Матрице и ниже перейти в проект и посмотреть задачи в проекте');
        }
    };
    //Изменение selectedDate на следующий день с ограничением: нельзя уйти более чем на 7 дней вперед от текущей даты
    const nextDay = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(selectedDate.getDate() + 1);
        const today = new Date();
        const maxDate = new Date();
        maxDate.setDate(today.getDate() + 7);
        if (newDate <= maxDate) {
            setSelectedDate(newDate);
        } else {
            alert('Данные доступны только на ближайшие 7 дней. Все задачи можно посмотреть в Календаре, Матрице и ниже перейти в проект и посмотреть задачи в проекте');
        }
    };
    //Возвращает текстовое представление даты: "Сегодня", "Вчера", "Завтра" или полную дату в формате "день месяц год"
    const getDateTitle = (date) => {
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);
        if (date.toDateString() === today.toDateString()) return "Сегодня";
        if (date.toDateString() === yesterday.toDateString()) return "Вчера";
        if (date.toDateString() === tomorrow.toDateString()) return "Завтра";
        const day = date.toLocaleDateString('ru-RU', { month: 'long', day: 'numeric', year: 'numeric' }).replace(' г.', '')
        return `${day}`;
    };
    //При нажатии на блок с задачей открывает страницу с информацией о выбранной задачи
    const handleTaskClick = (projectId, taskId) => {
        navigate(`/project/${projectId}/task/${taskId}`, {state: {returnTo: 'Project', returnDate: selectedDate}})
    };
    //При нажатии на блок с этапом открывает страницу с информацией о выбранном этапе
    const handleStageClick = (projectId, taskId, stageId) => {
        navigate(`/project/${projectId}/task/${taskId}/stage/${stageId}`, {state: {returnTo: 'Project', returnDate: selectedDate}})
    };
    //При нажатии на блок с проектом открывает страницу списка задач у проекта
    const navigateToProject = (e, projectId) => {
        e.stopPropagation();
        navigate(`/project/${projectId}`);
    }; 
    //Группирует задачи по task_id, выделяя у каждой задачи список с её этапами
    const getGroupedTasks = (tasks) => {
        if (!tasks || !Array.isArray(tasks) || tasks.length === 0)
            return [];
        const uniqueTaskIds = [...new Set(tasks.map(t => t.task_id))];
        return uniqueTaskIds.map(taskId => {
            const task = tasks.find(t => t.task_id === taskId);
            const stages = tasks.filter(t => t.task_id === taskId && t.stage_name && t.stage_name !== 'null');
            return { taskId, task, stages, uniqueTaskIds };
        });
    }; 
    //Возвращает количество потраченных помидоров за выбранную дату для задачи или этапа
    const getTodayCountPomodoro = (id, type) => {
        if (!pomodoroWithoutTasks || !pomodoroWithoutTasks.grouped) return '';
        const todayPomodoro = pomodoroWithoutTasks.grouped.find(p => {
            if (type === 'task') return p.task_id === id && p.stage_id === 0;
            else return p.stage_id === id;
        });
        const count = todayPomodoro?.count || 0;
        return count > 0 ? ` (+${count} за ${getDateTitle(selectedDate)})` : '';
    };
    //Возвращает количество выполненных задач за выбранную дату
    const getCompletedTasksCount = () => {
        if (!tasks || !Array.isArray(tasks) || tasks.length === 0)
            return '0 / 0';
        const uniqueTaskIds = [...new Set(tasks.map(t => t.task_id))];
    const completedCount = uniqueTaskIds.filter(taskId => tasks.some(t => t.task_id === taskId && (t.task_code === 'выполнение' || t.task_code === 'завершение'))).length;
        return `${completedCount} / ${uniqueTaskIds.length}`;
    }; 
    //Возвращает общее количество потраченных и запланированных помидоров по всем задачам и этапам 
    const getTotalCountPomodoro = () => {
        if (!tasks || !Array.isArray(tasks) || tasks.length === 0) return '0 / 0';
        const uniqueTasks = Object.values(tasks.reduce((acc, t) => {
            if (!acc[t.task_id])
                acc[t.task_id] = t;
            return acc;
        }, {}));
        const totalSpent = Number(uniqueTasks.reduce((sum, t) => sum + (t.tasks_pomodoros_spent || 0), 0)) + 
            Number(tasks.reduce((sum, t) => sum + (t.stages_pomodoros_spent || 0), 0));
        const totalPlanned = Number(uniqueTasks.reduce((sum, t) => sum + (t.tasks_pomodoros_planned === -1 ? 0 : t.tasks_pomodoros_planned || 0), 0)) + 
            Number(tasks.reduce((sum, t) => sum + (t.stages_pomodoros_planned === -1 ? 0 : t.stages_pomodoros_planned || 0), 0));
        return `${totalSpent} / ${totalPlanned}`;
    };
    //Сортирует список проектов, чтобы активные проекты выводились первыми
    const getSortedProjects = () => {
        return [...filteredProjects].sort((a, b) => {
            if (a.is_active === b.is_active) return 0;
            return a.is_active ? -1 : 1;
        });
    };
    //При нажатии на кнопку "Перейти" открывает страницу списка задач у проекта
    const handleProjectClick = (projectId) => {
        navigate(`/project/${projectId}`);
    };
    //Отображается диалоговое окно подтверждения удаления проекта и при согласии пользователя вызывает функцию handleDelete
    const confirmDeleteProject = (e, project) => {
        e.stopPropagation();
        if (window.confirm(`Проект ${project.project_name} будет удален без возможности восстановления. Продолжить?`)) {
            handleDelete(project.id);
        }
    };
    return (
        <div className="project-wrapper">
            <NavBar />
            <div className="project-layout">
                <Navigate/>
                <ModalStr show={showModal} onHide={closeModal} modalType={modalType} title={'Создание проекта'} formData={formData} onChange={handleChange} 
                    onSave={handleAddProject} error={error} isNew={true} fields={['project_name', 'description', 'is_active', 'color']}/>
                <div className="project-content">
                    <div className="daily-plan-block">
                        {/*Отображение даты и стрелок*/}
                        <div className="daily-plan-header">
                            <div className="date-navigation">
                                <button className="nav-arrow" title = 'Предыдущий день' onClick={prevDay}>←</button>
                                <div className="date-info">
                                    <div className="date-title" title = 'Список задач составляется для этой даты выполнения'>{getDateTitle(selectedDate)}</div>
                                </div>
                                <button className="nav-arrow" title = 'Следующий день' onClick={nextDay}>→</button>
                            </div>
                        </div>
                        {/*Названия колонок таблицы*/}
                        <div className="table-header">
                            <div className="col" title = 'Задачи и этапы на указанный вверху таблицы день'>Задачи и этапы</div>
                            <div className="col" title = 'Запланированное время выполнения задачи или этапа'>Время</div>
                            <div className="col" style={{ position: 'relative' }} title = 'Информация о количестве помидоров задачи'>
                                <HelpTip>
                                    В этом столбце можно увидеть количество помидоров, которое уже было затрачено на задачу или этап и сколько помидоров Вы запланировали
                                    потратить<br/> В конце идет подсчет помидоров, причем уже потраченные помидоры учитывают все помидоры, даже те, у которых не была 
                                    выбрана задача или этап.
                                </HelpTip>
                            Помидоры</div>
                            <div className="col" title = 'Быстрый переход к проекту задачи'>Перейти к проекту</div>
                        </div>
                        {/*Список задач*/}
                        {tasks && Array.isArray(tasks) && tasks.length > 0 ? (getGroupedTasks(tasks).map(({ taskId, task, stages, uniqueTaskIds }) => (
                            <React.Fragment key={taskId}>
                                <div className="table-row" onClick={() => handleTaskClick(task.project_id, task.task_id)}>
                                    <div className="col">
                                        <span className={`task-status-badge`} style={{backgroundColor: task.task_exec_color}} title = "Статус выполнения">
                                            {task.task_exec_status_name}</span>
                                        <span className="task-name" title='Название задачи и проекта'>{task.task_name} (проект: {task.project_name})</span>
                                        <span className="task-status" title='Статус задачи'>{task.status_name}</span>
                                    </div>
                                    <div className="col">
                                        <span className="task-time" title='Запланированное время начала и окончания выполнения задачи'>
                                            {task.tasks_start_time?.substring(0, 5)} - {task.tasks_end_time?.substring(0, 5)}
                                        </span>
                                    </div>
                                    <div className="col">
                                        <span className="task-time" title ='Сколько уже было помидоров / запланированное количество помидоров на задачу'>
                                            {task.tasks_pomodoros_spent || 0}/{task.tasks_pomodoros_planned === -1 ? 'Не указано' : task.tasks_pomodoros_planned || 0}
                                            {getTodayCountPomodoro(task.task_id, 'task')}
                                        </span>
                                    </div>
                                    <div className="col">
                                        <span className="task-time" title = 'Сколько уже было помидоров / запланированное количество помидоров на задачу'>
                                            <Button onClick={(e) => navigateToProject(e, task.project_id)} style={{ margin: '0px' }} 
                                            title="Перейти в проект задачи">Перейти</Button>
                                        </span>
                                    </div> 
                                </div>
                                {stages.length > 0 && (
                                    <div className="stages-table">
                                        {stages.map((stage, idx) => (
                                            <div key={idx} className="table-row" onClick={() => handleStageClick(task.project_id, task.task_id, stage.stage_id)}>
                                                <div className="col">
                                                    <span className={`task-status-badge`} style={{backgroundColor: stage.stage_exec_color}} 
                                                         title = "Статус выполнения">{stage.stage_exec_status_name}</span>
                                                    <span className="task-name" title='Название этапа'>{stage.stage_name}</span>
                                                    <span className="task-status" title='Статус задачи'>{task.status_name}</span>
                                                </div>
                                                <div className="col">
                                                    <span className="task-time" title='Запланированное время начала и окончания выполнения этапа'>
                                                        {stage.stages_start_time?.substring(0, 5)} - {stage.stages_end_time?.substring(0, 5)}
                                                    </span>
                                                </div>
                                                <div className="col">
                                                    <span className="task-time" title = 'Сколько уже было помидоров / запланированное количество помидоров на этап'>
                                        {stage.stages_pomodoros_spent || 0}/{stage.stages_pomodoros_planned === -1 ? 'Не указано' : stage.stages_pomodoros_planned || 0}
                                                        {getTodayCountPomodoro(stage.stage_id, 'stage')}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {uniqueTaskIds.indexOf(taskId) < uniqueTaskIds.length - 1 && <div className="task-divider"></div>}
                            </React.Fragment>
                        ))) : (<div className="table-row" style={{ textAlign: 'center', color: 'red' }}>Нет задач за указанный день</div>)}
                        {/*Отображение двух нижних строк таблицы со статистикой*/}
                        {tasks.length > 0 && (<>
                            <div className="table-header">
                                <div className="col"><span className="stats-label">Выполнено задач и помидоров:</span></div>
                                <div className="col">
                                    <span className="stats-value">Задач: </span>
                                    <span className="stats-label" title = 'Выполненные задачи / Всего задач на указанный день'>{getCompletedTasksCount()}</span>
                                </div>
                                <div className="col">
                                    <span className="stats-value">Помидоров: </span>
                                    <span className="stats-label" title = 'Суммарное количество потраченных помидор / запланированных помидор'>
                                        {getTotalCountPomodoro()}
                                    </span>
                                </div>
                            </div>
                            <div className="table-header">
                                <div className="col"><span className="stats-label">Прогресс помидоров:</span></div>
                                <div className="col">
                                    <span className="stats-value" title = 'Всего помидоров за сегодня из Вашего максимума помидоров в день из настроек профиля'>
                                        Всего помидоров: {pomodoroWithoutTasks.total_count}/{yourSettings?.number_pomodoro_per_day}
                                    </span>
                                </div>
                                <div className="col">
                                    <span className="stats-value" title = 'Количество помидоров за сегодня без привязки к задаче или этапу'>
                                        Без задач: {pomodoroWithoutTasks.withoutTask_count}
                                    </span>
                                </div>
                                <div className="col">
                                    <span className="stats-value" title = 'Сколько помидоров вы остановили за сегодня вручную, не дожидаясь конца таймера'>
                                        Остановлено вручную: {pomodoroWithoutTasks.interrupted_count}
                                    </span>
                                </div>                                            
                            </div>
                        </>)}
                    </div>
                    {/*Заголовок*/}
                    <div className="profile-header">
                        <h1 className="h1-prof">Проекты</h1>
                    </div>
                    {error && <div className="error-message">{error}</div>}
                    {/*Кнопка для создания проекта*/}
                    <div className="text-end mb-3">
                        <Button variant="primary" style={{height: '60px'}} onClick={() => openModal('project_modal')}>Создать новый проект</Button>
                    </div>
                    {/*Блок фильтрации*/}
                    <div className="filter-section">
                        <div className="section-select">
                            <h2 className="h1-prof">Фильтрация</h2>
                            <InputGroup className="mb-3">
                                <InputGroup.Text className="field-label">Поле для фильтрации</InputGroup.Text>
                                <Form.Select className="mt-3 select" value={filterField} onChange={(e) => setFilterField(e.target.value)}>
                                    <option value="project_name">Название</option>
                                    <option value="description">Описание</option>              
                                    <option value="is_active">Активен ли (введите активен или не активен (true или false))</option>
                                    <option value="created_at">Дата создания</option>
                                </Form.Select>
                                <InputGroup.Text className="field-label">Значение</InputGroup.Text>
                                <FormControl className="mt-3 select" placeholder="Введите значение для поиска..."
                                    value={filterValue} onChange={(e) => setFilterValue(e.target.value)} />
                            </InputGroup>
                        </div>
                    </div>
                    <div className="projects-grid">
                        {/*Карточка проекта*/}
                        {getSortedProjects().map((project) => (
                            <div key={project.id} className="project-card" onClick={() => handleProjectClick(project.id)} 
                                style={{ borderTop: `8px solid ${project.color}`, backgroundColor: !project.is_active ? '#ffadad' : 'white' }}>
                                <div className="project-header">
                                    <h3 className="project-name">{project.project_name}</h3>
                                    <div className="header-right"> 
                                        <span className={`project-status ${project.is_active ? 'active' : 'inactive'}`}>{project.is_active ? 'Активен' : 'Не активен'}
                                        </span>
                                        <Button variant="primary" className="btn-delete" onClick={(e) => confirmDeleteProject(e, project)}>Удалить</Button>
                                    </div>
                                </div>                
                                <p className="project-description">{project.description}</p>
                                <p className="project-description">Дата создания: {new Date(project.created_at).toLocaleDateString('ru-RU')}</p>
                            </div>
                        ))}  
                        {filteredProjects.length === 0 && (
                            <div className="project-card" style={{ textAlign: 'center', color: 'red' }}>Нет данных для отображения</div>)}
                    </div>
                </div>
            </div>
        </div>
    );
});

export default AppProject;