import React, { useState, useEffect } from 'react';
import '../styles/components.css';
const WeekNavigate = ({ onDateSelect, selectedDate, title, isNeedAllTasks, setIsNeedAllTasks, lastExportDate }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [weekDates, setWeekDates] = useState([]);
    const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    const getWeekDates = (date) => {
        const current = new Date(date);
        const day = current.getDay();
        const diff = day === 0 ? 6 : day - 1; 
        const monday = new Date(current);
        monday.setDate(current.getDate() - diff);
        const week = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(monday);
            day.setDate(monday.getDate() + i);
            week.push(day);
        }
        return week;
    };
    useEffect(() => {
        setWeekDates(getWeekDates(currentDate));
    }, [currentDate]);
    useEffect(() => {
        if (selectedDate) {
            setCurrentDate(selectedDate);
        }
    }, [selectedDate]);
    const isDateValid = (dateToCheck) => {
        const exportDate = new Date(lastExportDate);
        exportDate.setHours(0, 0, 0, 0);
        const checkDate = new Date(dateToCheck);
        checkDate.setHours(0, 0, 0, 0);
        const startOfWeek = new Date(dateToCheck);
        startOfWeek.setDate(checkDate.getDate() - checkDate.getDay() + 1);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return endOfWeek >= exportDate;
    };
    const goToDateBack = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() - 7);
        if (!isDateValid(newDate)) {
            alert('Данные не выгружены, вы можете посмотреть информацию о задачах в Навигации в Календаре');
        } else {
            setCurrentDate(newDate);
        }
    };
    const nextWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + 7);
        setCurrentDate(newDate);
    };
    const handleDateSelect = (date) => {
        onDateSelect(date);
    };
    const formatDate = (date) => {
        return date.getDate().toString();
    };
    const isToday = (date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };
    const isSelected = (date) => {
        if (!selectedDate) return false;
        return date.getDate() === selectedDate.getDate() &&
            date.getMonth() === selectedDate.getMonth() &&
            date.getFullYear() === selectedDate.getFullYear();
    };
    return (<>
        <div className="section-select">
            <div className="display-tasks">
                <h2 className="h1-prof">Отображать:</h2>
                <select value={isNeedAllTasks ? 'all' : 'today'} onChange={(e) => {setIsNeedAllTasks(e.target.value === 'all');}}
                    className="mt-3 mb-3 p-4 modal-input">
                    <option value="all">Все задачи</option>
                    <option value="today">Задачи на конкретный день</option>
                </select>
            </div>
        </div>
        <div className="profile-header">
            <h1 className="h1-prof">{title}</h1>
        </div>
        {!isNeedAllTasks && (
            <div className="profile-header">
                <div className="week-navigation">
                    <button onClick={goToDateBack} className="nav-arrow">←</button>
                    <span className="week-title">
                        {weekDates.length > 0 && (
                            `${weekDates[0].toLocaleDateString('ru-RU', { month: 'long', day: 'numeric', year: 'numeric' }).replace(' г.', '')} - 
                            ${weekDates[6].toLocaleDateString('ru-RU', { month: 'long', day: 'numeric', year: 'numeric' }).replace(' г.', '')}`
                        )}
                    </span>
                <button onClick={nextWeek} className="nav-arrow">→</button>
            </div>
            <div className="week-days">
                {daysOfWeek.map((day, index) => (<div key={index} className="day-label">{day}</div>))}
            </div>
            <div className="week-days">
                {weekDates.map((date, index) => (
                    <div key={index} className={`date-cell ${isToday(date) ? 'today' : ''} ${isSelected(date) ? 'selected' : ''}`}
                        onClick={() => handleDateSelect(date)}>{formatDate(date)}</div>
                ))}
            </div>
        </div>)}
    </>);
};
export default WeekNavigate;