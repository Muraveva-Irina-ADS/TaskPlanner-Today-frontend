import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import backIcon from '../../images/назад.png'; 
import { Context } from '../../index';
import { get_project_by_id, get_tasks_by_id, get_export_date_from_dates_tasks_history, task_post, deleteTask, project_put, 
    get_profile_matrix_email} from "../../api/commonApi";
import NavBar from '../../components/NavBar';
import { Button, Form, InputGroup, FormControl} from 'react-bootstrap';
import './ProjectDetails.css';
import '../../styles/common.css'
import Navigate from '../../components/Navigate';
import ModalStr from '../../components/ModalStructure';
import WeekNavigate from '../../components/WeekNavigate';
import toast from 'react-hot-toast';

const AppProjectDetail = () => {
    const { user } = useContext(Context);
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState([]);
    const [tasks, setTasks] = useState([]); 
    const [matrix, setMatrix] = useState([]);     
    const [showModal, setShowModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [modalType, setModalType] = useState(null);  
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({});
    const [isNeedAllTasks, setIsNeedAllTasks] = useState(true);
    const [filterField, setFilterField] = useState('task_name');
    const [filterValue, setFilterValue] = useState('');
    const [filteredTasks, setFilteredTasks] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [lastExportDate, setLastExportDate] = useState('');
    const location = useLocation();
    
    //Получение информации о проекте пользователя
    const getProject = async () => {                                   
        try {
            const project = await get_project_by_id(id);
            setProject(project[0]);
        } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
    }};
    //Получение информации о задачах пользователя выбранного на странице списка проектов проекта
    const getTasks = async () => {                  
        try {
            const tasks = await get_tasks_by_id(id);
            setTasks(tasks);
        } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
    }};
    //Получение информации о матрице пользователя для отображения этих данных в модальном окне при создании задачи
    const getMatrix = async () => { 
        try {
            const m = await get_profile_matrix_email(0);
            setMatrix(m)
            return m;
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
        getProject();
        getTasks();
        get_exportDateTasks();
        setIsNeedAllTasks(true);
    }, []);
    //Хук useEffect для фильтрации списка задач в массив filteredTasks
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
            setFilteredTasks(filtered);
        } else {
            setFilteredTasks([]);
        }
    }, [tasks, filterField, filterValue]);    
    //Хук useEffect, который вызывается, при изменении значений location.state
    useEffect(() => {                   
        if (location.state?.returnTo === 'ProjectDetails') {
            setSelectedDate(new Date(location.state.returnDate));
            setIsNeedAllTasks(location.state.returnIsNeedAllTasks);
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state]);
    //Вызывает функцию navigate для перехода на страницу задачи
    const handleTaskClick = (projectId, taskId) => {                
        if (!isNeedAllTasks)
            navigate(`/project/${projectId}/task/${taskId}`, {state: {returnTo: 'ProjectDetails', returnDate: selectedDate,
                returnIsNeedAllTasks: isNeedAllTasks}})
        else
            navigate(`/project/${projectId}/task/${taskId}`, {state: {returnTo: 'ProjectDetails', returnDate: new Date(Math.min(...tasks
                .filter(task => task.id === taskId && task.execution_date && task.code !== 'выполнение')
                .map(task => new Date(task.execution_date)))), returnIsNeedAllTasks: isNeedAllTasks}})
    };
    //Функция для изменения состояния полей формы в модальном окне
    const handleChange = (e, index = null) => {                      
        const { name, value, type } = e.target;
        if (index !== null && Array.isArray(formData)) {
            const updatedArray = [...formData];
            updatedArray[index] = {...updatedArray[index], [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value};
            setFormData({...formData});
        } else {
            if (type === 'number') {
                setFormData(prev => ({...prev, [name]: value === '' ? '' : Number(value)}));
            } else {
                setFormData(prev => ({...prev, [name]: value}));
            }
    }};
    //Функция открытия модального окна
    const openModal = async (userData = null, modalType = null) => {            
        setModalType(modalType);    
        if(userData) {
            setFormData({...userData});
            setSelectedProject(userData);       
        } else {
            if (modalType === 'project_modal')
                setFormData({color: '#c3c1ec', is_active: true});
            else if (modalType === 'task_modal') {
                let matrix = await getMatrix();
                if (matrix)          
                    setFormData({task_name: '', description: '', matrix_id: matrix[0].id, deadline: new Date()});           
            }
        }
        setShowModal(true);
        setError('');
    };    
    //Функция закрытия модального окна
    const closeModal = () => {                                                  
        setShowModal(false);
        setSelectedProject(null);
        setModalType(null);
        setError('');
    };
    //Валидация полей проекта и вызов API-функции для изменения данных в таблице projects (проекты)
    const handleSaveProject = async() => {              
        try {
            if (!formData.project_name || !formData.description) {
                setError('Значение поля должно быть заполнено');       
                return;         
            }         
            const data = await project_put(selectedProject.id, formData);
                if (data) {
                    toast.success('Сохранено');
                    closeModal();
                    getProject();
                }
        } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
        }
    }
    //Валидация полей задачи и вызов API-функции для добавления данных в таблице tasks (задачи)
    const handleCreateTask = async() => {               
        try {
            if (!formData.task_name || !formData.description || !formData.deadline) {
                setError('Значение поля должно быть заполнено');       
                return;         
            }
            const data = await task_post(id, formData);
                if (data) {
                    toast.success('Задача добавлена');
                    closeModal();
                    getTasks();
                }
        } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
        }
    } 
    //Вызов API-функции для удаления данных из таблицы tasks (задачи)  
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
    }};
    //Фильтрует список задач, чтобы все задачи были уникальны, без дубликатов (в режиме «все задачи») или только за выбранную дату
    const getFilteredUniqueTasks = () => {
        if (!filteredTasks || !Array.isArray(filteredTasks)) return [];
        return filteredTasks.reduce((unique, task) => {
            if (isNeedAllTasks) {
                const exists = unique.some(t => t.id === task.id);
                if (!exists) {
                    unique.push(task);
                }
            } else {
                const taskDate = new Date(task.execution_date).toDateString();
                const selectedDateStr = selectedDate.toDateString();
                if (taskDate === selectedDateStr) {
                    unique.push(task);
                }
            }
            return unique;
    }, []);};
    //Отображается диалоговое окно подтверждения удаления задачи и при согласии пользователя вызывает функцию handleDeleteTask
    const confirmDeleteProject = (e, task) => {
        e.stopPropagation();
        if (window.confirm(`Задача ${task.task_name} будет удалена без возможности восстановления. Продолжить?`)) {
            handleDeleteTask(task.id);
        }
    };
    return (
        <div className="project-wrapper">
            <NavBar />
            <div className="project-layout">
                <Navigate/>
                <div className="project-content">
                    {/*Кнопка Назад*/}
                    <div className="back-button-container">
                        <button onClick={() => navigate('/project')} className="back-button">
                        <img src={backIcon} className="back-icon"/>Назад</button>
                    </div>
                    {modalType==='project_modal' && (<ModalStr show={showModal} onHide={closeModal} modalType={modalType} 
                        title={'Редактирование проекта'} formData={formData} onChange={handleChange} onSave={handleSaveProject} error={error} 
                        isNew={false} fields={['project_name', 'description', 'is_active', 'color']}/>)}
                    {modalType==='task_modal' && (<ModalStr show={showModal} onHide={closeModal} modalType={modalType} title={'Создание задачи'}
                        formData={formData} onChange={handleChange} onSave={handleCreateTask} error={error} isNew={true}
                        fields={['task_name', 'description', 'matrix_select', 'deadline']} users={matrix}/>)} 
                    {/*Заголовок страницы*/}
                    <div className="profile-header">
                        <h1 className="h1-prof">Проект: {project.project_name}</h1>
                    </div>                       
                    <Button variant="primary" style={{height: '60px'}} onClick={() => openModal(project, 'project_modal')}>Редактировать проект</Button>
                    <WeekNavigate onDateSelect={setSelectedDate} selectedDate={selectedDate} title="Задачи" isNeedAllTasks={isNeedAllTasks} 
                        setIsNeedAllTasks={setIsNeedAllTasks} lastExportDate={lastExportDate}/>
                    {/*Кнопка Создать задачу, отображается когда проект активен*/}    
                    <div className="text-end mb-3">
                        {((!isNeedAllTasks && new Date(selectedDate).setHours(0,0,0,0) >= new Date().setHours(0,0,0,0)) || isNeedAllTasks) && (
                            project.is_active ? (
                                <Button variant="primary" style={{height: '60px'}} onClick={() => openModal(null, 'task_modal')}>
                                    Создать новую задачу</Button>) : (
                                <Button variant="secondary" style={{height: '60px', opacity: 0.7}} 
                                    onClick={() => alert('Чтобы создать задачу, проект должен быть активен. Отредактируйте проект.')}>
                                    Создать новую задачу</Button>))}
                    </div> 
                    {error && <div className="error-message">{error}</div>}
                    {/*Блок фильтрации*/}
                    <div className="filter-section">
                        <div className="section-select">
                            <h2 className="h1-prof">Фильтрация</h2>
                            <InputGroup className="mb-3">
                            <InputGroup.Text className="field-label">Поле для фильтрации</InputGroup.Text>
                            <Form.Select className="mt-3 select" value={filterField} onChange={(e) => setFilterField(e.target.value)}>
                                <option value="task_name">Название</option>
                                <option value="description">Описание</option>              
                                <option value="status_name">Статус</option>
                                <option value="matrix_id">Название части матрицы Эйзенхауэра</option>
                                <option value="deadline">Дедлайн</option>
                                <option value="created_at">Создан</option>
                                <option value="repeat_type_id">Тип повторения задачи</option>
                                <option value="execution_date">Дата выполнения</option>
                            </Form.Select>
                            <InputGroup.Text className="field-label">Значение</InputGroup.Text>
                            <FormControl className="mt-3 select" placeholder="Введите значение для поиска..."
                                value={filterValue} onChange={(e) => setFilterValue(e.target.value)} />
                            </InputGroup>
                        </div>
                    </div>
                    <div className="projects-grid">
                        {/*Карточка задачи*/}
                        {getFilteredUniqueTasks().map((task) => (
                            <div key={task.id} className="project-card" onClick={() => handleTaskClick(task.project_id, task.id)}>
                                <div className="project-header">
                                    <h3 className="project-name">{task.task_name}</h3>
                                    <div className="header-right">
                                        <span className={`project-status active`}>{task.status_name}</span>
                                        <Button variant="primary" className="btn-delete" onClick={(e) => confirmDeleteProject(e, task)}>Удалить</Button>
                                    </div>
                                </div>                
                                <p className="project-description">{task.description}</p>
                                <p className="project-description">Дата создания: {new Date(task.created_at).toLocaleDateString('ru-RU')}</p>
                                <p className="project-description">Дедлайн: {new Date(task.deadline).toLocaleDateString('ru-RU')}</p>
                            </div>
                        ))}  
                        {filteredTasks.length === 0 && (<div className="project-card" style={{ textAlign: 'center', color: 'red' }}>Нет данных для отображения</div>)}
                    </div>
                </div>
            </div>
        </div>
    );};
export default AppProjectDetail;