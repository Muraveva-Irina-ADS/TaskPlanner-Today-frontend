import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { get_stages, get_tasks_name, pomodoro_post, get_profile_settings_email} from "../../api/commonApi";
import NavBar from '../../components/NavBar';
import { Button } from 'react-bootstrap';
import './Pomodoro.css';
import '../../styles/common.css'
import Navigate from '../../components/Navigate';
import HelpTip from '../../components/HelpTip';
import backgroundImage from '../../images/фон_помодоро.webp';
import { workQuotes, breakQuotes } from '../../motivation/PomodoroPhrases';

const AppPomodoro = () => {
    const [tasks, setTasks] = useState([]); 
    const [stages, setStages] = useState([]);
    const [yourSettings, setYourSettings] = useState();
    const [error, setError] = useState('');
    const location = useLocation();
    const [selectedTask, setSelectedTask] = useState(0);
    const [selectedStage, setSelectedStage] = useState(0);    
    const [timerState, setTimerState] = useState('idle');
    const [timerDurations, setTimerDurations] = useState({pomodoro: 25 * 60, break: 5 * 60});
    const [timeLeft, setTimeLeft] = useState(2 * 60);
    const [timerMode, setTimerMode] = useState('pomodoro');
    const [isTimerOnly, setIsTimerOnly] = useState(false);  
    const [pomodoroFields, setPomodoroFields] = useState({task_id: 0, stage_id: 0, pomodoro_date: '1970-01-01', start_time: null, end_time: null, duration: 11, was_interrupted: false});
    const [currentQuote, setCurrentQuote] = useState({ text: '', author: '' });  
    
    //Получение информации о списке задач пользователя со статусом "работа"
    const getTasks = async () => {
        try {
            const tasks = await get_tasks_name();
            setTasks(tasks);
        } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
    }};
    //Получение информации об этапах у задач пользователя со статусом "работа"
    const getStages = async () => {
        try {
            const stages = await get_stages();
            setStages(stages);
        } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
    }};   
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
    //Возвращает название задачи из списка tasks по id
    const getTaskNameById = (taskId) => {
        if (!taskId || taskId === '0') return '';
        const task = tasks.find(t => t.id === parseInt(taskId));
        return task?.task_name || '';
    };
    //Возвращает название этапа из списка stages по id
    const getStageNameById = (stageId) => {
        if (!stageId || stageId === '0') return '';
        const stage = stages.find(t => t.id === parseInt(stageId));
        return stage?.stage_name || '';
    }; 
    //Хук useEffect, в котором вызываются функции для получения данных из базы данных с помощью API-функций   
    useEffect(() => {
        getTasks();
        getYourSettings();
        getStages();
    }, []);
    //Хук useEffect, который при загрузке настроек пользователя инициализирует таймер, устанавливая начальное время помидора и длительности интервалов
    useEffect(() => {
        if (yourSettings) {
            setTimeLeft(yourSettings.pomodoro_duration * 60);
            setTimerDurations({
                pomodoro: yourSettings.pomodoro_duration * 60,
                break: yourSettings.rest_duration * 60
            });
        }
    }, [yourSettings]);
    //Хук useEffect, который вызывается, при изменении значений location.state
    useEffect(() => {
        if (location.state) {
            setSelectedTask(location.state.selectedTask);
            if (location.state.selectedStage)
                setSelectedStage(location.state.selectedStage)
        }
    }, [location.state]);
    // Хук useEffect, который управляет работой таймера. При состоянии 'running' запускает обратный отсчёт, а по достижении нуля вызывает функцию завершения таймера
    useEffect(() => {
        let interval;
        if (timerState === 'running') {
            interval = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        handleTimerComplete(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timerState]);
    //Воспроизводит короткий звуковой сигнал
    const beep = () => {
        const audioContext = new (window.AudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.6);
    };
    //Функция для завершения помидора или отдыха с вызовом функции beep() и добавление информации о помидоре в базу данных с помощью вызова API-функции
    const handleTimerComplete = async(pomodoro_was_interrupted) => {
        try {
            if (timerMode === 'pomodoro') {
                setTimerState('idle');
                if (timerMode === 'pomodoro') {
                    setTimerMode('break');
                    setTimeLeft(timerDurations.break);
                } else {
                    setTimerMode('pomodoro');
                    setTimeLeft(timerDurations.pomodoro);
                }
                const endTime = new Date();
                beep();
                const data = await pomodoro_post(pomodoroFields.task_id, pomodoroFields.stage_id, pomodoroFields.pomodoro_date, pomodoroFields.start_time, formatDateTimeForSQL(endTime), pomodoroFields.duration, pomodoro_was_interrupted);
                if (data) {
                    console.log('Добавлен помодор');
                    setError('')
                }
                setPomodoroFields({task_id: 0, stage_id: 0, pomodoro_date: '1970-01-01', start_time: null, end_time: null, duration: 11, was_interrupted: false});
            } else {
                beep();
                setTimerState('idle');
                if (timerMode === 'pomodoro') {
                    setTimerMode('break');
                    setTimeLeft(timerDurations.break);
                } else {
                    setTimerMode('pomodoro');
                    setTimeLeft(timerDurations.pomodoro);
                }                
            }    
        } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
    }};
    //Выводит предупреждение перед завершением таймера, если пользователь нажал кнопку "Стоп"
    const handleStopTimer = () => {
        if (window.confirm('Вы уверены, что хотите прервать помидор?')) {
            handleTimerComplete(true)
        }
    };
    //Преобразует количество секунд в формат времени ММ:СС
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
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
    //Функция для представления даты в формате YYYY-MM-DD и времени
    const formatDateTimeForSQL = (date) => {
        if (!date) return null;
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };
    //Рандомный выбор фразы
    const updateQuote = (mode) => {
        const quotes = mode === 'pomodoro' ? workQuotes : breakQuotes;
        const randomIndex = Math.floor(Math.random() * quotes.length);
        const quote = quotes[randomIndex];
        setCurrentQuote(quote);
    };
    //Запускает таймер, причем для режима помидора сохраняет информацию о начале работы в состоянии
    const startTimer = () => {
        if (timerMode === 'pomodoro') {
            updateQuote('pomodoro');
            const startTime = new Date();
            setPomodoroFields(prev => ({ ...prev, task_id: Number(selectedTask), stage_id: Number(selectedStage), pomodoro_date: formatDateForSQL(startTime), start_time: formatDateTimeForSQL(startTime), duration: yourSettings.pomodoro_duration}));
        }
        else
            updateQuote('break'); 
        setTimerState('running');
    };
    //Приостанавливает таймер
    const pauseTimer = () => {
        setTimerState('paused');
    };
    //Возобновляет работу приостановленного таймера
    const resumeTimer = () => {
        setTimerState('running');
    };
    // Переключает режим отображения страницы
    const toggleTimerOnly = () => {
        setIsTimerOnly(!isTimerOnly);
    };
    const selectedTaskData = tasks.find(t => t.id === parseInt(selectedTask));
    return (
        <div className="project-wrapper">
            {/*Если таймер не запущен, вызывается компонент для отображения верхнего меню*/}
            {timerState === 'idle' && (<NavBar />)}
            <div className="project-layout">
                {/*Если таймер не запущен, вызывается компонент для отображения бокового меню*/}
                {timerState === 'idle' && (<Navigate/>)}
                <div className={`project-content ${isTimerOnly ? 'timer-only' : ''} ${timerState !== 'idle' ? 'project-content-timer-active' : ''} 
                    project-content-with-bg`} style={{backgroundImage: `url(${backgroundImage})`}}>
                    {error && <div className="error-message">{error}</div>}
                    {!isTimerOnly && (<>
                        {/*Если таймер не запущен и режим не только таймер (круг), то отобразить блок для выбора задачи*/}
                        {timerState === 'idle' ? (<>
                            <div className="section-select">
                                <div className="display-tasks" style={{ position: 'relative' }}>
                                    <HelpTip>
                                        Отображаются задачи, у которых статус В работе<br/>
                                        Выбирайте задачи для отслеживания прогресса. Если задача не выбрана, просто привязки к задаче не будет<br/>
                                        Однако прогресс и количество помидоров за день в любом случае можно посмотреть в Статистике
                                    </HelpTip> 
                                    <h2 className="h1-prof" title='Отображаются задачи, которые взяты в работу'>Задача:</h2>
                                    <select value={selectedTask || ''} onChange={(e) => setSelectedTask(e.target.value || null)} 
                                        className="mt-3 mb-3 p-4 modal-input">
                                        <option value="0">Задача не выбрана</option>
                                        {tasks && tasks.map(task => (
                                            <option key={task.id} value={task.id} style={{color: `${task.color}`, fontWeight: selectedTask === task.id ? 'bold' : 'normal'}}>
                                                {task.task_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            {(selectedTask !== 0 && selectedTask !== "0" && stages.filter(stage => stage.task_id === parseInt(selectedTask)).length !== 0 &&
                                <div className="display-tasks" style={{ position: 'relative' }}>
                                <HelpTip>
                                    Отображаются этапы выбранной задачи
                                </HelpTip> 
                                    <h2 className="h1-prof" title='Отображаются этапы у задачи, которая взята в работу'>Этап:</h2>
                                    <select value={selectedStage || ''} onChange={(e) => setSelectedStage(e.target.value || null)} 
                                            className="mt-3 mb-3 p-4 modal-input">
                                        <option value="0">Этап не выбран</option>
                                        {stages && stages.filter(stage => stage.task_id === parseInt(selectedTask))
                                            .map(stage => (
                                            <option key={stage.id} value={stage.id}>
                                                {stage.stage_name}
                                            </option>
                                            ))}
                                    </select>
                                </div>)}
                            </div>
                        </>) : (<>
                            {/*Если таймер запущен и режим не только таймер (круг), то отображаются названия задач и этапов, если они были выбраны*/}
                            {(getTaskNameById(selectedTask) !== '' && (
                                <div className="timer-only-task-name" style={{backgroundColor: `${selectedTaskData.color}`}}>
                                    {getTaskNameById(selectedTask)}
                                </div>))}
                            {(selectedStage !== 0 && selectedStage !== "0" && getStageNameById(selectedStage) !== '' && (
                                <div className="timer-only-task-name">
                                    {getStageNameById(selectedStage)}
                                </div>))}  
                            <div style={{ position: 'relative' }}>
                                <HelpTip>
                                    Навигация и переход на другие страницы недоступны, когда запущен таймер<br/>
                                    Остановите таймер или дождитесь его завершения для доступа к другим страницам
                                </HelpTip></div>  
                        </>)}
                        <div className="timer-control-panel">  
                            {/*Блок для отображения круга*/}                         
                            <div className="timer-display" style={{ position: 'relative' }}>
                                <HelpTip>
                                    <strong>Откуда берутся цифры?</strong><br/>
                                    • Время помидора: {yourSettings?.pomodoro_duration} минут<br/>
                                    • Время перерыва: {yourSettings?.rest_duration} минут<br/><br/>
                                    Эти значения можно изменить в настройках профиля.
                                </HelpTip>
                                <svg className="timer-circle-large" viewBox="0 0 300 300">
                                    <circle className="timer-circle-bg" cx="150" cy="150" r="140" fill="none" stroke="rgba(255,255,255,0.2)"
                                        strokeWidth="15"/>
                                    <circle className="timer-circle-progress" cx="150" cy="150" r="140" fill="none"
                                        stroke={timerMode === 'pomodoro' ? '#4CAF50' : '#FF9800'} strokeWidth="15" strokeLinecap="round"
                                        strokeDasharray="879.2" strokeDashoffset={879.2 * (1 - timeLeft / timerDurations[timerMode])}
                                        transform="rotate(-90 150 150)"/>
                                    <text x="150" y="150" textAnchor="middle" dominantBaseline="middle" className="timer-text-large">
                                        {formatTime(timeLeft)}
                                    </text>
                                </svg>
                                <div className="timer-mode-label">{timerMode === 'pomodoro' ? '🍅 Помидор' : '☕ Перерыв'}</div>
                            </div>
                            {/*Блок для отображения кнопок управления таймером*/}
                            <div className="timer-actions">
                                <Button variant="success" onClick={toggleTimerOnly} className="timer-action-btn">
                                    Отобразить только таймер
                                </Button>
                                {timerState === 'idle' && (
                                    <Button variant="success" onClick={startTimer} className="timer-action-btn">Старт</Button>
                                )}
                                {timerState === 'running' && (
                                    <><Button variant="warning" onClick={pauseTimer} className="timer-action-btn">Пауза</Button>
                                      <Button variant="danger" onClick={handleStopTimer} className="timer-action-btn">Стоп</Button></>
                                )}
                                {timerState === 'paused' && (
                                    <><Button variant="success" onClick={resumeTimer} className="timer-action-btn">Продолжить</Button>
                                      <Button variant="danger" onClick={handleStopTimer} className="timer-action-btn">Стоп</Button></>
                                )}
                            </div>
                        </div>
                    </>)}
                    {/*В режиме только таймер сверху отображается кнопка "Показать панель" и подсказка HelpTip*/}
                    {isTimerOnly && (<>
                        <Button variant="success" onClick={toggleTimerOnly} className="timer-action-btn" title="Показать панель управления">
                            Показать панель
                        </Button>
                        <div style={{ position: 'relative' }}>
                            <HelpTip>Навигация и переход на другие страницы недоступны, когда запущен таймер<br/>
                                Остановите таймер или дождитесь его завершения для доступа к другим страницам
                            </HelpTip>
                        </div>
                    </>)}
                    {/*В режиме только таймер после кнопки "Показать панель" отображается названия задачи и этапа (если выбраны), таймер и кнопки управления таймером*/}
                    {isTimerOnly && (
                        <div className="timer-fullscreen-mode">
                            {getTaskNameById(selectedTask) !== '' ? (
                                <div className="timer-only-task-name" style={{backgroundColor: `${selectedTaskData.color}`}}>{getTaskNameById(selectedTask)}
                                </div>) : <></>}
                            {getStageNameById(selectedStage) !== '' ? (
                                <div className="timer-only-task-name">{getStageNameById(selectedStage)}
                                </div>) : <></>}                                
                            <div className="timer-mode-label">{timerMode === 'pomodoro' ? '🍅 Помидор' : '☕ Перерыв'}</div> 
                            {/*Блок для отображения таймера*/}
                            <div className="timer-fullscreen-display">
                                {formatTime(timeLeft).split('').map((char, index) => {
                                    if (char === ':')
                                        return <span key={index} className="timer-colon">:</span>;
                                    return (<span key={index} className="timer-digit">{char}</span>);})}
                            </div>
                            {/*Блок для отображения кнопок управления таймером*/}
                            <div className="timer-fullscreen-controls">
                                {timerState === 'idle' && (
                                    <Button variant="success" onClick={startTimer} className="timer-action-btn">Старт</Button>
                                )}
                                {timerState === 'running' && (
                                    <><Button variant="warning" onClick={pauseTimer} className="timer-action-btn">Пауза</Button>
                                      <Button variant="danger" onClick={handleStopTimer} className="timer-action-btn">Стоп</Button></>
                                )}
                                {timerState === 'paused' && (
                                    <><Button variant="success" onClick={resumeTimer} className="timer-action-btn">Продолжить</Button>
                                      <Button variant="danger" onClick={handleStopTimer} className="timer-action-btn">Стоп</Button></>
                                )}
                            </div>
                        </div>
                    )}
                    {/*Блок для отображения мотивационной фразы*/}
                    {timerState === 'running' && (<div className="timer-only-task-name">"{currentQuote.text}"</div>)}
                </div>
            </div>
        </div>);
};

export default AppPomodoro;