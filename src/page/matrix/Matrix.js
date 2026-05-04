import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import backIcon from '../../images/назад.png'; 
import { Context } from '../../index';
import {get_profile_matrix_email, get_export_date_from_dates_tasks_history, get_all_tasks} from "../../api/commonApi";
import NavBar from '../../components/NavBar';
import './Matrix.css';
import '../../styles/common.css'
import Navigate from '../../components/Navigate';
import WeekNavigate from '../../components/WeekNavigate';
import HelpTip from '../../components/HelpTip';

const AppMatrix = () => {
    const { user } = useContext(Context);
    const navigate = useNavigate();
    const [yourMatrix, setYourMatrix] = useState({});
    const [allTasks, setAllTasks] = useState([]);
    const [error, setError] = useState('');
    const [lastExportDate, setLastExportDate] = useState('');
    const [isNeedAllTasks, setIsNeedAllTasks] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedProject, setSelectedProject] = useState(null);
    const location = useLocation();
    const [selectedStatus, setSelectedStatus] = useState(null);

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
    //Получение информации о всех незавршенных задачах всех проектов пользователя
    const getAllTasks = async () => {
        try {
            const alltasks = await get_all_tasks();
            setAllTasks(alltasks);
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
                const formattedDate = date.toLocaleDateString('en-CA');
                setLastExportDate(formattedDate);
            } else {
                if (user.role === 'admin')
                    setError('Данные в исторической таблице сроков задач не найдены');
                setLastExportDate('1970-01-01');
            }
        } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setLastExportDate('1970-01-01');
            setError(message);
    }}; 
    //Хук useEffect, в котором вызываются функции для получения данных из базы данных с помощью API-функций
    useEffect(() => {
        get_exportDateTasks();
        getYourMatrix();
        getAllTasks();
    }, []);
    //Хук useEffect, который вызывается, при изменении значений location.state
    useEffect(() => {
        if (location.state?.returnTo === 'matrix') {
            setSelectedDate(new Date(location.state.returnDate));
            setIsNeedAllTasks(location.state.returnIsNeedAllTasks);
            setSelectedProject(location.state.returnSelectedProject);
            setSelectedStatus(location.state.returnSelectedStatus);
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state]);
    //Вызывает функцию navigate для перехода на страницу задачи
    const handleTaskClick = (projectId, taskId) => {
        if (!isNeedAllTasks)
            navigate(`/project/${projectId}/task/${taskId}`, {state: {
                returnTo: 'matrix', 
                returnDate: selectedDate, 
                returnIsNeedAllTasks: isNeedAllTasks,
                returnSelectedProject: selectedProject,
                returnSelectedStatus: selectedStatus}})
        else
            navigate(`/project/${projectId}/task/${taskId}`, {state: {
                returnTo: 'matrix', 
                returnDate: new Date(Math.min(...allTasks.filter(task => task.task_id === taskId && task.execution_date && task.code !== 'выполнение').map(task => new Date(task.execution_date)))), 
                returnIsNeedAllTasks: isNeedAllTasks,
                returnSelectedProject: selectedProject,
                returnSelectedStatus: selectedStatus}})
    };
    //Фильтрует список задач allTasks для получения списка задач для конкретной ячейки матрицы, выбранного проекта и/или статуса, выбранного срока
    //выполнения или уникальный список задач без повторений
    const getVisibleTasks = (cell) => {
        let tasks = allTasks.filter(task => task.matrix_id === cell.id);
        if (selectedProject) {
            tasks = tasks.filter(task => Number(task.project_id) === Number(selectedProject));
        }
        if (selectedStatus) {
            tasks = tasks.filter(task => Number(task.status_id) === Number(selectedStatus));
        }
        if (!isNeedAllTasks) {
            tasks = tasks.filter(task => new Date(task.execution_date).toDateString() === selectedDate.toDateString());
        }
        if (isNeedAllTasks) {
            const seen = new Set();
            tasks = tasks.filter(task => {
                if (seen.has(task.task_id)) return false;
                seen.add(task.task_id);
                return true;
            });
        }
        return tasks;
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
                    {error && <div className="error-message">{error}</div>}
                    <WeekNavigate onDateSelect={setSelectedDate} selectedDate={selectedDate} title="Матрица Эйзенхауэра" 
                        isNeedAllTasks={isNeedAllTasks} setIsNeedAllTasks={setIsNeedAllTasks} lastExportDate={lastExportDate}/>
                    <div className="filters-section">
                        <div className="calendar-view-selector" style={{ position: 'relative' }}>
                            <HelpTip>
                                В матрице отображаются только незавершенные задачи.<br/>
                                Все задачи на конкретный день можно посмотреть в Календаре
                            </HelpTip>
                            {/*Блок с select для выбора проекта*/}
                            <div className="display-tasks">
                                <h2 className="h1-prof">Проект:</h2>
                                <select value={selectedProject || ''} onChange={(e) => setSelectedProject(e.target.value || null)} className="mt-3 mb-3 p-4 modal-input">
                                    <option value="">Все проекты</option>
                                    {allTasks && allTasks.length > 0 && Array.from(new Map(allTasks
                                        .filter(task => task.project_id && task.project_name)
                                        .map(task => [task.project_id, {id: task.project_id, name: task.project_name}])
                                        ).values())
                                        .sort((a, b) => a.name.localeCompare(b.name))
                                        .map(project => (
                                            <option key={project.id} value={project.id}>{project.name}</option>
                                        ))}
                                </select>
                            </div>
                            {/*Блок с select для выбора статуса*/}
                            <div className="display-tasks">
                                <h2 className="h1-prof">Статус:</h2>
                                <select value={selectedStatus || ''} onChange={(e) => setSelectedStatus(e.target.value || null)} className="mt-3 mb-3 p-4 modal-input">
                                    <option value="">Все статусы</option>
                                    {allTasks && allTasks.length > 0 && Array.from(new Map(allTasks
                                        .filter(task => task.status_id && task.status_name)
                                        .map(task => [task.status_id, {id: task.status_id, name: task.status_name}])
                                        ).values())
                                        .sort((a, b) => a.name.localeCompare(b.name))
                                        .map(status => (
                                            <option key={status.id} value={status.id}>{status.name}</option>))}
                                </select>
                            </div>
                        </div>
                    </div>
                    {/*Блок отображения матрицы*/}
                    <div className="settings-section">
                        <div className="matrix-grid">
                            {yourMatrix && Array.isArray(yourMatrix) && yourMatrix.map((cell) => (
                                <div key={cell.matrix_part} className="matrix-cell" style={{backgroundColor: cell.color,
                                    background: `linear-gradient(135deg, ${cell.color}CC, ${cell.color})`}}>
                                    <div className="cell-number">{cell.matrix_part}</div>
                                    <div className="cell-name">{cell.matrix_name}</div>
                                    <div className="cell-description">{cell.description}</div>
                                    <div className="tasks-list1">
                                        {/*Блок отображения списка задач в каждой ячейке матрицы*/}
                                        {allTasks && allTasks.length > 0 ? (getVisibleTasks(cell).map(task => {
                                            return (
                                                <div key={task.id || Math.random()} className="matrix-task"
                                                    style={{borderLeft: `5px solid ${task.project_color || '#ccc'}`}}
                                                    onClick={() => handleTaskClick(task.project_id, task.task_id)}> 
                                                    {!isNeedAllTasks && (<div className="task-status-container">
                                                        <span className={`task-status-badge`} style={{backgroundColor: task.exec_color}} title = "Статус выполнения">{task.exec_status_name}</span>
                                                    </div>)}                                                   
                                                    <span className="task-name-tag1" title="Название задачи">{task.task_name}</span>
                                                    {task.project_name && (
                                                        <span className="task-project-tag1" style={{ color: task.project_color }}
                                                            title="Название проекта">{task.project_name}</span>
                                                    )}
                                                    {task.status_name  && (
                                                        <span className="task-project-tag1" title="Статус">{task.status_name}</span>
                                                    )}           
                                                    <span className="task-project-tag1" title="Дедлайн">{new Date(task.deadline).toLocaleDateString('ru-RU')}</span>                                      
                                                </div>
                                        )})): (
                                            <div className="no-tasks-message">Нет задач</div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>);};

export default AppMatrix;