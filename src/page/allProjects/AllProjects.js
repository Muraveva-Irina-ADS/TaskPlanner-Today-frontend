import React, { useState, useEffect } from 'react';
import {get_projects_with_user, project_post, project_put, project_delete, get_users} from "../../api/commonApi";
import backIcon from '../../images/назад.png'; 
import { observer } from "mobx-react-lite";
import NavBar from "../../components/NavBar";
import { Button, Form, Table, InputGroup, FormControl} from 'react-bootstrap';
import './AllProjects.css';
import '../../styles/common.css'
import { useNavigate } from "react-router-dom";
import ModalStr from '../../components/ModalStructure';
import Navigate from '../../components/Navigate';
import toast from 'react-hot-toast';

const AppAllProjects = observer(() => {
    const [projects, setProjects] = useState([]); 
    const [showModal, setShowModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [isNewProject, setIsNewProject] = useState(false);
    const [formData, setFormData] = useState({});
    const [modalType, setModalType] = useState(null);   
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [visibleColumns, setVisibleColumns] = useState({
            users_id: true,
            project_name: true,
            description: false,
            color: true,
            is_active: true,
            created_at: false
    });    
    const [filterField, setFilterField] = useState('email');
    const [filterValue, setFilterValue] = useState('');
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [users, setUsers] = useState([]);

    const getProjects = async () => {
        try {
            const projects = await get_projects_with_user();
            setProjects(projects);
        } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
        }
    };
    const getUsers = async () => {
        try {
            const users = await get_users();
            setUsers(users);
        } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
        }
    };
    useEffect(() => {
        getProjects();
        getUsers();
    }, []);
    
    
    useEffect(() => {
        if (projects && projects.length > 0) {
            let filtered = projects;
            
            if (filterValue.trim() !== '') {
                filtered = projects.filter(project => {
                    const fieldValue = project[filterField];
                    if (filterField === 'is_active') {
                        const searchValue = filterValue.toLowerCase();
                        if (searchValue === 'да' || searchValue === 'true' || searchValue === 'активен') {
                            return project.is_active === true;
                        } else if (searchValue === 'нет' || searchValue === 'false' || searchValue === 'не активен' || searchValue === 'архив') {
                            return project.is_active === false;
                        }
                        return false;
                    }
                    if (filterField === 'created_at' && fieldValue) {
                        const dateStr = new Date(fieldValue).toLocaleDateString('ru-RU');
                        return dateStr.toLowerCase().includes(filterValue.toLowerCase());
                    }
                    if (fieldValue === undefined || fieldValue === null) return false;
                    return String(fieldValue).toLowerCase().includes(filterValue.toLowerCase());
                });
            }
            setFilteredProjects(filtered);
        } else {
            setFilteredProjects([]);
        }
    }, [projects, filterField, filterValue]);
    
    const openModal = (userData = null, modalType = null) => {
        if(userData){
            setFormData({...userData});
            setSelectedProject(userData);
            setIsNewProject(false);            
        } else {
            setSelectedProject(null);
            setFormData({color: '#c3c1ec', is_active: true, users_id: users[0].id});
            setIsNewProject(true);
        }
        setModalType(modalType);
        setShowModal(true);
    };
    
    const closeModal = () => {
        setShowModal(false);
        setSelectedProject(null);
        setIsNewProject(false);
        setModalType(null);
        setError('');
    };
    
    const handleChange = (e, index = null) => {
        const { name, value, type } = e.target;
        if (index !== null && Array.isArray(formData)) {
            const updatedArray = [...formData];
            updatedArray[index] = {
                ...updatedArray[index], [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value
            };
            setFormData({...formData});
        }
        else {
            if (type === 'number') {
                setFormData(prev => ({...prev, [name]: value === '' ? '' : Number(value)}));
            } else {
                setFormData(prev => ({...prev, [name]: value}));
            }
        }
    };
    
    const handleColumnToggle = (column) => {
        setVisibleColumns(prev => ({
            ...prev,
            [column]: !prev[column]
        }));
    };
    
    const getColumnHeaders = () => {
        const headers = [];
        if (visibleColumns.project_name) headers.push('Название проекта');
        if (visibleColumns.description) headers.push('Описание');
        if (visibleColumns.is_active) headers.push('Активен ли');
        if (visibleColumns.created_at) headers.push('Создан'); 
        return headers;
    };

    const getColumnKeys = () => {
        const keys = []; 
        if (visibleColumns.project_name) keys.push('project_name');
        if (visibleColumns.description) keys.push('description');
        if (visibleColumns.is_active) keys.push('is_active');
        if (visibleColumns.created_at) keys.push('created_at');
        return keys;
    };
    const handleSelectAll = () => {
        const allSelected = Object.values(visibleColumns).every(value => value === true);
        const newVisibleColumns = {};
        Object.keys(visibleColumns).forEach(key => {
            newVisibleColumns[key] = !allSelected;
        });
        
        setVisibleColumns(newVisibleColumns);
    };
    const handleProject = () => {
        if (!formData.project_name || !formData.description) {
                setError('Все поля должны быть заполнены');
                return;
        }
        if (isNewProject)
            handleAddProject();
        else
            handleSaveProject();
    }
    const handleAddProject = async() => {
        try {
        const data = await project_post(formData.users_id, formData.project_name, formData.description, formData.color, formData.is_active);
            if (data) {
                toast.success('Добавлено');                
                closeModal();
                getProjects();
            }
        } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
        }
    }
    const handleSaveProject = async() => {
        try {
            const data = await project_put(selectedProject.id, formData.users_id, formData.project_name, formData.description, formData.color, formData.is_active);
                if (data) {
                    toast.success('Сохранено');
                    closeModal();
                    getProjects();
                }
        } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
        }
    }
    const handleDeleteProject = async (id) => {
        try {
              let data;
              data = await project_delete(id);
              if (data) {
                toast.success('Удалено'); 
                getProjects();
              }
          } catch (e) {
            console.error('Ошибка при взаимодействии с сервером:', e);
            const message = e.response?.data?.error || 'Произошла ошибка';
            setError(message);
          }
        };  
        const projectsByUser = filteredProjects.reduce((acc, project) => {
            const userEmail = project.email || 'Неизвестный пользователь';
            if (!acc[userEmail]) {
                acc[userEmail] = [];
            }
            acc[userEmail].push(project);
            return acc;
        }, {});
    return (
        <div className="project-wrapper">
            <NavBar />
            <div className="project-layout">
            <Navigate/>
            <div className="project-content">
            <div className="back-button-container">
                <button onClick={() => navigate(-1)} className="back-button">
                <img src={backIcon} className="back-icon" alt="Назад"/>Назад</button>
            </div>
            <ModalStr show={showModal} onHide={closeModal} modalType={modalType} title={isNewProject ? 'Добавление нового проекта' : 'Редактирование данных о проекте'}
                        formData={formData} onChange={handleChange} onSave={handleProject} error={error} isNew={isNewProject}
                        fields={['users_id', 'project_name', 'description', 'is_active', 'color']} users={users}/>

            <div className="profile-header">
                <h1 className="h1-prof">Управление проектами пользователей</h1>
            </div>
            
            <div className="text-end mb-3">
                <Button variant="primary" style={{height: '60px'}} onClick={() => openModal(null, 'project_modal')}>Добавить проект</Button>
            </div>

            <div className="columns-selector">
                <div className="profile-header">
                    <h2 className="h1-prof">Выберите колонки для отображения:</h2>
                </div>
                <div className="profile-grid">
                    <Form.Check className="profile-field1" type="checkbox" label="Выделить все" 
                        checked={Object.values(visibleColumns).every(value => value === true)} onChange={handleSelectAll} />
                    <Form.Check className="profile-field1" type="checkbox" label="Название" 
                        checked={visibleColumns.project_name} onChange={() => handleColumnToggle('project_name')} />
                    <Form.Check className="profile-field1" type="checkbox" label="Описание" 
                        checked={visibleColumns.description} onChange={() => handleColumnToggle('description')} />
                    <Form.Check className="profile-field1" type="checkbox" label="Цвет" 
                        checked={visibleColumns.color} onChange={() => handleColumnToggle('color')} />
                    <Form.Check className="profile-field1" type="checkbox" label="Активен ли" 
                        checked={visibleColumns.is_active} onChange={() => handleColumnToggle('is_active')} />                        
                    <Form.Check className="profile-field1" type="checkbox" label="Создан" 
                        checked={visibleColumns.created_at} onChange={() => handleColumnToggle('created_at')} />
                </div>
            </div>
            
            <div className="filter-section">
                <div className="section-select">
                    <h2 className="h1-prof">Фильтрация</h2>
                    <InputGroup className="mb-3">
                        <InputGroup.Text className="field-label">Поле для фильтрации</InputGroup.Text>
                        <Form.Select className="mt-3 select" value={filterField} onChange={(e) => setFilterField(e.target.value)}>
                            <option value="users_id">Почта пользователя/администратора</option>
                            <option value="project_name">Название проекта</option>
                            <option value="description">Описание</option>
                            <option value="is_active">Активен ли</option>
                            <option value="created_at">Создан</option>
                        </Form.Select>
                        <InputGroup.Text className="field-label">Значение</InputGroup.Text>
                        <FormControl className="mt-3 select" placeholder="Введите значение для поиска..."
                            value={filterValue} onChange={(e) => setFilterValue(e.target.value)} />
                    </InputGroup>
                </div>
            </div>
            
            <div className="users-table-container">
            <Table striped bordered hover responsive className="users-table">
            <thead>
            <tr>
               {getColumnHeaders().map((header, index) => (
                <th key={index}>{header}</th>))}
                <th className="actions-header">Действия</th>
            </tr>
            </thead>
            <tbody>
            {Object.entries(projectsByUser).map(([userEmail, userProjects]) => {
                const realProjects = userProjects.filter(p => p.id !== null);
                    return (
                            <React.Fragment key={userEmail}>
                                <tr className="user-group-header">
                                    <td colSpan={getColumnHeaders().length + 1} className="actions-cell">
                                        <strong>Пользователь: {userEmail}</strong>
                                    </td>
                                </tr>
                                {realProjects.length > 0 ? (
                                    realProjects.map((project) => (
                                        <tr key={project.id} className="project-row" 
                                        style={{ color: visibleColumns.color ? project.color : 'black' }}>
                                            {getColumnKeys().map((key, colIndex) => {
                                                let value = project[key];
                                                if (key === 'created_at' && value) {
                                                    value = new Date(value).toLocaleDateString('ru-RU');
                                                }
                                                if (key === 'is_active') {
                                                    value = value ? 'Активен' : 'Не активен';
                                                }
                                                return <td key={colIndex} className="actions-cell">{value || '-'}</td>;
                                            })}
                                            
                                            <td className="actions-cell">
                                                <Button variant="primary" onClick={() => openModal(project, 'project_modal')}>Редактировать</Button>
                                                <Button variant="primary" onClick={() => {if (window.confirm(`Проект ${project.project_name} будет удален без возможности восстановления. Продолжить?`)) {
                                                    handleDeleteProject(project.id)}}}>Удалить</Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr className="no-projects-row">
                                        <td colSpan={getColumnHeaders().length + 1} className="actions-cell">
                                            <span className="no-projects-message">У пользователя нет проектов</span>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        )})}
                        {filteredProjects.length === 0 && (
                            <tr>
                                <td colSpan={getColumnHeaders().length + 1} className="text-center">
                                    Нет данных для отображения
                                </td>
                            </tr>
                        )}
            </tbody>
        </Table>
    </div>
    </div>
    </div>
    </div>
    );
});

export default AppAllProjects;