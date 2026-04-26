import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Context } from '../index';

const Navigate = () => {
    const { user } = useContext(Context);
    const navigate = useNavigate();
    const location = useLocation();
    return (
        <div className="project-sidebar">
                    <h3 className="sidebar-title">Навигация</h3>
                    <div className="sidebar-links">
                        {location.pathname !== "/pomodoro" && (<div className="sidebar-link" onClick={() => navigate('/pomodoro')}>
                            Pomodoro
                        </div>)}
                        {location.pathname !== "/matrix" && (<div className="sidebar-link" onClick={() => navigate('/matrix')}>
                            Матрица
                        </div>)}
                        <div className="sidebar-link" onClick={() => navigate('/calendar')}>
                            Календарь
                        </div>
                        {location.pathname !== "/complete" && (<div className="sidebar-link" onClick={() => navigate('/complete')}>
                            Завершенные задачи
                        </div>)}
                        {location.pathname !== "/statistic" && (<div className="sidebar-link" onClick={() => navigate('/statistic')}>
                            Диаграмма Ганта
                        </div>)}
                        {user.role === 'admin' && location.pathname !== "/history" && (<div className="sidebar-link" onClick={() => navigate('/history')}>
                            Исторические данные
                        </div>)}                       
                    </div>
                    <div className="sidebar-user">
                        <div className="user-avatar">
                            {user.email?.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-info">
                            <div className="user-name">{user.email}</div>
                        </div>
                    </div>
                </div>
    );
};

export default Navigate;