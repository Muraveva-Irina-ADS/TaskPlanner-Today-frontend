import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import backIcon from '../../images/назад.png';
import { get_all_tasks_only_complete, task_copy, deleteTask } from "../../api/commonApi";
import NavBar from '../../components/NavBar';
import { Button, Form, InputGroup, FormControl} from 'react-bootstrap';
import './CompleteTasks.css';
import '../../styles/common.css'
import Navigate from '../../components/Navigate';
import toast from 'react-hot-toast';

const AppCompleteTasks = () => {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [error, setError] = useState('');
    const [filterField, setFilterField] = useState('task_name');
    const [filterValue, setFilterValue] = useState('');
    const [filteredTasks, setFilteredTasks] = useState([]);
    const location = useLocation();

    const getTasks = async () => {
        try {
            const tasks = await get_all_tasks_only_complete();
            setTasks(tasks);
        } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
        }
    };
    useEffect(() => {
        getTasks();
    }, []);
    useEffect(() => {
        if (location.state?.returnTo === 'CompleteTasks') {
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state]);
    useEffect(() => {
        if (tasks && tasks.length > 0) {
            let filtered = tasks;
            if (filterValue.trim() !== '') {
                filtered = tasks.filter(task => {
                    const fieldValue = task[filterField];
                    if ((filterField === 'created_at' || filterField === 'deadline' || filterField === 'execution_date') && fieldValue) {
                        const dateStr = new Date(fieldValue).toLocaleDateString('ru-RU');
                        return dateStr.toLowerCase().includes(filterValue.toLowerCase());
                    }
                    if (fieldValue === undefined || fieldValue === null) return false;
                    return String(fieldValue).toLowerCase().includes(filterValue.toLowerCase());
                });
            }
            const uniqueTasks = [];
            const taskIds = new Set();
            filtered.forEach(task => {
                if (!taskIds.has(task.task_id)) {
                    taskIds.add(task.task_id);
                    uniqueTasks.push(task);
                }
            });
            setFilteredTasks(uniqueTasks);
        } else {
            setFilteredTasks([]);
        }
    }, [tasks, filterField, filterValue]);
    
    const handleTaskClick = (projectId, taskId) => {
        navigate(`/project/${projectId}/task/${taskId}`, {state: {returnTo: 'CompleteTasks', returnDate: new Date(Math.min(...tasks
            .filter(task => task.task_id === taskId).map(task => new Date(task.execution_date))))}})
    };
    const tasksByProject = filteredTasks.reduce((acc, task) => {
        const projectName = task.project_name || 'Без проекта';
        if (!acc[projectName]) {
            acc[projectName] = {
                projectName: projectName,
                tasks: []
            };
        }
        acc[projectName].tasks.push(task);
        return acc;
    }, {});
    const Copy = async(project_id, taskId) => {
        try {
            const data = await task_copy(project_id, taskId);
                if (data) {
                    toast.success('Задача восстановлена');
                    navigate(`/project/${project_id}`);
                }
        } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
        }
    }
    const handleDeleteTask = async(taskId) => {
        try {
            const data = await deleteTask(taskId);
            if (data) {
                toast.success('Задача удалена');
               getTasks();
            }
          } catch (e) {
              console.error('Ошибка при взаимодействии с сервером:', e);
              const message = e.response?.data?.error || 'Произошла ошибка';
              setError(message);
          }
      };
    return (
        <div className="project-wrapper">
            <NavBar />
            <div className="project-layout">
            <Navigate/>
            <div className="project-content">
            <div className="back-button-container">
                <button onClick={() => navigate(-1)} className="back-button">
                <img src={backIcon} className="back-icon"/>Назад</button>
            </div>
            <div className="profile-header">
                <h1 className="h1-prof">Завершенные задачи</h1>
            </div>
            {error && <div className="error-message">{error}</div>}
                <div className="filter-section">
                <div className="section-select">
                    <h2 className="h1-prof">Фильтрация</h2>
                    <InputGroup className="mb-3">
                        <InputGroup.Text className="field-label">Поле для фильтрации</InputGroup.Text>
                        <Form.Select className="mt-3 select" value={filterField} onChange={(e) => setFilterField(e.target.value)}>
                            <option value="project_name">Проект</option>
                            <option value="task_name">Название</option>
                            <option value="description">Описание</option>
                            <option value="status_name">Статус</option>
                            <option value="matrix_name">Название части матрицы Эйзенхауэра</option>
                            <option value="deadline">Дедлайн</option>
                            <option value="created_at">Создан</option>
                            <option value="type_name">Тип повторения задачи</option>
                            <option value="execution_date">Дата выполнения</option>
                        </Form.Select>
                        <InputGroup.Text className="field-label">Значение</InputGroup.Text>
                        <FormControl className="mt-3 select" placeholder="Введите значение для поиска..."
                            value={filterValue} onChange={(e) => setFilterValue(e.target.value)} />
                    </InputGroup>
                </div>
            </div>
            <div className="projects-grid">
                {Object.values(tasksByProject).map((projectGroup) => (
                    <React.Fragment key={projectGroup.projectName}>
                        <div className="filter-section">
                            <div className="section-select">
                                <h2 className="h1-prof">Проект: {projectGroup.projectName}</h2>
                            </div>
                        </div>
                        {projectGroup.tasks.reduce((unique, task) => {
                                        const exists = unique.some(t => t.id === task.task_id);
                                        if (!exists) {
                                            unique.push(task);
                                        }
                                        return unique;
                            }, []).map((task) => (
                            <div key={task.task_id} className="project-card" onClick={() => handleTaskClick(task.project_id, task.task_id)}>
                                <div className="project-header">
                                    <h3 className="project-name">{task.task_name}</h3>
                                    <div className="header-right">
                                        <span className={`project-status active`}>
                                            {task.status_name}
                                        </span>                                      
                                        <Button variant="primary" className="btn-recover" onClick={(e) => {e.stopPropagation(); 
                                            if (window.confirm(`Будет создана полная копия задачи ${task.task_name}. Продолжить?`)) {
                                                Copy(task.project_id, task.task_id)}}}>Восстановить</Button>
                                        <Button variant="primary" className="btn-delete" onClick={(e) => {e.stopPropagation(); 
                                            if (window.confirm(`Задача ${task.task_name} будет удалена без возможности восстановления. Продолжить?`)) {
                                                handleDeleteTask(task.task_id)}}}>Удалить</Button>
                                    </div>
                                </div>                
                                <p className="project-description">{task.description}</p>
                                <p className="project-description">Дата создания: {new Date(task.created_at).toLocaleDateString('ru-RU')}</p>
                                <p className="project-description">Дедлайн: {new Date(task.deadline).toLocaleDateString('ru-RU')}</p>
                            </div>
                        ))}
                    </React.Fragment>
                ))}
                
                {filteredTasks.length === 0 && (
                    <div className="project-card" style={{ textAlign: 'center', color: 'red' }}>Нет данных для отображения</div>)}
            </div>
                </div>
        </div>
        </div>
    );
};

export default AppCompleteTasks;