import React, { useState, useEffect, useMemo, useRef } from 'react';
import { observer } from "mobx-react-lite";
import NavBar from "../../components/NavBar";
import backIcon from '../../images/назад.png';
import Navigate from '../../components/Navigate';
import { Button, Form } from 'react-bootstrap';
import './Statistic.css';
import '../../styles/common.css'
import { useLocation, useNavigate } from 'react-router-dom';
import { get_executionStatus, get_tasks_for_gantt } from '../../api/commonApi';
import ModalStr from '../../components/ModalStructure';

const AppStatistic = observer(() => {
    const navigate = useNavigate();
    const location = useLocation();
    const [error, setError] = useState('');
    const [tasks, setTasks] = useState([]);
    const [expandedGroups, setExpandedGroups] = useState({});
    const [expandedTasks, setExpandedTasks] = useState({});
    const [selectedProjectIds, setSelectedProjectIds] = useState([]);
    const [selectedTaskIds, setSelectedTaskIds] = useState([]);
    const [dateRange, setDateRange] = useState({ start: null, end: null });
    const [scale, setScale] = useState('week');
    const [deadlineFilter, setDeadlineFilter] = useState(null);
    const [displayFrom, setDisplayFrom] = useState('today');
    const [showModal, setShowModal] = useState(false);
    const [selectAllTasks, setSelectAllTasks] = useState(false);
    const [isEverythingExpanded, setIsEverythingExpanded] = useState(false);
    const [executionStatus, setExecutionStatus] = useState([]);
    const [modalType, setModalType] = useState(null);
    
    const getDateRange = () => {
        if (dateRange.start && dateRange.end) {
            return { start: new Date(dateRange.start), end: new Date(dateRange.end) };
        }
        let compare = new Date();
        if (tasks?.[0]?.min_time_period_dates_tasks) {
            compare = new Date(tasks[0].min_time_period_dates_tasks);
        }
        let start = new Date();
        let end = new Date();
        
        if (displayFrom === 'today') {
            start = new Date();
            start.setHours(0, 0, 0, 0);
        } else if (displayFrom === 'start_date') {
            const earliestStart = tasks.reduce((earliest, task) => {
                const taskStart = new Date(task.min_time_period_dates_tasks);
                return taskStart < earliest ? taskStart : earliest;
            }, compare);
            start = earliestStart;
        } else if (displayFrom === 'created_at') {
            const earliestCreated = tasks.reduce((earliest, task) => {
                if (!task.created_at) return earliest;
                const date = new Date(task.created_at);
                return date < earliest ? date : earliest;
            }, new Date());
            start = earliestCreated;
        }
        
        if (deadlineFilter) {
            end = new Date(deadlineFilter);
            end.setHours(23, 59, 59, 999);
        } else {
            const latestDeadline = tasks.reduce((latest, task) => {
                if (!task.deadline) return latest;
                const date = new Date(task.deadline);
                return date > latest ? date : latest;
            }, new Date());
            end = latestDeadline;
        }
        
        return { start, end };
    };    
    const getDaysArray = () => {
        const { start, end } = getDateRange();
        const days = [];
        
        if (start > end) return days;
        
        let current = new Date(start);
        current.setHours(0, 0, 0, 0);
        const endDate = new Date(end);
        endDate.setHours(0, 0, 0, 0);
        
        if (scale === 'week') {
            const dayOfWeek = current.getDay();
            const startOfWeek = new Date(current);
            startOfWeek.setDate(current.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
            
            for (let i = 0; i < 7; i++) {
                const day = new Date(startOfWeek);
                day.setDate(startOfWeek.getDate() + i);
                days.push(day);
            }
        } else if (scale === 'month') {
            const monthStart = new Date(current.getFullYear(), current.getMonth(), 1);
            const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
            
            let day = new Date(monthStart);
            while (day <= monthEnd) {
                days.push(new Date(day));
                day.setDate(day.getDate() + 1);
            }
        } else {
            let day = new Date(current);
            while (day <= endDate) {
                days.push(new Date(day));
                day.setDate(day.getDate() + 1);
            }
        }
        return days;
    };
    const days = useMemo(() => {return getDaysArray();}, [tasks, scale, displayFrom, deadlineFilter, dateRange, selectedTaskIds]);
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
    const getTasks = async () => {
        try {
            const tasksData = await get_tasks_for_gantt();
            setTasks(tasksData);
            if (tasksData.length > 0) {
                const savedFilters = location.state?.filters;
                if (savedFilters?.selectedTaskIds?.length > 0) {
                    setSelectedTaskIds(savedFilters.selectedTaskIds);
                    setSelectAllTasks(savedFilters.selectedTaskIds.length === tasksData.length);
                } else {
                    const allTaskIds = tasksData.map(task => task.task_id);
                    setSelectedTaskIds(allTaskIds);
                    setSelectAllTasks(true);
                    setExpandedGroups({});
                    setExpandedTasks({});
                }
            }
        } catch (e) {
            console.error('Ошибка:', e);
            setError(e.response?.data?.error || 'Произошла ошибка');
        }
    };

    useEffect(() => {
        getTasks();
        getExecutionStatus();
    }, []);
    useEffect(() => {
        if (location.state?.returnTo === 'Gantt' && location.state?.filters) {
            const { filters } = location.state;
            if (filters.selectedTaskIds) setSelectedTaskIds(filters.selectedTaskIds);
            if (filters.selectedProjectIds) setSelectedProjectIds(filters.selectedProjectIds);
            if (filters.scale) setScale(filters.scale);
            if (filters.displayFrom) setDisplayFrom(filters.displayFrom);
            if (filters.deadlineFilter) setDeadlineFilter(filters.deadlineFilter);
            if (filters.expandedGroups) setExpandedGroups(filters.expandedGroups);
            if (filters.expandedTasks) setExpandedTasks(filters.expandedTasks);
            window.history.replaceState({}, document.title);
        }
    }, [location]);
    const groupedTasks = useMemo(() => {
        const groups = {};
        tasks.forEach(task => {
            if (!groups[task.project_name]) {
                groups[task.project_name] = {
                    id: task.project_id,
                    name: task.project_name,
                    color: task.project_color,
                    tasks: []
                };
            }
            groups[task.project_name].tasks.push(task);
        });
        Object.values(groups).forEach(project => {project.tasks.sort((a, b) => {return new Date(a.deadline) - new Date(b.deadline);});});
        return Object.values(groups);
    }, [tasks]);

    const formatDateForSQL = (dateValue) => {
        if (!dateValue) return null;
        const date = new Date(dateValue);
        if (isNaN(date)) return null;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
    };
    const checkDateToTask = (task, date) => {
        const execution = task.executions?.find(e => {
            const execDate = new Date(e.execution_date);
            return formatDateForSQL(execDate) === formatDateForSQL(date);
        });
        if (execution) return true;
        return false;
    };
    const handleTaskClick = (task, date) => {
        if (!checkDateToTask(task, date)) return;
        const state = {
            returnTo: 'Gantt',
            returnDate: formatDateForSQL(date),
            filters: {
                selectedTaskIds: selectedTaskIds,
                selectedProjectIds: selectedProjectIds,
                scale: scale,
                displayFrom: displayFrom,
                deadlineFilter: deadlineFilter,
                expandedGroups: expandedGroups,
                expandedTasks: expandedTasks
            }
        };
        
        navigate(`/project/${task.project_id}/task/${task.task_id}`, { state });
    };
    
    const handleStageClick = (task, stage, date) => {
        if (!checkDateToTask(task, date)) return;
        const state = {
            returnTo: 'Gantt',
            returnDate: formatDateForSQL(date),
            filters: {
                selectedTaskIds: selectedTaskIds,
                selectedProjectIds: selectedProjectIds,
                scale: scale,
                displayFrom: displayFrom,
                deadlineFilter: deadlineFilter,
                expandedGroups: expandedGroups,
                expandedTasks: expandedTasks
            }
        };
        
        navigate(`/project/${task.project_id}/task/${task.task_id}/stage/${stage.stage_id}`, { state });
    };
    const filteredProjects = useMemo(() => {
        return groupedTasks
        .map(project => {
            let projectTasks = project.tasks;
            if (selectedTaskIds.length === 0)
                projectTasks = [];
            else 
                projectTasks = project.tasks.filter(task => selectedTaskIds.includes(task.task_id));
            return { ...project, tasks: projectTasks };
        })
        .filter(project => project.tasks.length > 0 && (selectedProjectIds.length === 0 || selectedProjectIds.includes(project.id)));
    }, [groupedTasks, selectedTaskIds, selectedProjectIds]);

    const toggleEverything = () => {
        if (isEverythingExpanded) {
            setExpandedGroups({});
            setExpandedTasks({});
            setIsEverythingExpanded(false);
        } else {
            const allExpanded = {};
            filteredProjects.forEach(p => {allExpanded[p.id] = true;});
            setExpandedGroups(allExpanded);
            const allTasksExpanded = {};
            filteredProjects.forEach(project => {
                project.tasks.forEach(task => {allTasksExpanded[task.task_id] = true;});
            });
            setExpandedTasks(allTasksExpanded);
            setIsEverythingExpanded(true);
        }
    };
    const openModal = (modalType = null) => {
        setShowModal(true);
        setModalType(modalType);
    };
    const closeModal = () => {
        setShowModal(false);
        setModalType(null);
    };
    const getStatusColor = (code) => {
        switch(code) {
            case 'завершение':
                return '#4CAF50';
            case 'работа':
                return '#FFC107';
            case 'остановка':
                return '#FF9800';
            case 'ожидание':
                return '#9E9E9E';
            default:
                return '#c6c7c7';
        }
    };
    const getExecutionColor = (item, date) => {
        const execution = item.executions?.find(e => {
            const execDate = new Date(e.execution_date);
            return execDate.toDateString() === date.toDateString();
        });
        if (execution && execution.exec_color)
                return execution.exec_color;
        return getStatusColor('');
    };
    return (
        <div className="project-wrapper">
        <NavBar />
        {modalType === 'task_selector' && (<ModalStr show={showModal} onHide={closeModal} modalType={modalType} title="Выбор задач для отображения"
        fields={['task_selector']} users={tasks} extraData={{button: 'Применить', selectedTaskIds: selectedTaskIds, setSelectedTaskIds: setSelectedTaskIds,
            selectAllTasks: selectAllTasks, setSelectAllTasks: setSelectAllTasks}}/>)}          
        <div className="project-layout">
        <Navigate/>
        <div className="projectHistory-content">
        <div className="back-button-container">
            <button onClick={() => navigate(-1)} className="back-button">
            <img src={backIcon} className="back-icon"/>Назад</button>
        </div>
        {error && <div className="error-message">{error}</div>}
        <div className="profile-header">
            <h1 className="h1-prof">Диаграмма Ганта</h1>
        </div>
            <div className="controls-group">
                <Button variant="outline-secondary" onClick={toggleEverything}>{isEverythingExpanded ? 'Свернуть всё' : 'Развернуть всё'}</Button>
                <span className="control-label">Отображать с:</span>
                    <Form.Select value={displayFrom} onChange={(e) => setDisplayFrom(e.target.value)}>
                        <option value="today">Сегодня</option>
                        <option value="start_date">С даты начала</option>
                        <option value="created_at">С даты создания</option>
                    </Form.Select>
                <Button variant="primary" onClick={() => openModal('task_selector')}>Выбрать задачи ({selectedTaskIds.length || '0'})</Button>
                <span className="control-label">Масштаб:</span>
                    <Form.Select value={scale} onChange={(e) => setScale(e.target.value)}>
                        <option value="week">Неделя</option>
                        <option value="month">Месяц</option>
                        <option value="custom">Весь период</option>
                    </Form.Select>
                <span className="control-label">Дедлайн до:</span>
                    <Form.Control  type="date"  value={deadlineFilter || ''} onChange={(e) => setDeadlineFilter(e.target.value || null)}/>
            </div>
            
            <div className="gantt-legend">
                {executionStatus && executionStatus.map(status => (
                    <div key={status.id} className="legend-item">
                        <div className="legend-color" style={{ backgroundColor: status.exec_color ? status.exec_color : getStatusColor('')}}/>
                        <span>{status.exec_status_name}</span>
                    </div>
                ))}
                <div className="legend-item"> <div className="legend-color" style={{ backgroundColor: getStatusColor(''), border: `1px solid #dee2e6`}}></div> <span>Нет данных</span></div>
            </div>
            <div className="gantt-scroll-container">
            <div className="gantt-table">
                <div className="gantt-header">
                        <div className="gantt-col col-task">Задача / Проект</div>
                        <div className="gantt-col">Статус</div>
                        <div className="gantt-col">Дата начала</div>
                        <div className="gantt-col">Дата создания</div>
                        <div className="gantt-col">Дедлайн</div>
                        <div className="col-timeline">
                            {days.map((date, idx) => (
                                <div key={idx} className="gantt-day-header" title={date.toLocaleDateString('ru-RU')}>{date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'numeric' })}</div>
                            ))}
                        </div>
                </div>
                {filteredProjects.map(project => (
                    <React.Fragment key={project.id}>
                        <div className="gantt-project-row">
                            <div className="gantt-col col-task">
                                <Button variant="link" className="expand-btn"
                                    onClick={() => setExpandedGroups(prev => ({...prev, [project.id]: !prev[project.id]}))}>
                                    {expandedGroups[project.id] ? '▼' : '▶'}
                                </Button>
                                <strong style={{ color: project.color || '#333' }}>{project.name}</strong>
                                <span className="task-count">(задач: {project.tasks.length})</span>
                            </div>
                            <div className="gantt-col">—</div>
                            <div className="gantt-col">—</div>
                            <div className="gantt-col">—</div>
                            <div className="gantt-col">—</div>
                            <div className="col-timeline">{days.map((day, idx) => (<div key={idx} className="empty-cell"/>))}</div>
                        </div>
                        {expandedGroups[project.id] && project.tasks.map(task => (
                            <React.Fragment key={task.task_id}>
                                <div className="gantt-task-row">
                                    <div className="gantt-col col-task">
                                        {task.stages.length !== 0 && (
                                            <Button className="expand-btn" 
                                                onClick={() => setExpandedTasks(prev => ({...prev, [task.task_id]: !prev[task.task_id]}))}>
                                                {expandedTasks[task.task_id] ? '▼' : '▶'}
                                            </Button>)}
                                        <span style={{ color: project.color || '#333' }}>{task.task_name}</span>
                                        {task.stages && task.stages.length > 0 && (
                                            <span className="task-count">(этапов: {task.stages.length})</span>)}
                                    </div>
                                    <div className="gantt-col">
                                        <span className="status-badge" style={{ backgroundColor: getStatusColor(task.system_code) }}>{task.status_name}</span>
                                    </div>
                                    <div className="gantt-col">
                                        {task.min_time_period_dates_tasks ? new Date(task.min_time_period_dates_tasks).toLocaleDateString() : '—'}
                                    </div>
                                    <div className="gantt-col">
                                        {task.created_at ? new Date(task.created_at).toLocaleDateString() : '—'}
                                    </div>                                    
                                    <div className="gantt-col">
                                        {task.deadline ? new Date(task.deadline).toLocaleDateString() : '—'}
                                    </div>
                                    <div className="col-timeline">
                                        {days.map((day, idx) => (
                                            <div key={idx} className="gantt-cell" style={{ backgroundColor: getExecutionColor(task, day)}}
                                                onClick={() => handleTaskClick(task, day)} title={`${task.task_name}\n${day.toLocaleDateString()}`}/>
                                        ))}
                                    </div>
                                </div>
                                {expandedTasks[task.task_id] && task.stages && task.stages.map(stage => (
                                    <div key={stage.stage_id} className="gantt-stage-row">
                                        <div className="gantt-col col-task">
                                            <span>{stage.stage_name}</span>
                                        </div>
                                        <div className="gantt-col">
                                            <span className="status-badge" style={{ backgroundColor: getStatusColor(task.system_code) }}>{task.status_name}</span>
                                        </div>
                                        <div className="gantt-col">
                                            {task.min_time_period_dates_tasks ? new Date(task.min_time_period_dates_tasks).toLocaleDateString() : '—'}
                                        </div>
                                        <div className="gantt-col">
                                            {stage.stage_created_at ? new Date(stage.stage_created_at).toLocaleDateString() : '—'}
                                        </div>                                        
                                        <div className="gantt-col">
                                            {stage.stage_deadline ? new Date(stage.stage_deadline).toLocaleDateString() : '—'}
                                        </div>
                                        <div className="col-timeline">
                                            {days.map((day, idx) => (
                                                <div key={idx} className="gantt-cell" style={{ backgroundColor: getExecutionColor(stage, day)}}
                                                    onClick={() => handleStageClick(task, stage, day)} title={`${stage.stage_name}\n${day.toLocaleDateString()}`}/>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </React.Fragment>
                        ))}
                    </React.Fragment>
                ))}
            </div>
            </div>
        </div>
    </div>
</div>);});

export default AppStatistic;