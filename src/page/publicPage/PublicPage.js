import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './PublicPage.css';
import '../../styles/common.css'
import productivityImage from '../../images/помидоры.webp';
import GantImage from '../../images/диаграмма.png';
import { get_admin_matrix_note } from '../../api/commonApi';

const AppPublicPage = () => {
    const [adminMatrix, setAdminMatrix] = useState({}); 
    const [error, setError] = useState('');

    const getAdminMatrix = async () => {
        try {
         const adminMatrix = await get_admin_matrix_note();
         setAdminMatrix(adminMatrix);
       } catch (e) {
         console.error('Ошибка при взаимодействии с сервером:', e);
         const message = e.response?.data?.error || 'Произошла ошибка';
         setError(message);
       }
     };
     useEffect(() => {
        getAdminMatrix();
    }, []);
    return (
        <div className="public-page">
            <header className="header">
                <h1>Задачник с использованием методов тайм-менеджмента</h1>
                <span style={{fontSize: '28px', fontWeight: '800', background: 'linear-gradient(135deg, #4CAF50, #81C784, #2E7D32)',
                            WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', letterSpacing: '1px', fontFamily: "'Inter', sans-serif"}}>
                    СЕГОДНЯ
                </span>
                <p>Позволяет создавать задачи и управлять временем с помощью методов Pomodoro, матрицы Эйзенхауэра и диаграммы Ганта</p>
                <div className="auth-links">
                    <Link to="/login" className="auth-link btn-secondary">Авторизация</Link>
                    <Link to="/registration" className="auth-link btn-secondary">Регистрация</Link>
                </div>
                <p style={{marginTop: '15px', fontSize: '0.9em', opacity: '0.9'}}>
                    Бесплатно и без ограничений
                </p>                
            </header>
            <section className="info-section">
                <h2>Метод Pomodoro</h2>
                <p>
                Метод Pomodoro предполагает чередование периодов сосредоточенной работы и короткого отдыха. Один такой цикл — «помидор» — длится 25 минут. За ним следует пауза на 5 минут.
                </p>
                <div className="hero-image-container">
                    <img src={productivityImage} alt="Принцип работы метода Pomodoro" className="hero-image"/>
                    <p className="image-caption">Принцип работы метода Pomodoro</p>
                </div>                
                <div className="feature-grid">
                    <div className="feature-card">
                        <h3>Советы по использованию метода</h3>
                        <ul>
                            <li>Адаптировать под себя. Не все задачи можно разделить на 25-минутные интервалы. Если удобнее работать длинными периодами, можно увеличить время «помидора» до 40–50 минут, а перерывы — до 10 минут.</li>
                            <li>Анализировать задачу, перед тем как приступать к ней. Важно декомпозировать задачу — разделить её на части.</li>
                            <li>Вести учёт времени. Записывать количество «помидоров», которые потрачены на каждую задачу. Это поможет анализировать, сколько времени уходит на работу, и лучше планировать будущие задачи.</li>
                            <li>Не отвлекаться в 25-минутном интервале. Отключить все уведомления, не заглядывать в мессенджеры. Поставить таймер, чтобы не смотреть всё время на часы.</li>
                            <li>Отдыхать. Часто люди забывают про время для отдыха, а это обнуляет всю пользу метода Pomodoro. Необходимо прерываться и переключаться на другие дела.</li>
                            <li>Вознаграждать себя. После выполнения четырёх или более «помидоров» можно поощрить себя: чашкой кофе, прогулкой или прослушиванием любимой песни.</li>  
                        </ul>
                    </div>
                </div>
            </section>
            <section className="how-to-start">
                <h2>Приложение "Сегодня" - это способ использовать метод Pomodoro для оптимизации своего времени</h2>
                <div className="steps-list">
                    <div className="step-item">
                        <h3>Встроенный таймер</h3>
                        <p>Запускайте помидор одним нажатием кнопки и концентрируйтесь на задаче</p>
                    </div>
                    <div className="step-item">
                        <h3>Настраивайте помидор под себя</h3>
                        <p>В настройках можно выбрать период помидора и отдыха - от 1 минуты до часа. Решать Вам!</p>
                    </div>
                    <div className="step-item">
                        <h3>Делите задачу на части</h3>
                        <p>Каждую задачу можно поделить на этапы, настроить предположительное время выполнения и запустить помидор для каждого этапа отдельно</p>
                    </div>
                    <div className="step-item">
                        <h3>Ведите учет времени</h3>
                        <p>Приложение запоминает количество помидоров, которые уже потрачены, поэтому вам не нужно делать это вручную</p>
                    </div>                  
                </div>
            </section>
            <section className="info-section">
                <h2>Матрица Эйзенхауэра</h2>
                <p>
                Матрица Эйзенхауэра — это метод тайм-менеджмента, который помогает управлять временем и расставлять приоритеты. Суть метода в том, чтобы разделить все задачи на четыре группы (квадранта):</p>

                <p>●	важные и срочные,</p>
                <p>●	важные, но не срочные,</p>
                <p>●	срочные, но не важные,</p>
                <p>●	не важные и не срочные.</p>
                <div className="matrix-grid">
                {(adminMatrix && Array.isArray(adminMatrix)) ? adminMatrix.map((cell) => (
                    <div key={cell.matrix_part} className="matrix-cell"
                        style={{ 
                            backgroundColor: cell.color,
                            background: `linear-gradient(135deg, ${cell.color}CC, ${cell.color})`
                        }}>
                        <div className="cell-number">{cell.matrix_part}</div>
                        <div className="cell-name">{cell.matrix_name}</div>
                        <div className="cell-description">{cell.description}</div>
                    </div>
                )) : (error && <div className="error-message">{error}</div>)}
                </div>               
            </section>
            <section className="how-to-start">
                <h2>Приложение "Сегодня" позволяет использовать все возможности матрицы Эйзенхауэра</h2>
                <div className="steps-list">
                    <div className="step-item">
                        <h3>Для каждой задачи определение квадранта</h3>
                        <p>В настройках задачи можно определить важность и срочность задачи</p>
                    </div>
                    <div className="step-item">
                        <h3>Графическое отображение матрицы</h3>
                        <p>В приложении вы можете увидеть полученную матрицу и сфокусироваться на самых главных задачах дня</p>
                    </div>
                    <div className="step-item">
                        <h3>Настройка матрицы</h3>
                        <p>Вы можете выбрать как будут называться ваши квадранты и даже какого они будут цвета</p>
                    </div>
                    <div className="step-item">
                        <h3>Поиск и фильтрация</h3>
                        <p>Можно отображать задачи на конкретный день, конкретного проекта или определенного статуса. Все для Вашего удобства!</p>
                    </div>                  
                </div>
            </section>
            <section className="info-section">
                <h2>Диаграмма Ганта</h2>
                <p>
                Диаграмма Ганта — это инструмент для наглядного отображения задач и сроков их выполнения в виде таблицы, где по вертикали отображается список задач, а по горизонтали - даты выполнения.
                 Она позволяет наглядно увидеть запланированные задачи и статусы их выполнения на определённые даты и понять как распределена нагрузка.
                </p>
                <div className="hero-image-container">
                    <img src={GantImage} alt="Пример диаграммы Ганта" className="hero-image"/>
                    <p className="image-caption">Пример диаграммы Ганта</p>
                </div>
            </section>
            <section className="how-to-start">
                <h2>Приложение "Сегодня" позволяет полноценно использовать диаграмму Ганта</h2>
                <div className="steps-list">
                    <div className="step-item">
                        <h3>Фильтрация задач</h3>
                        <p>Выбирайте задачи, которые будут отображаться на диаграмме</p>
                    </div>
                    <div className="step-item">
                        <h3>Выбор сроков выполнения для отображения на диаграмме</h3>
                        <p>Выбирайте временные интервалы, то есть какие дни будут отображаться на диаграмме</p>
                    </div>
                    <div className="step-item">
                        <h3>Полный набор информации</h3>
                        <p>Вся информация о проектах, задач и этапах, а также все статусы на диаграмме. Ничто не останется без внимания!</p>
                    </div>                 
                </div>
            </section>
            <section className="cta-section">
                <h3>Присоединяйтесь и планируйте свой день!</h3>
                <div className="auth-links">
                    <Link to="/login" className="auth-link btn-secondary">Авторизация</Link>
                    <Link to="/registration" className="auth-link btn-secondary">Регистрация</Link>
                    
                </div>
            </section>
        </div>
    );
};

export default AppPublicPage;