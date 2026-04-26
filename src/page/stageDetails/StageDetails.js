import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import backIcon from '../../images/назад.png';
import { get_info_stage_by_id, stage_put, dates_stages_put_for_stage, status_put_for_task, get_info_dates_stages} from "../../api/commonApi";
import NavBar from '../../components/NavBar';
import { Button } from 'react-bootstrap';
import './StageDetails.css';
import '../../styles/common.css'
import Navigate from '../../components/Navigate';
import ModalStr from '../../components/ModalStructure';
import toast from 'react-hot-toast';

const AppStageDetail = () => {

    const { id, taskId, stageId } = useParams();   
    const location = useLocation();
    const navigate = useNavigate(); 
    const [dates_stages, SetDatesStages] = useState({})
    const [stage, setStage] = useState([]);    
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState(null); 
    const [formData, setFormData] = useState({});

    const stageFields = [
        { label: 'Задача:', field: 'task_name' },
        { label: 'Описание:', field: 'description' },
        { label: 'Дата и время выполнения:', field: 'execution_date' },
        { label: 'Дедлайн:', field: 'deadline' },
        { label: 'Количество помидоров, которое хотите потратить на выполнение этапа:', field: 'pomodoros_planned' },
        { label: 'Количество помидоров, уже затраченное на этап:', field: 'pomodoros_spent' },
        { label: 'Дата создания этапа:', field: 'created_at' },
    ];
    if (stage.system_code === 'завершение') {
        stageFields.push({label: 'Окончательный дедлайн (дата завершения задачи):', field: 'final_deadline' });
    }
    const getStage = async () => {
        try {
            const stages = await get_info_stage_by_id(stageId, formatDateForSQL(location.state?.returnDate));
            setStage(stages);
        } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
        }
    }; 
    const getDatesStages = async () => {
        try {
            const dates = await get_info_dates_stages(stageId);
            SetDatesStages(dates);
        } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
        }
    };
    useEffect(() => {
        getStage();
        getDatesStages();
    }, []);
    useEffect(() => {
        if (location.state?.returnDate) {
            getStage();
        }
    }, [location.state]);
    const handleGoBack = () => {
        if (location.state?.returnTo === 'Gantt') {
            navigate('/statistic', { 
                state: location.state
            });
        } else if (location.state?.returnTo === 'Project') {
            navigate(`/project`, { 
                state: location.state
            });
        } else
        navigate(`/project/${id}/task/${taskId}`, { 
            state: location.state
        });
    };
    const calculateDuration = (start, end) => {
        if (!start || !end) return null;
        if (start === '00:00:00' && end === '00:00:00') {
            return 'этап не начат в этот день';
        }
        if (end === '00:00:00') {
            return 'этап не закончен';
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
        if (userData)
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
    const handleSave = async() => {
        try {
            let value = modalType;
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
            if (value === 'deadline')
                data = await stage_put(stageId, formatDateForSQL(formData[value]), value);
            else 
                 data = await stage_put(stageId, formData[value], value);
                if (data) {
                    toast.success('Сохранено');
                    closeModal();
                    getStage();
                    getDatesStages();
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
            if (!formData.planned_start_time || !formData.planned_end_time){
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
            const data = await dates_stages_put_for_stage(formattedData);
                if (data) {
                    toast.success('Сохранено');
                    closeModal();
                    getStage();
                    getDatesStages();
                }
        } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
        }
    }   
    const getButtonText = () => {
        if (stage.system_code === "завершение") {
            return 'Задача завершена, взять в работу этап невозможно';
        }
        if (stage.stage_code === "работа") {
            return `В процессе (Выполнить этап за ${new Date(stage.execution_date).toLocaleDateString('ru-RU')}?)`;
        }
        if (stage.stage_code === "выполнение") {
            return `Этап выполнен за ${new Date(stage.execution_date).toLocaleDateString('ru-RU')} (Приступить к этапу?)`;
        }
        return `Приступить к этапу за ${new Date(stage.execution_date).toLocaleDateString('ru-RU')}?`;
    };
    const handleStageStateChange = async () => {
        try {
            const now = new Date();
            const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`;
            let updates = {
                dates_stages_id: stage.dates_stages_id,
                stage_id: stage.id,
                execution_date: formatDateForSQL(stage.execution_date),
                planned_start_time: stage.planned_start_time,
                planned_end_time: stage.planned_end_time,
                actual_start_time: stage.actual_start_time,
                actual_end_time: stage.actual_end_time,
                code: stage.stage_code
            };
            if (stage.system_code === "завершение") {
                alert('Задача уже завершена. Возврат к выполнению этапа невозможен.');
                return;
            } 
            if (stage.stage_code === "работа") {
                if (window.confirm('Завершить выполнение этапа?')) {
                        updates.code = "выполнение"
                        updates.actual_end_time = currentTime;
                } else 
                    return
            }
            else if (stage.stage_code === "выполнение") {
                if (!window.confirm('Отменить выполнение и вернуть этап в работу?')) return;
                updates.code = "работа"
                updates.actual_start_time = currentTime;
                updates.actual_end_time = '00:00:00';
            } 
            else {
                if (!window.confirm('Взять этап в работу?')) return;
                updates.code = "работа"
                updates.actual_start_time = currentTime;
            }          
            const data = await dates_stages_put_for_stage(updates);
            if (data) {
                toast.success('Статус этапа обновлен');
                getStage();
                getDatesStages();
            }
        } catch (e) {
            console.error('Ошибка при обновлении статуса задачи:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
        }
    };
    const handleClickCansel = async (stage) => {
        try {
            let updates = {
                dates_stages_id: stage.id,
                stage_id: stage.stage_id,
                execution_date: formatDateForSQL(stage.execution_date),
                planned_start_time: stage.planned_start_time,
                planned_end_time: stage.planned_end_time,
                actual_start_time: '00:00:00',
                actual_end_time: '00:00:00',
                code: stage.code
            }; 
            if (stage.code === 'отмена')
                updates.code = 'ожидание'
            else
                updates.code = 'отмена'
            const data = await dates_stages_put_for_stage(updates);
            if (data) {
                toast.success('Статус этапа обновлен');
                getStage();
                getDatesStages();
            }
        } catch (e) {
            console.error('Ошибка при обновлении статуса задачи:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
        }
    };
    const handleClick = () => {
        if (stage.system_code === 'остановка') {
            if (window.confirm('Задача приостановлена. Сначала поменяйте статус задачи и установите "В работе". Если хотите поменять, нажмите ОК, иначе Отмена')) {
                handlePutStatus()
            } 
        } else if (stage.task_code !== 'работа' && stage.task_code !== 'выполнение') {
                if (window.confirm(`Задача не начата за ${new Date(stage.execution_date).toLocaleDateString('ru-RU')}. Сначала приступите к задаче. Для перехода нажмите к задаче нажмите ОК, иначе Отмена`))
                    navigate(`/project/${id}/task/${taskId}`, { 
                        state: location.state
                    })
                return;
        } else {
            handleStageStateChange();
        }
    };
    const handlePutStatus = async () => {
        try {
            const data = await status_put_for_task(taskId, 'работа');
            if (data) {
                toast.success('Статус задачи обновлен');
                getStage();
                getDatesStages();
                closeModal();
            }
        } catch (e) {
            console.error('Ошибка при обновлении статуса задачи:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
        }
    };
    const handleClickPomodoro = () => {
        navigate(`/pomodoro`, {replace: true, state: {selectedTask: taskId, selectedStage: stageId}})
    };
    const go_to_task = (selectedDate) => {
        closeModal();
        navigate(`/project/${id}/task/${taskId}/stage/${stageId}`, {replace: true, state: {returnTo: 'TaskDetails', returnDate: formatDateForSQL(selectedDate)}})
    };
    return (
        <div className="project-wrapper">
            <NavBar />
            {modalType === 'stage_name' && (<ModalStr show={showModal} onHide={closeModal} modalType={modalType} title={'Название этапа'}
                        formData={formData} onChange={handleChange} onSave={handleSave} error={error} isNew={false}
                        fields={['stage_name']}/>)} 
            {modalType === 'description' && (<ModalStr show={showModal} onHide={closeModal} modalType={modalType} title={'Описание этапа'}
                        formData={formData} onChange={handleChange} onSave={handleSave} error={error} isNew={false}
                        fields={['description']}/>)} 
            {modalType === 'plan_time' && (<ModalStr show={showModal} onHide={closeModal} modalType={modalType} title={'Выберите планируемое время начала и окончания выполнения этапа'}
                        formData={formData} onChange={handleChange} onSave={handleSaveDates} error={error} isNew={false}
                        fields={['planned_start_time', 'planned_end_time']}/>)}           
            {modalType === 'deadline' && (<ModalStr show={showModal} onHide={closeModal} modalType={modalType} title={'Дедлайн этапа, крайний срок выполнения'}
                        formData={formData} onChange={handleChange} onSave={handleSave} error={error} isNew={false}
                        fields={['deadline']}/>)} 
            {modalType === 'pomodoros_planned' && (<ModalStr show={showModal} onHide={closeModal} modalType={modalType} title={'Количество помидоров, которое хотите потратить на выполнение этапа'}
                        formData={formData} onChange={handleChange} onSave={handleSave} error={error} isNew={false}
                        fields={['pomodoros_planned']}/>)}    
            {modalType === 'info_dates_stages' && (<ModalStr show={showModal} onHide={closeModal} modalType={modalType} title={'Информация о датах выполнения этапа'}
                        fields={['info_dates_tasks']} users = {dates_stages} extraData={{button: 'OK', titleColums: ['Дата выполнения', 'Запланированное время', 'Фактическое время', 'Статус', 'Действие'],
                                                                        valueColums: ['execution_date', 'plan', 'fact', 'status', 'action'], go_to_task: go_to_task, selectDate: stage.execution_date, clickCancel: handleClickCansel}}/>)}                                                                         
            <div className="project-layout">
            <Navigate/>
            <div className="projectHistory-content">
            <div className="back-button-container">
                <button onClick={handleGoBack} className="back-button">
                <img src={backIcon} className="back-icon"/>Назад</button>
            </div>
            <div className="profile-header">
                <div className="clickable-title" onClick={() => openModal(stage, 'stage_name')}>
                    <h1 className="h1-prof">Этап: {stage.stage_name}</h1>
                    <div className="edit-hint">
                        <span className="edit-icon">✎</span>
                        <span>кликните для редактирования</span>
                    </div>
                </div>
            </div>
            {stage.system_code !== 'ожидание' && stage.stage_code !== 'отмена' && (<Button variant='primary' style={{height: '60px'}} onClick={handleClick}>{getButtonText()}</Button>)}
            {stage.system_code === 'ожидание' && stage.stage_code !== 'отмена' && (<Button variant='primary' style={{height: '60px'}} onClick={handlePutStatus}>Взять задачу в работу?</Button>)}
            {stage.system_code === 'работа' && stage.stage_code !== 'отмена' && (<Button variant='primary' style={{height: '60px'}} onClick={handleClickPomodoro}>Начать помидор</Button>)}
            {error && <div className="error-message">{error}</div>}
            {stageFields.map((item, index) => (<>
                {item.field === 'execution_date' ? (
                    <div className="section-select">
                        <div className="display-tasks" >
                            <h2 className="h1-prof">{item.label}</h2>
                            <div className="message-block-time">
                                <div className="mt-3 mb-3 p-4 modal-input">
                                    <span className="message-text">{new Date(stage.execution_date).toLocaleDateString('ru-RU')}</span>
                                </div>  
                                <div className="mt-3 mb-3 p-4 modal-input message-block" onClick={() => {openModal(stage, 'plan_time');}}>
                                    <div className="display-tasks">
                                        <span className="message-text">Запланированное время:</span>
                                        <span className="message-text">{stage.planned_start_time?.substring(0, 5)} - {stage.planned_end_time?.substring(0, 5)}</span>
                                        <span className="message-text">({calculateDuration(stage.planned_start_time, stage.planned_end_time)})</span>
                                    </div>
                                </div>
                                <div className="mt-3 mb-3 p-4 modal-input message-block" >    
                                    <div className="display-tasks">
                                        <span className="message-text">Фактическое время:</span>
                                        <span className="message-text">{stage.actual_start_time?.substring(0, 5)} - {stage.actual_end_time?.substring(0, 5)}</span>
                                        <span className="message-text">({calculateDuration(stage.actual_start_time, stage.actual_end_time)})</span>
                                    </div>
                                </div> 
                                <div className="mt-3 mb-3 p-4 modal-input message-block" >    
                                    <Button variant='primary' style={{width: '100%'}} onClick={() => openModal(null, 'info_dates_stages')}>Посмотреть информацию о всех датах выполнения задачи</Button>
                                </div>                                                       
                            </div>
                        </div>
                    </div>
                ) : (
                <div key={index} className="section-select">
                    <div className="display-tasks">
                        <h2 className="h1-prof">{item.label}</h2>
                        <div className={`mt-3 mb-3 p-4 modal-input ${item.field === 'created_at' || item.field === 'final_deadline' || item.field === 'pomodoros_spent' || item.field === 'task_name' ? '' : 'message-block'}`} onClick={() => {
                                    if (item.field === 'created_at' || item.field === 'final_deadline' || item.field === 'pomodoros_spent' || item.field === 'task_name') {
                                        return;
                                    }
                                    openModal(stage, item.field);
                                    }}>
                            <p className="message-text">{item.field === 'pomodoros_planned' && stage[item.field] === -1 
                                ? 'Введите количество' : (item.field.includes('date') || item.field.includes('_at') || item.field.includes('deadline') 
                                ? new Date(stage[item.field]).toLocaleDateString('ru-RU') : stage[item.field])}
                            </p>
                        </div>
                    </div>
                </div>
            )}</>))}
        </div>
        </div>
        </div>
    );
};

export default AppStageDetail;