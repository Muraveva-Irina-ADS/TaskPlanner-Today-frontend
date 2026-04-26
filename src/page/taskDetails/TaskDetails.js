import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import backIcon from '../../images/назад.png';
import { get_info_task_by_id, task_put, dates_tasks_put_for_task, get_repeat_types, repeat_task_put, dates_tasks_get_for_task, 
        status_put_for_task, get_info_dates_tasks, stage_post, get_stages_by_task_id, task_copy,
        updateStagesOrder, deleteStage, get_projects, get_profile_matrix_email, get_profile_status_email} from "../../api/commonApi";
import NavBar from '../../components/NavBar';
import { Button } from 'react-bootstrap';
import './TaskDetails.css';
import '../../styles/common.css'
import Navigate from '../../components/Navigate';
import ModalStr from '../../components/ModalStructure';
import StagesList from '../../components/StagesList';
import toast from 'react-hot-toast';

const AppTaskDetail = () => {

    const { taskId, id } = useParams();
    const [projects, setProjects] = useState([]);
    const [matrix, setMatrix] = useState([]);
    const [yourStatus, setYourStatus] = useState({});
    const [dates_tasks, SetDatesTasks] = useState({})
    const [type, setType] = useState([]);    
    const location = useLocation();
    const navigate = useNavigate();
    const [task, setTasks] = useState([]); 
    const [stages, setStages] = useState([]);    
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState(null); 
    const [formData, setFormData] = useState({});

    const taskFields = [
        { label: 'Проект:', field: 'project_name' },
        { label: 'Описание:', field: 'description' },
        { label: 'Дата и время выполнения:', field: 'execution_date' },
        { label: 'Статус:', field: 'status_name' },
        { label: 'Ячейка матрицы:', field: 'matrix_name' },
        { label: 'Дедлайн:', field: 'deadline' },
        { label: 'Количество помидоров, которое хотите потратить на выполнение задачи:', field: 'pomodoros_planned' },
        { label: 'Количество помидоров, уже затраченное на задачу:', field: 'pomodoros_spent' },
        { label: 'Дата создания задачи:', field: 'created_at' },
    ];
    if (task.system_code === 'завершение') {
        taskFields.push({label: 'Окончательный дедлайн (дата завершения задачи):', field: 'final_deadline' });
    }
    const getTasks = async () => {
        try {
            const tasks = await get_info_task_by_id(taskId, formatDateForSQL(location.state?.returnDate));
            setTasks(tasks[0]);
        } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
        }
    };
    const getStages = async () => {
        try {
            const stages = await get_stages_by_task_id(taskId, formatDateForSQL(location.state?.returnDate));
            setStages(stages);

        } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
        }
    };
    const getProjects = async () => {
        try {
            const project = await get_projects();
            setProjects(project);
        } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
        }
    };
    const getMatrix = async () => {
        try {
            const matrix = await get_profile_matrix_email();
            setMatrix(matrix);
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
    const getRepeatTypes = async () => {
        try {
            const type = await get_repeat_types();
            setType(type);
        } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
        }
    };  
    const getDatesTasks = async () => {
        try {
            const dates = await get_info_dates_tasks(taskId);
            SetDatesTasks(dates);
            return dates;
        } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
        }
    };
    useEffect(() => {
        getTasks();
        getProjects();
        getMatrix();
        getYourStatus();
        getRepeatTypes();
        getDatesTasks();
        getStages();
    }, []);
    useEffect(() => {
        if (location.state?.returnDate) {
            getTasks();
            getStages();
        }
    }, [location.state]);
    const handleGoBack = () => {
        if (location.state?.returnTo === 'Gantt') {
            navigate('/statistic', { 
                state: location.state
            });
        } else if (location.state?.returnTo === 'matrix') {
            navigate('/matrix', { 
                state: location.state
            });
        } else if (location.state?.returnTo === 'ProjectDetails') {
            navigate(`/project/${id}`, { 
                state: location.state
            });
        } else if (location.state?.returnTo === 'Project') {
            navigate(`/project`, { 
                state: location.state
            });
        }
        else if (location.state?.returnTo === 'CompleteTasks') {
                navigate('/complete', { 
                    state: location.state
                });
        }
        else if (location.state?.returnTo === 'AllTasks') {
            navigate('/all-tasks', { 
                state: location.state
            });
        }
        else if (location.state?.returnTo === 'calendar') {
            navigate('/calendar', { 
                state: location.state
            });
        }
          else {
            navigate(-1);
        }
    };
    const calculateDuration = (start, end) => {
        if (!start || !end) return null;
        if (start === '00:00:00' && end === '00:00:00') {
            return 'задача не начата в этот день';
        }
        if (end === '00:00:00') {
            return 'задача не закончена';
        }
        const [startHours, startMinutes] = start.split(':').map(Number);
        const [endHours, endMinutes] = end.split(':').map(Number);
        
        let totalMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
        if (totalMinutes < 0) {
            totalMinutes += 24 * 60;
        }
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        
        if (hours === 0) return `${minutes} мин`;
        if (minutes === 0) return `${hours} ч`;
        return `${hours} ч ${minutes} мин`;
    };
    const handleChange = (e, index = null) => {
        const { name, value, type } = e.target;
        if (name === 'repeat_type_id') {
            const numValue = Number(value);
            let newFormData = { ...formData, repeat_type_id: numValue };
            if (numValue === 1) { // Без повторения
                newFormData.number_repeat = [0];
            } else if (numValue === 2 || numValue === 6) { // Ежедневно или Ежегодно
                newFormData.number_repeat = [1];
            } else if (numValue === 3) { // Еженедельно
                newFormData.number_repeat = [1]; // понедельник по умолчанию
            } else if (numValue === 4) { // Ежемесячно
                newFormData.number_repeat = [1]; // 1 число
            } else if (numValue === 5) { // Раз в N дней
                newFormData.number_repeat = [7]; // каждые 7 дней
            }
            setFormData(newFormData);
            return;
        }
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
    const openModal = (userData = null, modalType = null) => {
        if (modalType === 'copy_task') {
            const availableProjects =projects?.filter(p => p.id !== task?.project_id && p.is_active !== false);
            const defaultProject = availableProjects?.[0];
            
            setFormData({
                project_id: defaultProject?.id || ''
            });
        } 
        else if (modalType === 'status_name') {
            setFormData({system_code: 'default'});
        } 
        else if (userData)
            setFormData({...userData});   
        else
            setFormData({}); 
        setShowModal(true);
        setModalType(modalType);
    };
    const closeModal = () => {
        setShowModal(false);
        setModalType(null);
        setFormData({});
        setError('');
    };
    const handleSave = async(isChangeDeadline = null) => {
        try {
            let value;
            if (modalType === 'project_name')
                value = 'project_id'
            else if (modalType === 'matrix_name')
                value = 'matrix_id'
            else
                value = modalType;
            if (!formData[value]) {
                setError('Все поля должны быть заполнены');
                return;
            }
            if (value === 'pomodoros_planned' && formData[value] <= 0) {
                    setError('Поле должно быть заполнено неотрицательным числом');
                    return;
            }      
            if (value === 'pomodoros_planned' && !Number.isInteger(Number(formData[value]))) {
                setError(`Количество должно быть целым числом`)      
                return;          
            }
            let data;
            if (modalType === 'deadline') 
                data = await task_put(taskId, formatDateForSQL(formData[value]), value, isChangeDeadline);
            else 
                data = await task_put(taskId, formData[value], value, false);
            if (data) {
                toast.success('Сохранено');
                closeModal();
                getTasks();
                if (modalType === 'project_name')
                    navigate('/project')
                }
        } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
        }
    }
    const formatDateForSQL = (dateValue) => {
        if (!dateValue) return null;
        const date = new Date(dateValue);
        if (isNaN(date)) return null;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
    };
    const formatTimeForSQL = (timeValue) => {
        if (!timeValue) return '00:00:00';
        if (typeof timeValue === 'string' && timeValue.includes(':')) {
            const parts = timeValue.split(':');
            if (parts.length === 3) return timeValue;
            if (parts.length === 2) return `${timeValue}:00`;
        }
        return '00:00:00';
    };
    const handleSaveDates = async() => {
        try {
            if (!formData.execution_date ||!formData.planned_start_time || !formData.planned_end_time){
                setError('Все поля должны быть заполнены');
                return;
            }
            const formattedData = {
                    ...formData,
                    execution_date: formatDateForSQL(formData.execution_date),
                    planned_start_time: formatTimeForSQL(formData.planned_start_time),
                    planned_end_time: formatTimeForSQL(formData.planned_end_time),
                    actual_start_time: formatTimeForSQL(formData.actual_start_time),
                    actual_end_time: formatTimeForSQL(formData.actual_end_time)
            };
            const data = await dates_tasks_put_for_task(formattedData);
                if (data) {
                    toast.success('Сохранено');
                    closeModal();
                    getTasks();
                    getDatesTasks();
                }
        } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
        }
    }
    const generateRepeatDates = (repeatTypeId, numberRepeat, startDate, deadline) => {
        const dates = [];
        let currentDate = new Date(startDate);
        currentDate.setHours(0, 0, 0, 0);
        const endDate = new Date(deadline);
        endDate.setHours(23, 59, 59, 999);
        const numbers = numberRepeat.map(n => Number(n));
        switch (repeatTypeId) {
          case 1:
            dates.push(new Date(currentDate));
            break;
          case 2:
            while (currentDate <= endDate) {
              dates.push(new Date(currentDate));
              currentDate.setDate(currentDate.getDate() + 1);
            }
            break;
          case 3:
            while (currentDate <= endDate) {
              const dayOfWeek = currentDate.getDay() === 0 ? 7 : currentDate.getDay(); // Преобразуем воскресенье (0) в 7
              if (numbers.includes(dayOfWeek)) {
                dates.push(new Date(currentDate));
              }
              currentDate.setDate(currentDate.getDate() + 1);
            }
            break;
          case 4:
            while (currentDate <= endDate) {
              const dayOfMonth = currentDate.getDate();
              if (numbers.includes(dayOfMonth)) {
                dates.push(new Date(currentDate));
              }
              currentDate.setDate(currentDate.getDate() + 1);
            }
            break;
          case 5:
            const interval = numbers[0] || 7;
            while (currentDate <= endDate) {
              dates.push(new Date(currentDate));
              currentDate.setDate(currentDate.getDate() + interval);
            }
            break;
            case 6:
            const repeatMonth = currentDate.getMonth() + 1;
            const repeatDay = currentDate.getDate();
            let year = currentDate.getFullYear();
            while (currentDate <= endDate) {
              dates.push(new Date(currentDate));
              year++;
              currentDate = new Date(year, repeatMonth - 1, repeatDay);
            }
            break;
          default:
            dates.push(new Date(currentDate));
        }
        const uniqueDates = [...new Set(dates.map(d => {
            const date = new Date(d);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
          }))].sort();
          
          return uniqueDates;
      }
      const handleSaveDatesAndTask = async () => {
        try {
          if (formData.system_code === 'завершение') {
            setError('Задача завершена, изменения данных полей недоступимы');
            setTimeout(() => {
                closeModal();
                setError('');
            }, 5000);
            return;
          }            
          if (!formData.execution_date) {
            setError('Все поля должны быть заполнены');
            return;
          }
          if (formData.execution_date > formatDateForSQL(formData.deadline)) {
            setError('Дата не должна быть позднее дедлайна');
            return;
          }          
          const newDates = generateRepeatDates(Number(formData.repeat_type_id), formData.number_repeat, formData.execution_date, formData.deadline);
          const updateResult = await repeat_task_put(formData.id, Number(formData.repeat_type_id), formData.number_repeat, formData.execution_date, newDates, formData.planned_start_time, formData.planned_end_time);
          if (updateResult) {
            toast.success('Сохранено');
            getTasks();
            const dates = await getDatesTasks();
            closeModal();
            if (modalType !== 'need_end') {
                if (newDates.length === 0 || new Date(task.execution_date).toLocaleDateString('ru-RU') !== new Date(newDates[0]).toLocaleDateString('ru-RU')) {
                    go_to_task(dates[dates.length - 1].execution_date)
                }
                return;            
            }          
            const data = await dates_tasks_get_for_task(taskId);            
            if (data && data.length === 1) {
                alert(`У вас единственный невыполненный срок у задачи - ${formData.execution_date}. Это текущая дата (выбранная). Измените тип повтора для создания еще сроков задач или же Завершите задачу. Если задача еще нужна, но сейчас неактуальна, Вы можете Приостановить задачу, выбрав соответствующий статус на странице с информацией о задаче`)
                return;
            }
            if (data && data.length > 1) {
                const now = new Date();
                const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`;
                    let updates = {
                        dates_tasks_id: task.dates_tasks_id,
                        task_id: task.task_id,
                        execution_date: formatDateForSQL(task.execution_date),
                        planned_start_time: task.planned_start_time,
                        planned_end_time: task.planned_end_time,
                        actual_start_time: task.actual_start_time,
                        actual_end_time: task.actual_end_time,
                        code: task.code
                    };
                        updates.code = 'выполнение';
                        updates.actual_end_time = currentTime;                  
                    const data = await dates_tasks_put_for_task(updates);
                    if (data) {
                        toast.success('Статус задачи обновлен');
                        getTasks();
                        getDatesTasks();
                        closeModal();                          
                    }
                }
          if (new Date(task.execution_date).toLocaleDateString('ru-RU') !== new Date(formData.execution_date).toLocaleDateString('ru-RU'))
            navigate(`/project/${id}`)                      
          }
        } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
        }
      };
    const Copy = async() => {
        try {
            const data = await task_copy(formData.project_id, taskId);
                if (data) {
                    toast.success('Задача скопирована');
                    closeModal();
                }
        } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
        }
    }    
    const getButtonText = () => {
        if (task.system_code === 'завершение') {
            return 'Задача завершена, взять ее в работу невозможно';
        }
        if (task.code === 'работа') {
            return `В процессе (Выполнить задачу за ${new Date(task.execution_date).toLocaleDateString('ru-RU')}?)`;
        }
        if (task.code === 'выполнение') {
            return `Задача выполнена за ${new Date(task.execution_date).toLocaleDateString('ru-RU')} (Приступить к задаче?)`;
        }
        return `Приступить к задаче за ${new Date(task.execution_date).toLocaleDateString('ru-RU')}?`;
    };
    const handleTaskStateChange = async () => {
        try {
            const now = new Date();
            const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`;
            let updates = {
                dates_tasks_id: task.dates_tasks_id,
                task_id: task.task_id,
                execution_date: formatDateForSQL(task.execution_date),
                planned_start_time: task.planned_start_time,
                planned_end_time: task.planned_end_time,
                actual_start_time: task.actual_start_time,
                actual_end_time: task.actual_end_time,
                code: task.code
            };
            if (task.system_code === 'завершение') {
                alert('Задача уже завершена. Возврат к выполнению невозможен.');
                return;
            } 
            if (task.code === 'работа') {
                try {
                    const allCompleted = stages.every(stage => stage.code === 'выполнение' || stage.code === 'отмена');
                    if (!allCompleted) {
                        alert('Есть незавершенные за этот день этапы, пожалуйста сначала выполните их, а уже потом Завершайте выполнение задачи на этот день')
                        return;
                    }
                    const data = await dates_tasks_get_for_task(taskId);
                    if (data && data.length > 1) {
                        if (window.confirm('Завершить выполнение задачи на этот день?')) {
                            updates.code = 'выполнение'
                            updates.actual_end_time = currentTime;
                        } else 
                            return
                    } else {                
                        openModal(task, 'need_end');                          
                        return
                    }
                } catch (error) {
                    console.error('Ошибка при получении дат задачи:', error);
                    setError('Не удалось проверить даты задачи');
                }
            }
            else if (task.code === 'выполнение') {
                let confirmMessage = 'Отменить выполнение и вернуть задачу в работу?';
                if (!window.confirm(confirmMessage)) return;
                updates.code = 'работа'
                updates.actual_start_time = currentTime;
                updates.actual_end_time = '00:00:00';
            } 
            else {
                let confirmMessage = 'Взять задачу в работу?';
                if (!window.confirm(confirmMessage)) return;
                updates.code = 'работа';
                updates.actual_start_time = currentTime;
            }          
            const data = await dates_tasks_put_for_task(updates);
            if (data) {
                toast.success('Статус задачи обновлен');
                getTasks();
                getDatesTasks();
            }
        } catch (e) {
            console.error('Ошибка при обновлении статуса задачи:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
        }
    };
    const handleClick = () => {
        if (task.system_code === 'остановка') {
            if (window.confirm('Задача приостановлена. Сначала поменяйте статус задачи и установите "В работе". Если хотите поменять, нажмите ОК, иначе Отмена')) {
                handlePutStatus('работа')
            }
        } else {
            handleTaskStateChange();
        }
    };
    const complete = () => {
        const allCompleted = stages.every(stage => stage.code === 'выполнение' || stage.code === 'отмена');
        if (!allCompleted) {
            alert('Есть незавершенные за этот день этапы, пожалуйста сначала выполните их, а уже потом Завершайте выполнение задачи на этот день')
            return;
        }
        handlePutStatus('завершение', true)
    }
    const handlePutStatus = async (changeTo = '', change_dates_tasks = false) => {
        if (formData.system_code === 'default') {
            setError('Поле должно быть заполнено')
            return;            
        }
        let status = ""
        if (task.system_code === 'ожидание')
            status = 'работа'
        else if (task.system_code === 'работа' || task.system_code === 'остановка')
            if (changeTo)
                status = changeTo
            else 
                status = formData.system_code
                if (status === 'завершение') {
                    const isConfirmed = window.confirm('⚠️ ВНИМАНИЕ!\n\n' + 'Вы собираетесь завершить задачу.\n' +
                        'После завершения задачу нельзя будет восстановить или изменить.\n\n' +
                        'Она будет доступна в Навигации в Завершенные задачи, где ее можно восстановить, создав полную копию задачи.\n\n' +
                        'Вы уверены, что хотите продолжить?');
                    if (!isConfirmed) {
                        return;
                    } 
                    else if (change_dates_tasks) {
                        const now = new Date();
                        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`;
                        let updates = {
                            dates_tasks_id: task.dates_tasks_id,
                            task_id: task.task_id,
                            execution_date: formatDateForSQL(task.execution_date),
                            planned_start_time: task.planned_start_time,
                            planned_end_time: task.planned_end_time,
                            actual_start_time: task.actual_start_time,
                            actual_end_time: currentTime,
                            code: 'выполнение'
                        };
                        const data = await dates_tasks_put_for_task(updates);
                            if (data)
                                getDatesTasks();
                            else {
                                setError('Ошибка изменения срока выполнения задачи')
                                return;
                            }
                    }
                }
        const data = await status_put_for_task(taskId, status);
            if (data) {
                toast.success('Статус задачи обновлен');
                getTasks();
                closeModal();
            }
    };
    const go_to_task = (selectedDate) => {
        closeModal();
        navigate(`/project/${id}/task/${taskId}`, {replace: true, state: {returnTo: 'ProjectDetails', returnDate: formatDateForSQL(selectedDate), returnIsNeedAllTasks: false}})
    };
    const handleClickPomodoro = () => {
        navigate(`/pomodoro`, {replace: true, state: {selectedTask: taskId}})
    };
    const handleCreate = async() => {
        try {
            if (!formData.stage_name || !formData.description) {
                setError('Значение поля должно быть заполнено');       
                return;         
            }
            const data = await stage_post(taskId, formData);
                if (data) {
                    toast.success('Этап добавлен');
                    closeModal();
                    getStages();
                }
        } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
        }
    }
    const handleStageClick = (stageId) => {
        navigate(`/project/${id}/task/${taskId}/stage/${stageId}`, {state: {returnTo: 'TaskDetails', returnDate: task.execution_date}})
    };
    const handleReorder = async (reorderedStages) => {
        try {
          const data = await updateStagesOrder(reorderedStages);
          if (data) {
             getStages();
          }
        } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
        }
      };
    const handleDeleteStage = async(stageId) => {
        try {
            const data = await deleteStage(stageId);
            if (data) {
                toast.success('Этап удален');
               getStages();
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
            {modalType === 'task_name' && (<ModalStr show={showModal} onHide={closeModal} modalType={modalType} title={'Название задачи'}
                        formData={formData} onChange={handleChange} onSave={handleSave} error={error} isNew={false}
                        fields={['task_name']}/>)} 
            {modalType === 'project_name' && (<ModalStr show={showModal} onHide={closeModal} modalType={modalType} title={'К какому проекту будет относиться задача'}
                        formData={formData} onChange={handleChange} onSave={handleSave} error={error} isNew={false}
                        fields={['projects_select']} users={projects?.filter(p => p.is_active !== false)}/>)}
            {modalType === 'copy_task' && (<ModalStr show={showModal} onHide={closeModal} modalType={modalType} title={'Выберете, в какой проект добавить эту задачу'}
                        formData={formData} onChange={handleChange} onSave={Copy} error={error} isNew={true}
                        fields={['projects_select']} users={projects?.filter(p => p.id !== task?.project_id && p.is_active !== false)}/>)} 
            {modalType === 'description' && (<ModalStr show={showModal} onHide={closeModal} modalType={modalType} title={'Описание задачи'}
                        formData={formData} onChange={handleChange} onSave={handleSave} error={error} isNew={false}
                        fields={['description']}/>)} 
            {modalType === 'plan_time' && (<ModalStr show={showModal} onHide={closeModal} modalType={modalType} title={'Выберите планируемое время начала и окончания выполнения задачи'}
                        formData={formData} onChange={handleChange} onSave={handleSaveDates} error={error} isNew={false}
                        fields={['planned_start_time', 'planned_end_time']}/>)}
            {modalType === 'execution_date' && (<ModalStr show={showModal} onHide={closeModal} modalType={modalType} title={'Настройте тип повторений'}
                        formData={formData} onChange={handleChange} onSave={handleSaveDatesAndTask} error={error} isNew={false}
                        fields={['execution_date', 'number_repeat']} users = {type}/>)}
            {modalType === 'status_name' && (<ModalStr show={showModal} onHide={closeModal} modalType={modalType} title={'Выберите, какой статус установить задаче'}
                        formData={formData} onChange={handleChange} onSave={() => handlePutStatus()} error={error} isNew={false}
                        fields={['status_select']} users={yourStatus?.filter(status => {
                                                    if (task.system_code === 'ожидание')
                                                        return status.system_code === 'работа';
                                                    return status.system_code !== task.system_code && status.system_code !== 'ожидание';})}/>)}            
            {modalType === 'matrix_name' && (<ModalStr show={showModal} onHide={closeModal} modalType={modalType} title={'К какой части матрицы Эйзенхауэра будет относиться задача'}
                        formData={formData} onChange={handleChange} onSave={handleSave} error={error} isNew={false}
                        fields={['matrix_select']} users={matrix}/>)} 
            {modalType === 'deadline' && (<ModalStr show={showModal} onHide={closeModal} modalType={modalType} title={'Дедлайн задачи, крайний срок выполнения'}
                        formData={formData} onChange={handleChange} onSave={handleSave} error={error} isNew={false}
                        fields={['deadline', 'deadline_task']}/>)} 
            {modalType === 'pomodoros_planned' && (<ModalStr show={showModal} onHide={closeModal} modalType={modalType} title={'Количество помидоров, которое хотите потратить на выполнение задачи'}
                        formData={formData} onChange={handleChange} onSave={handleSave} error={error} isNew={false}
                        fields={['pomodoros_planned']}/>)}                          
            {modalType === 'need_end' && (<ModalStr show={showModal} onHide={closeModal} modalType={modalType} title={'Продолжить или завершить задачу?'}
                        formData={formData} onChange={handleChange} onSave={handleSaveDatesAndTask} error={error} isNew={false}
                        fields={['need_end', 'execution_date', 'number_repeat']} users = {type} extraData={complete}/>)}   
            {modalType === 'info_dates_tasks' && (<ModalStr show={showModal} onHide={closeModal} modalType={modalType} title={'Информация о датах выполнения задачи'}
                        fields={['info_dates_tasks']} users = {dates_tasks} extraData={{button: 'OK', titleColums: ['Дата выполнения', 'Запланированное время', 'Фактическое время', 'Статус', 'Действие'],
                                                                        valueColums: ['execution_date', 'plan', 'fact', 'status', 'action'], go_to_task: go_to_task, selectDate: task.execution_date}}/>)}                                                    
            {modalType==='stage_modal' && (<ModalStr show={showModal} onHide={closeModal} modalType={modalType} title={'Создание этапа'}
                        formData={formData} onChange={handleChange} onSave={handleCreate} error={error} isNew={true}
                        fields={['stage_name', 'description']}/>)}
            <div className="project-layout">
            <Navigate/>
            <div className="projectHistory-content">
            <div className="back-button-container">
                <button onClick={handleGoBack} className="back-button">
                <img src={backIcon} className="back-icon"/>Назад</button>
            </div>
            <div className="profile-header">
                <div className="clickable-title" onClick={() => openModal(task, 'task_name')}>
                    <h1 className="h1-prof">Задача: {task.task_name}</h1>
                    <div className="edit-hint">
                        <span className="edit-icon">✎</span>
                        <span>кликните для редактирования</span>
                    </div>
                </div>
            </div>
            {task.system_code !== 'ожидание' && (<Button variant='primary' style={{height: '60px'}} onClick={handleClick}>{getButtonText()}</Button>)}
            {task.system_code === 'ожидание' && (<Button variant='primary' style={{height: '60px'}} onClick={handlePutStatus}>Взять задачу в работу?</Button>)}
            {task.system_code === 'работа' && (<Button variant='primary' style={{height: '60px'}} onClick={handleClickPomodoro}>Начать помидор</Button>)}
            {error && <div className="error-message">{error}</div>}
            {projects.length > 1 && task.system_code !== 'завершение' && (<div className="section-select">
                    <div className="display-tasks">
                        <h2 className="h1-prof">Вы можете скопировать задачу в другой проект, будет создана полная копия вашей задачи, но относиться она будет к другому проекту. Скопировать?</h2>
                    </div>
                <Button variant="primary" onClick={() => openModal([], 'copy_task')}>Скопировать</Button>
            </div>)}
            
            {taskFields.map((item, index) => (<>
                {item.field === 'execution_date' ? (
                    <div className="section-select">
                        <div className="display-tasks" >
                            <h2 className="h1-prof">{item.label}</h2>
                            <div className="message-block-time">
                                <div className="mt-3 mb-3 p-4 modal-input message-block" onClick={() => {openModal(task, item.field);}}>
                                <span className="message-text">{new Date(task.execution_date).toLocaleDateString('ru-RU')}</span>
                                </div>
                                <div className="mt-3 mb-3 p-4 modal-input message-block" onClick={() => {openModal(task, item.field);}}>
                                    <div className="display-tasks">
                                        <span className="message-text">Тип повторения:</span>
                                        <span className="message-text">{type.find(t => t.id === task.repeat_type_id)?.type_name}</span>
                                        {task.number_repeat && task.number_repeat.length > 0 && (
                                            <span className="message-text">
                                                {task.repeat_type_id === 5 ? `(каждые ${task.number_repeat[0]} дн.)` : ''}
                                                {task.repeat_type_id === 4 ? `(числа: ${task.number_repeat.join(', ')})` : ''}
                                            </span>
                                        )}
                                    </div>
                                </div>     
                                <div className="mt-3 mb-3 p-4 modal-input message-block" onClick={() => {openModal(task, 'plan_time');}}>
                                    <div className="display-tasks">
                                        <span className="message-text">Запланированное время:</span>
                                        <span className="message-text">{task.planned_start_time?.substring(0, 5)} - {task.planned_end_time?.substring(0, 5)}</span>
                                        <span className="message-text">({calculateDuration(task.planned_start_time, task.planned_end_time)})</span>
                                    </div>
                                </div>
                                <div className="mt-3 mb-3 p-4 modal-input message-block" >    
                                    <div className="display-tasks">
                                        <span className="message-text">Фактическое время:</span>
                                        <span className="message-text">{task.actual_start_time?.substring(0, 5)} - {task.actual_end_time?.substring(0, 5)}</span>
                                        <span className="message-text">({calculateDuration(task.actual_start_time, task.actual_end_time)})</span>
                                    </div>
                                </div> 
                                <div className="mt-3 mb-3 p-4 modal-input message-block" >    
                                    <Button variant='primary' style={{width: '100%'}} onClick={() => openModal(null, 'info_dates_tasks')}>Посмотреть информацию о всех датах выполнения задачи</Button>
                                </div>                                                          
                            </div>
                        </div>
                    </div>
                ) : (
                <div key={index} className="section-select">
                    <div className="display-tasks">
                        <h2 className="h1-prof">{item.label}</h2>
                        <div className={`mt-3 mb-3 p-4 modal-input ${item.field === 'created_at' || item.field === 'final_deadline' || item.field === 'pomodoros_spent' ? '' : 'message-block'}`} onClick={() => {
                                    if (item.field === 'created_at' || item.field === 'final_deadline' || item.field === 'pomodoros_spent') {
                                        return;
                                    }
                                    if ((item.field === "project_name" && projects.length > 1) || (item.field === "description") || item.field === "matrix_name" || item.field === "deadline" || (item.field === "status_name" && task.system_code !== 'завершение') || item.field === "pomodoros_planned") {
                                        openModal(task, item.field);
                                    } else if (task.system_code === 'завершение')
                                        alert('Задача завершена, поменять статус вы не можете. Если хотите, вы можете скопировать задачу (создать полную копию этой задачи) на этой странице или же восстановить задачу в Навигации в разделе Завершенные задачи (также создать полную копию)')
                                }}>
                            <p className="message-text">{item.field === 'pomodoros_planned' && task[item.field] === -1 
                                ? 'Введите количество' : (item.field.includes('date') || item.field.includes('_at') || item.field.includes('deadline') 
                                ? new Date(task[item.field]).toLocaleDateString('ru-RU') : task[item.field])}
                            </p>
                        </div>
                    </div>
                </div>
            )}</>))}
            {task.system_code !== 'завершение' && (<div className="text-end mb-3">
                <Button variant="primary" style={{height: '60px'}} onClick={() => openModal(null, 'stage_modal')}>Добавить этап</Button>
            </div>)}
            <div>
                {stages.length > 0 ? (
                    <StagesList stages={stages} onReorder={handleReorder} onDelete={handleDeleteStage} onStage={handleStageClick} />
                ) : (
                    <div className="project-card" style={{ textAlign: 'center', color: 'red' }}>
                        У вас нет этапов. Для создания нажмите на кнопку добавить этап
                    </div>
                )}
            </div>
        </div>
        </div>
        </div>
    );
};

export default AppTaskDetail;