import React, { useState } from 'react';
import { Modal, Form, Button, Table } from 'react-bootstrap';
import moment from 'moment';

const ModalStr = ({ show, onHide, modalType, title, formData, onChange, onSave, error, isNew, fields, users = [], extraData = {}}) => {
    const [useDeadline, setUseDeadline] = useState(false);
    return (
        <Modal show={show} onHide={onHide} modalType={modalType} centered>
            <Modal.Header closeButton>
                <Modal.Title className="h1-prof">{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    {error && <div className="error-message">{error}</div>}
                    {fields.includes('users_id') && (
                        <Form.Group className="mb-3">
                            <Form.Label className="field-label">Почта пользователя/администратора</Form.Label><br/>
                            <Form.Select className="mt-3 mb-3 p-4 modal-input" name="users_id" value={formData.users_id || ''} onChange={onChange}>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.email} {user.role_name === 'admin' ? '(Администратор)' : ''}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    )}
                    {fields.includes('first_name') && (    
                        <Form.Group className="mb-3">
                            <Form.Label className="field-label">Имя</Form.Label><br/>
                            <Form.Control className="mt-3 custom-input" type="text" name="first_name" value={formData.first_name || ''} onChange={onChange}/>
                        </Form.Group>
                    )}   
                    {fields.includes('last_name') && (    
                        <Form.Group className="mb-3">
                            <Form.Label className="field-label">Фамилия</Form.Label><br/>
                                <Form.Control className="mt-3 custom-input" type="text" name="last_name" value={formData.last_name || ''} onChange={onChange}/>
                        </Form.Group>
                    )}    
                    {fields.includes('email') && (    
                        <Form.Group className="mb-3">
                            <Form.Label className="field-label">Почта</Form.Label><br/>
                                <Form.Control className="mt-3 custom-input" type="email" name="email" value={formData.email || ''} onChange={onChange}/>
                            </Form.Group>
                    )}
                    {fields.includes('curPassword') && (<>    
                        {!isNew && (    
                            <p>Для изменения пароля введите текущий пароль. Если пароль не меняете - оставьте поле пустым</p>
                        )}
                        <Form.Group className="mb-3">
                            <Form.Label className="field-label">{!isNew ? 'Текущий пароль' : 'Пароль'}</Form.Label><br/>
                                <Form.Control className="mt-3 custom-input" type="password" name="curPassword" value={formData.curPassword || ''} onChange={onChange}/>
                        </Form.Group>
                    </>)}    
                    {fields.includes('newPassword') && formData.curPassword && extraData.selectedUser != null && (
                        <Form.Group className="mb-3">
                            <Form.Label className="field-label">Новый пароль</Form.Label><br/>
                                <Form.Control className="mt-3 custom-input" type="password" name="newPassword" value={formData.newPassword || ''} onChange={onChange}/>
                            </Form.Group>
                    )} 
                    {fields.includes('role_name') && extraData.user.role === 'admin' ?
                        <Form.Group className="mb-3">
                            <Form.Label className="field-label">Роль</Form.Label><br/>
                            {extraData.yourUser.note !== 'Администратор системы'?
                                <Form.Select className="mt-3 mb-3 p-4 modal-input" name="role_name" value={formData.role_name || 'user'} onChange={onChange}>
                                    <option value="user">Пользователь</option>
                                    <option value="admin">Администратор</option>
                                </Form.Select> : 
                                <Form.Control className="mt-3 custom-input" type="text" name="role_name" 
                                    value={formData.role_name === 'admin' ? 'Администратор' : 'Пользователь'} readOnly/>}
                        </Form.Group>
                    : <></> }  
                    {fields.includes('role_users_name') ?
                        <Form.Group className="mb-3">
                            <Form.Label className="field-label">Роль</Form.Label><br/>
                                {!extraData.selectedUser || extraData.selectedUser.note !== 'Администратор системы'?
                                <Form.Select className="mt-3 mb-3 p-4 modal-input" name="role_name" value={formData.role_name || 'user'} onChange={onChange}>
                                    <option value="user">Пользователь</option>
                                    <option value="admin">Администратор</option>
                                </Form.Select> : 
                                <Form.Control className="mt-3 custom-input" type="text" name="role_name"
                                    value={formData.role_name === 'admin' ? 'Администратор' : 'Пользователь'} readOnly/>}
                        </Form.Group> 
                    : <></> }                       
                    {fields.includes('phone_number') && (
                        <Form.Group className="mb-3">
                            <Form.Label className="field-label">Номер телефона</Form.Label><br/>
                                <Form.Control className="mt-3 custom-input" type="tel" name="phone_number" value={formData.phone_number || ''} onChange={onChange}/>
                        </Form.Group>
                    )}  
                    {fields.includes('birthday') && (
                        <Form.Group className="mb-3">
                            <Form.Label className="field-label">Дата рождения</Form.Label><br/>
                                <Form.Control className="mt-3 custom-input" type="date" name="birthday"
                                    value={formData.birthday ? moment(formData.birthday).format('YYYY-MM-DD') : ''} onChange={onChange}/>
                        </Form.Group>
                    )}     
                    {fields.includes('note') && extraData.user.role === "admin" && (<>
                        <p>
                            "Администратор системы" означает, что текущий администратор - главный.
                            Замечание с таким значением обязательно должно быть только у одного администратора.
                        </p>
                        <Form.Group className="mb-3">
                            <Form.Label className="field-label">Замечания</Form.Label><br/>
                            {(extraData.selectedUser && extraData.selectedUser?.note === 'Администратор системы') || (extraData.yourUser?.note === 'Администратор системы') ? 
                                <Form.Control className="mt-3 custom-input" as="textarea" rows={2} name="note" value={formData.note || ''} readOnly 
                                /> : <Form.Control className="mt-3 custom-input" as="textarea" rows={2} name="note" value={formData.note || ''} onChange={onChange} />}
                        </Form.Group>
                    </>)} 
                    {fields.includes('title_settings') && (
                        <Modal.Title className="h1-prof">{'Изменить информацию о настройках пользователя'}</Modal.Title>
                    )}                    
                    {fields.includes('limit_tasks') && (<>
                        <p>Поле Лимит задач содержит информацию о максимальном количестве задач в день. Если не хотите иметь лимит задач в день, введите достаточно большое число</p>
                        <Form.Group className="mb-3">
                            <Form.Label className="field-label">Лимит задач</Form.Label><br/>
                                <Form.Control className="mt-3 custom-input" type="number" name="limit_tasks" value={formData.limit_tasks || ''} onChange={onChange}/>
                            <p style={{color: "grey"}}>По умолчанию Лимит задач: {extraData.adminSettings?.limit_tasks}</p>
                        </Form.Group>
                    </>)}  
                    {fields.includes('pomodoro_duration') && (<>     
                        <p>Поля Длительность подидора и Длительность отдыха содержат информацию о количестве минут. 
                                Классический формат метода Pomodoro — 25 минут работы над одной конкретной задачей и 5 минут отдыха.
                                Можно увеличить время рабочего блока до 45 или 50 минут с последующим отдыхом в 10–15 минут. Такой формат удобен 
                                для глубоких и аналитических задач, требующих длительной концентрации и минимального количества переключений.
                                Длительность можно настройти под себя, однако время не должно превышать одного часа.</p>
                        <Form.Group className="mb-3">
                            <Form.Label className="field-label">Длительность помидора</Form.Label><br/>
                                <Form.Control className="mt-3 custom-input" type="number" name="pomodoro_duration" value={formData.pomodoro_duration || ''} onChange={onChange}/>
                            <p style={{color: "grey"}}>По умолчанию Длительность помидора: {extraData.adminSettings?.pomodoro_duration}</p>
                        </Form.Group>
                    </>)} 
                    {fields.includes('rest_duration') && (   
                        <Form.Group className="mb-3">
                            <Form.Label className="field-label">Длительность отдыха</Form.Label><br/>
                                <Form.Control className="mt-3 custom-input" type="number" name="rest_duration" value={formData.rest_duration || ''} onChange={onChange}/>
                            <p style={{color: "grey"}}>По умолчанию Длительность отдыха: {extraData.adminSettings?.rest_duration}</p>
                        </Form.Group>
                    )} 
                    {fields.includes('start_working_day') && (<>  
                        <p>Поля Начало и Конец рабочего дня содержат информацию о времеми начала и окончания рабочего дня соответственно. 
                            Введите 00:00 и 23:59, если хотите, чтобы рабочий день длился весь день</p>
                        <Form.Group className="mb-3">
                            <Form.Label className="field-label">Начало рабочего дня</Form.Label><br/>
                                <Form.Control className="mt-3 custom-input" type="time" name="start_working_day" value={formData.start_working_day || ''} onChange={onChange}/>
                            <p style={{color: "grey"}}>По умолчанию Начало рабочего дня: {extraData.adminSettings?.start_working_day.substring(0, 5)}</p>
                        </Form.Group>
                    </>)} 
                    {fields.includes('end_working_day') && (
                        <Form.Group className="mb-3">
                            <Form.Label className="field-label">Конец рабочего дня</Form.Label><br/>
                                <Form.Control className="mt-3 custom-input" type="time" name="end_working_day" value={formData.end_working_day || ''} onChange={onChange}/>
                            <p style={{color: "grey"}}>По умолчанию Конец рабочего дня: {extraData.adminSettings?.end_working_day.substring(0, 5)}</p>
                        </Form.Group>
                    )}
                    {fields.includes('number_pomodoro_per_day') && (<>
                        <Form.Group className="mb-3">
                            <Form.Label className="field-label">Максимальное количество помидоров в день</Form.Label><br/>
                                <Form.Control className="mt-3 custom-input" type="number" name="number_pomodoro_per_day"
                                    value={formData.number_pomodoro_per_day || ''} onChange={onChange}/>
                            <p style={{color: "grey"}}>По умолчанию Максимальное количество помидоров в день: {extraData.adminSettings?.number_pomodoro_per_day}</p>
                        </Form.Group>
                        {error && <div className="error-message">{error}</div>}
                    </>)}
                    {fields.includes('title_matrix') && (
                        <Modal.Title className="h1-prof">{'Изменить информацию о настройках матрицы пользователя'}</Modal.Title>
                    )}
                    {fields.includes('matrix_put') && (<>
                        <div className="matrix-edit-grid mb-4">
                            {((formData.matrix || formData) && Array.isArray(formData.matrix || formData) && 
                                (formData.matrix || formData).sort((a, b) => a.matrix_part - b.matrix_part).map((cell, index) => (
                                    <div key={cell.matrix_part} className="matrix-edit-cell">
                                        <div className="matrix-quadrant-header">
                                            <div className="quadrant-number-badge">
                                                {cell.matrix_part}
                                            </div>
                                        </div>
                                        <div className="matrix-edit-form">
                                            <Form.Group className="mb-3">
                                                <Form.Label className="field-label">Название квадранта</Form.Label>
                                                <Form.Control className="mt-3 custom-input" type="text" name="matrix_name" value={cell.matrix_name}
                                                    onChange={(e) => onChange(e, index, 'matrix')} placeholder="Введите название"/>
                                                <p style={{color: "grey"}}>По умолчанию Название квадранта: {extraData.adminMatrix.find(item => item.matrix_part === cell.matrix_part).matrix_name}</p>
                                            </Form.Group>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="field-label">Описание</Form.Label>
                                                <Form.Control className="mt-3 custom-input" as="textarea" rows={3} name={"description"} value={cell.description}
                                                    onChange={(e) => onChange(e, index, 'matrix')} placeholder="Введите описание"/>
                                                <p style={{color: "grey"}}>По умолчанию Описание: {extraData.adminMatrix[index].description}</p>
                                            </Form.Group>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="matrix-field-label">Цвет квадранта</Form.Label>
                                                    <div className="color-picker-container">
                                                        <Form.Control type="color" name={"color"} value={cell.color}
                                                            onChange={(e) => onChange(e, index, 'matrix')} className="color-picker" title="Выберите цвет"/>
                                                        <span className="color-preview" style={{backgroundColor: cell.color}}></span>
                                                        <span className="color-value">{cell.color}</span>                                               
                                                    </div>
                                                </Form.Group>
                                                <p style={{color: "grey"}}>По умолчанию Цвет квадранта: {extraData.adminMatrix[index].color}</p> 
                                            </div>
                                            <div className="matrix-preview">
                                                <div className="matrix-preview-cell" style={{backgroundColor: cell.color}}>
                                                    <div className="preview-number">{cell.matrix_part}</div>
                                                    <div className="preview-name">{cell.matrix_name}</div>
                                                    <div className="preview-description">{cell.description}</div>
                                                </div>
                                            </div>
                                        </div>
                                    )))
                            }
                            {error && <div className="error-message">{error}</div>}
                        </div>
                    </>)}
                    {fields.includes('title_status') && (
                        <Modal.Title className="h1-prof">{'Изменить информацию о настройках статусов пользователя'}</Modal.Title>
                    )}                    
                    {fields.includes('status_put') && (
                        <div className="matrix-edit-grid mb-4">
                            {((formData.status || formData) && Array.isArray(formData.status || formData) && 
                                (formData.status || formData).sort((a, b) => a.id - b.id).map((element, index) => (
                                    <div>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="field-label">Название статуса</Form.Label>
                                            <Form.Control className="mt-3 custom-input" type="text" name="status_name" value={element.status_name}
                                                onChange={(e) => onChange(e, index, 'status')} placeholder="Введите название"/>
                                            <p style={{color: "grey"}}>По умолчанию Название статуса: {extraData.adminStatus[index].status_name}</p>
                                        </Form.Group>
                                    {!formData.status && extraData.user.role === 'admin' && extraData.yourUser?.note === 'Администратор системы' && (
                                        <Form.Group className="mb-3">
                                            <Form.Label className="field-label">Системный код</Form.Label><br/>
                                                <Form.Control className="mt-3 custom-input" type="text" name="system_code" value={element.system_code}
                                                    onChange={(e) => onChange(e, index)} readOnly/>
                                        </Form.Group>
                                    )}
                                </div>
                            )))
                        }
                        </div>
                    )}
                    {fields.includes('status_add') && (<>
                        <Form.Group className="mb-3">
                            <Form.Label className="field-label">Название статуса</Form.Label>
                                <Form.Control className="mt-3 custom-input" type="text" name="status_name" value={formData.status_name  || ''}
                                    onChange={onChange} placeholder="Введите название"/>
                            <p style={{color: "grey"}}>Следующие коды уже есть в базе данных</p>
                                {extraData.adminStatus && Array.isArray(extraData.adminStatus) && 
                                extraData.adminStatus.sort((a, b) => a.id - b.id).map((element, index) => (
                                <p style={{color: "grey"}}>{element.system_code}</p>
                            ))}
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="field-label">Системный код</Form.Label><br/>
                                <Form.Control className="mt-3 custom-input" type="text" name="system_code" value={formData.system_code  || ''}
                                    onChange={onChange} placeholder="Введите системный код"/>
                        </Form.Group>
                        <p>Будьте аккуратны при добавлении статуса. Системный код изменить будет нельзя, и удалить статус тоже будет нельзя</p> 
                    </>)}
                    {fields.includes('execution_status_put') && (<>
                        <p>При изменении названий типов поторений обращайте внимание на текущий смысл названия!</p>
                        <div className="matrix-edit-grid mb-4">
                            {formData && Array.isArray(formData) && formData.sort((a, b) => a.id - b.id).map((element, index) => (
                                <div>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="field-label">Название статуса</Form.Label>
                                            <Form.Control className="mt-3 custom-input" type="text" name="exec_status_name" value={element.exec_status_name}
                                                onChange={(e) => onChange(e, index)} placeholder="Введите название"/>
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="field-label">Системный код</Form.Label><br/>
                                            <Form.Control className="mt-3 custom-input" type="text" name="code" value={element.code}
                                                onChange={(e) => onChange(e, index)} readOnly/>
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="field-label">Цвет</Form.Label><br/>
                                            <Form.Control className="color-picker" type="color" name="exec_color"
                                                value={element.exec_color} onChange={(e) => onChange(e, index)} title="Выберите цвет"/>
                                    </Form.Group>                                        
                                </div>
                            ))}
                        </div>
                    </>)}
                    {fields.includes('execution_status_add') && (<>
                        <Form.Group className="mb-3">
                            <Form.Label className="field-label">Название статуса</Form.Label>
                                <Form.Control className="mt-3 custom-input" type="text" name="exec_status_name" value={formData.exec_status_name  || ''}
                                    onChange={onChange} placeholder="Введите название"/>
                            <p style={{color: "grey"}}>Следующие коды уже есть в базе данных</p>
                            {extraData.executionStatus && Array.isArray(extraData.executionStatus) && 
                            extraData.executionStatus.sort((a, b) => a.id - b.id).map((element, index) => (
                            <p style={{color: "grey"}}>{element.code}</p>
                            ))}
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="field-label">Системный код</Form.Label><br/>
                                <Form.Control className="mt-3 custom-input" type="text" name="code"
                                    value={formData.code  || ''} onChange={onChange} placeholder="Введите системный код"/>
                        </Form.Group>
                        <p>Будьте аккуратны при добавлении статуса. Системный код изменить будет нельзя, и удалить статус тоже будет нельзя</p>   
                        <Form.Group className="mb-3">
                            <Form.Label className="field-label">Цвет</Form.Label><br/>
                                <Form.Control className="color-picker" type="color" name="exec_color" value={formData.exec_color} onChange={onChange} title="Выберите цвет"/>
                        </Form.Group>
                    </>)}
                    {fields.includes('repeat_type_put') && (<>
                        <p>При изменении названий типов поторений обращайте внимание на текущий смысл названия!</p>
                        <div className="matrix-edit-grid mb-4">
                        {formData && Array.isArray(formData) && formData.sort((a, b) => a.id - b.id).map((element, index) => (
                            <div>
                                <Form.Group className="mb-3">
                                    <Form.Label className="field-label">Название типа</Form.Label>
                                        <Form.Control className="mt-3 custom-input" type="text" name="type_name" value={element.type_name}
                                            onChange={(e) => onChange(e, index)} placeholder="Введите название"/>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label className="field-label">Описание</Form.Label><br/>
                                        <Form.Control className="mt-3 custom-input" type="text" name="description" value={element.description} onChange={(e) => onChange(e, index)}/>
                                    </Form.Group>
                            </div>
                            ))}
                        </div>
                    </>)}                    
                    {fields.includes('project_name') && (
                        <Form.Group className="mb-3">
                            <Form.Label className="field-label">Название проекта</Form.Label>
                            <Form.Control className="mt-3 custom-input" type="text" name="project_name" value={formData.project_name || ''} onChange={onChange}/>
                        </Form.Group>
                    )}
                    {fields.includes('task_name') && (
                        <Form.Group className="mb-3">
                            <Form.Label className="field-label">Название</Form.Label><br/>
                            <Form.Control className="mt-3 custom-input" type="text" name="task_name" value={formData.task_name || ''} onChange={onChange}/>
                        </Form.Group>
                        )}
                    {fields.includes('stage_name') && (
                        <Form.Group className="mb-3">
                            <Form.Label className="field-label">Название этапа</Form.Label><br/>
                            <Form.Control className="mt-3 custom-input" type="text" name="stage_name" value={formData.stage_name || ''} onChange={onChange}/>
                        </Form.Group>
                        )}
                    {fields.includes('description') && (
                        <Form.Group className="mb-3">
                            <Form.Label className="field-label">Описание</Form.Label><br/>
                            <Form.Control className="mt-3 custom-input" type="text" name="description" value={formData.description || ''} onChange={onChange}/>
                        </Form.Group>
                    )}
                    {fields.includes('is_active') && (
                        <Form.Group className="mb-3">
                            <Form.Label className="field-label">Активен ли</Form.Label>
                            <Form.Select className="mt-3 mb-3 p-4 modal-input" name="is_active" value={formData.is_active} onChange={onChange}>
                                <option value="true">Активен</option>
                                <option value="false">Не активен</option>
                            </Form.Select>
                        </Form.Group>
                    )}
                    {fields.includes('color') && (
                        <Form.Group className="mb-3">
                            <Form.Label className="matrix-field-label">Цвет</Form.Label>
                            <div className="color-picker-container">
                                <Form.Control type="color" name="color" value={formData.color} onChange={onChange} className="color-picker" title="Выберите цвет"/>
                                <span className="color-preview" style={{backgroundColor: formData.color}}></span>
                                <span className="color-value">{formData.color}</span>                                               
                            </div>
                        </Form.Group>
                    )}
                    {fields.includes('archiveStartDate') && (
                        <Form.Group className="mb-3">
                            <p>Выбранная дата находится в архиве. Выберите период для просмотра архивных данных.</p>
                            <Form.Label className="field-label">Начальная дата</Form.Label>
                            <Form.Control className="mt-3 custom-input" type="date" name="archiveStartDate"
                                value={formData.archiveStartDate ? moment(formData.archiveStartDate).format('YYYY-MM-DD') : ''}
                                onChange={onChange}/>
                        </Form.Group>
                        )}
                    {fields.includes('archiveEndDate') && (
                        <Form.Group className="mb-3">
                            <Form.Label className="field-label">Конечная дата</Form.Label>
                            <Form.Control className="mt-3 custom-input" type="date" name="archiveEndDate"
                                value={formData.archiveEndDate ? moment(formData.archiveEndDate).format('YYYY-MM-DD') : ''}
                                onChange={onChange}/>
                        </Form.Group>
                    )}
                    {fields.includes('warning_dates_tasks') && (
                        <div>
                            <p>Данные из таблицы Сроков задач и Сроков этапов будут выгружены в исторические таблицы соответственно</p>
                            <p>Все строки, у которых срок выполнения имеет значение от {users[0].erlDate} до {users[0].dateInput} включительно</p>
                            <p>Нажмите Добавить, если желаете продолжить</p>
                            {users[0].hasCompletedToday && (<div>
                                <p>Внимание! В выбранных данных есть задачи, которые еще не были завершены. Все равно продолжить?</p>
                            </div>)}
                        </div>
                    )} 
                    {fields.includes('warning_pomodoro') && (
                        <div>
                            <p>Данные из таблицы Pomodoro будут выгружены в историческую таблицу</p>
                            <p>Все строки, у которых срок выполнения имеет значение от {users[0].erlDate} до {users[0].dateInput} включительно</p>
                            <p>Нажмите Добавить, если желаете продолжить</p>
                        </div>
                    )}                        
                    {fields.includes('projects_select') && (
                        <Form.Group className="mb-3">
                            <Form.Label className="field-label">Выберите проект</Form.Label><br/>
                            <Form.Select className="mt-3 mb-3 p-4 modal-input" name="project_id" value={formData.project_id || ''}
                                onChange={onChange}>
                                {users.map(pr => (
                                    <option key={pr.id} value={pr.id} style={{color: `${pr.color}`, fontWeight: formData.project_id === pr.id ? 'bold' : 'normal'}}>
                                        {pr.project_name}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    )}    
                    {fields.includes('matrix_select') && (
                        <Form.Group className="mb-3">
                            <Form.Label className="field-label">Выберите часть матрицы</Form.Label><br/>
                            <Form.Select className="mt-3 mb-3 p-4 modal-input" name="matrix_id" value={formData.matrix_id || ''} onChange={onChange}>
                                {users.map(pr => (
                                    <option key={pr.id} value={pr.id} style={{color: `${pr.color}`, fontWeight: formData.matrix_id === pr.id ? 'bold' : 'normal'}}>
                                        {pr.matrix_name}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    )}
                    {fields.includes('status_select') && (
                        <Form.Group className="mb-3">
                            <Form.Label className="field-label">Какой статус установить?</Form.Label><br/>
                            <Form.Select className="mt-3 mb-3 p-4 modal-input" name="system_code" value={formData.system_code || ''} onChange={onChange}>
                                <option value='default'>Выберите статус</option>
                                {users.map(pr => (
                                    <option key={pr.id} value={pr.system_code}>
                                        {pr.status_name}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    )}
                    {fields.includes('need_end') && (<>
                        <p>🎉 Поздравляем! 🎉</p>
                        <p>Вы завершили задачу, все сроки выполнены!</p>
                        <p>Хотите завершить задачу? Если да, то нажмите на кнопку Завершить</p>
                        <p>Внимание! После завершения задача будет недоступна для восстановления</p>
                        <Button variant="primary" onClick={extraData}>Завершить задачу</Button>
                        <p>Если не хотите завершать задачу, установите новую дату выполнения для установления нового срока и продолжения задачи</p>
                        <p>Для этого введите дату, выберете тип повторения и нажмите кнопку Сохранить</p>
                    </>)}
                    {fields.includes('info_dates_tasks') && (<>
                        <div className='media'>
                            <Table striped bordered hover responsive className="users-table">
                                <thead>
                                    <tr>
                                        {extraData.titleColums.map((header, index) => (<th key={index}>{header}</th>))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((element) => {
                                        return (
                                            <React.Fragment key={element.id}>
                                                <tr className={`user-main-row ${new Date(element.execution_date).toDateString() === new Date(extraData.selectDate).toDateString() ? 'highlighted-date' : ''}`}>
                                                    {extraData.valueColums.map((key, colIndex) => {
                                                        let value = element[key];
                                                        if ((key === 'execution_date') && value) {
                                                            value = new Date(value).toLocaleDateString('ru-RU');
                                                        }
                                                        if (key === 'plan') {
                                                            const start = element.planned_start_time?.substring(0, 5) || '--:--';
                                                            const end = element.planned_end_time?.substring(0, 5) || '--:--';
                                                            value = `${start} - ${end}`;
                                                        }
                                                        if (key === 'fact') {
                                                            const start = element.actual_start_time?.substring(0, 5) || '--:--';
                                                            const end = element.actual_end_time?.substring(0, 5) || '--:--';
                                                            value = `${start} - ${end}`;
                                                        }    
                                                        if (key === 'status')
                                                            value = element.exec_status_name;
                                                        if (key === 'action') {
                                                            let titleButton, nameButton;
                                                            if (element.code === 'отмена') {
                                                                titleButton = 'Восстановить срок выполнения этапа и изменить статус';
                                                                nameButton = 'Вернуть'
                                                            }
                                                            else {
                                                                titleButton = 'Отменить срок выполнения этапа';
                                                                nameButton = 'Отменить'
                                                            }
                                                            value = (<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}><Button variant="primary" onClick={() => extraData.go_to_task(element.execution_date)} title='Перейти к задаче (этапу) с этим сроком выполнения'>Перейти</Button>
                                                                    {extraData?.clickCancel && (<Button variant="secondary" onClick={() => extraData.clickCancel(element)} title={titleButton}>{nameButton}</Button>)}</div>)
                                                        }
                                                        return <td key={colIndex} className={`user-data-cell`}>{value || '-'}</td>;
                                                    })}
                                                </tr>
                                            </React.Fragment>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        </div>
                    </>)}
                    {fields.includes('execution_date') && (
                        <Form.Group className="mb-3">
                            <Form.Label className="field-label">Выберите дату выполнения</Form.Label>
                            <Form.Control className="mt-3 custom-input" type="date" name="execution_date"
                                value={formData.execution_date ? moment(formData.execution_date).format('YYYY-MM-DD') : ''} onChange={onChange}/>
                            <p>Вы можете поменять у задачи тип повторения, он применится для всех задач ПОСЛЕ ВВЕДЕННОЙ ДАТЫ ВЫПОЛНЕНИЯ и ДО ДЕДЛАЙНА (в вашем случае дедлайн: {new Date(formData.deadline).toLocaleDateString('ru-RU')}).</p>
                            <p>При этом удалятся все сроки задачи после введенной даты выполнения, которые не были начаты.</p>
                            <p>И создадутся новые сроки задачи после введенной даты выполнения в соответствии с выбранным типом повторения.</p>
                            <p>Плановое время начала и окончания будет применено для созданных сроков задачи.</p>
                        </Form.Group>
                    )}
                    {fields.includes('number_repeat') && (
                        <Form.Group className="mb-3">
                            <Form.Label className="field-label">Тип повторения</Form.Label><br/>
                            <Form.Select className="mt-3 mb-3 p-4 modal-input" name="repeat_type_id" value={formData.repeat_type_id || ''} onChange={onChange}>
                                {users.map(type => (
                                    <option key={type.id} value={type.id}>{type.type_name} — {type.description}</option>
                                ))}
                            </Form.Select>
                            {formData.repeat_type_id && (
                                <div className="repeat-options mt-3">
                                    {(formData.repeat_type_id === 5 || formData.repeat_type_id === '5') && (
                                        <Form.Group className="mb-3">
                                            <Form.Label className="field-label">Повторять каждые N дней</Form.Label>
                                            <Form.Control type="number" className="mt-2 custom-input" name="number_repeat"
                                                value={formData.number_repeat?.[0] || '1'}
                                                onChange={(e) => {
                                                    const newValue = [parseInt(e.target.value) || 1];
                                                    onChange({target: {name: 'number_repeat', value: newValue}});
                                                }} min="1" max="365" placeholder="Введите количество дней"/>
                                        </Form.Group>
                                    )}
                                    {(formData.repeat_type_id === 3 || formData.repeat_type_id === '3') && (
                                        <Form.Group className="mb-3">
                                            <Form.Label className="field-label">Дни недели (можно выбрать несколько, удерживайте Ctrl (Cmd на Mac))</Form.Label>
                                            <Form.Select className="mt-5 modal-input repeat-select" multiple size="7" name="number_repeat"
                                                value={formData.number_repeat?.map(String) || []}
                                                onChange={(e) => {
                                                    const selected = Array.from(e.target.selectedOptions, opt => parseInt(opt.value));
                                                    onChange({target: {name: 'number_repeat', value: selected.length ? selected : [1]}});
                                                }}>
                                                    <option value="1">Понедельник</option>
                                                    <option value="2">Вторник</option>
                                                    <option value="3">Среда</option>
                                                    <option value="4">Четверг</option>
                                                    <option value="5">Пятница</option>
                                                    <option value="6">Суббота</option>
                                                    <option value="7">Воскресенье</option>
                                            </Form.Select>
                                        </Form.Group>
                                    )}
                                    {(formData.repeat_type_id === 4 || formData.repeat_type_id === '4') && (
                                        <Form.Group className="mb-3">
                                            <Form.Label className="field-label">Числа месяца (можно выбрать несколько, удерживайте Ctrl (Cmd на Mac))</Form.Label>
                                            <Form.Select className="mt-2 modal-input repeat-select" multiple size="5" name="number_repeat"
                                                value={formData.number_repeat?.map(String) || []}
                                                onChange={(e) => {
                                                    const selected = Array.from(e.target.selectedOptions, opt => parseInt(opt.value));
                                                    onChange({target: { name: 'number_repeat', value: selected}});
                                                }}>
                                                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                                                    <option key={day} value={day}>{day} число</option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    )}
                                </div>
                            )}
                        </Form.Group>
                    )}
                    {fields.includes('planned_start_time') && (<>
                        <Form.Group className="mb-3">
                            <Form.Label className="field-label">Дата выполнения задачи</Form.Label>
                            <Form.Control className="mt-3 custom-input" type="date" name="execution_date"
                                value={formData.execution_date ? moment(formData.execution_date).format('YYYY-MM-DD') : ''} readonly/>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="field-label">Выберите плановое время начала выполнения</Form.Label>
                            <Form.Control className="mt-3 custom-input" type="time" name="planned_start_time"
                                value={formData.planned_start_time ? formData.planned_start_time.substring(0, 5) : ''} onChange={onChange}
                                step="300" style={{color: (formData.planned_start_time.substring(0, 5) >= formData.start_working_day.substring(0, 5) && formData.planned_start_time.substring(0, 5) <= formData.end_working_day.substring(0, 5)) ? '#28a745' : '#dc3545'}}/>
                            </Form.Group>
                    </>)}
                    {fields.includes('planned_end_time') && (
                        <Form.Group className="mb-3">
                            <Form.Label className="field-label">Выберите плановое время окончания выполнения</Form.Label>
                            <Form.Control className="mt-3 custom-input" type="time" name="planned_end_time"
                                value={formData.planned_end_time ? formData.planned_end_time.substring(0, 5) : ''} onChange={onChange} step="300"
                                style={{color: (formData.planned_end_time.substring(0, 5) >= formData.start_working_day.substring(0, 5) && formData.planned_end_time.substring(0, 5) <= formData.end_working_day.substring(0, 5)) ? '#28a745' : '#dc3545'}}/>
                            <p>⏰ Рабочий день: с {formData.start_working_day.substring(0, 5)} до {formData.end_working_day.substring(0, 5)}</p>
                            <p>Вы можете выбрать любое время, ограничений нет</p>
                            <p>Изменение времени применится только на выбранную дату выполнения</p>
                            <p>Поменять время можно, выбрав в списке задач нужную дату (Отображение: конкретный день), 
                                выбрав во вкладке Матрица нужную дату (Отображение: конкретный день) или выбрав нужный день в Календаре</p>
                            <p>После выбора дня нажмите на нужную задачу</p>
                        </Form.Group>
                    )}
                    {fields.includes('deadline') && (
                        <Form.Group className="mb-3">
                            <Form.Label className="field-label">Выберите дату дедлайна</Form.Label>
                            <Form.Control className="mt-3 custom-input" type="date" name="deadline"
                                value={formData.deadline ? moment(formData.deadline).format('YYYY-MM-DD') : ''} onChange={onChange}/>
                        </Form.Group>
                    )}
                    {fields.includes('deadline_task') && (
                        <Form.Group className="mb-3">
                            <Form.Label className="field-label">Установить этот дейдлайн для этапов задачи?</Form.Label>
                            <Form.Check type="checkbox" id="use-deadline" label={useDeadline ? "Да, установить дедлайн" : "Нет, не устанавливать"}
                                checked={useDeadline || false}
                                onChange={(e) => {
                                    const newValue = e.target.checked;
                                    setUseDeadline(newValue);
                                }}/>
                            <p>Если хотите удалить сроки задач до дедлайна, поменяйте тип повторения</p>
                        </Form.Group>                            
                    )}
                    {fields.includes('pomodoros_planned') && (
                        <Form.Group className="mb-3">
                            <Form.Label className="field-label">Количество помидоров</Form.Label><br/>
                            <Form.Control className="mt-3 custom-input" type="number" name="pomodoros_planned"
                                value={formData.pomodoros_planned || ''} onChange={onChange}/>
                        </Form.Group>
                    )}
                    {fields.includes('task_selector') && (<>
                        <div className="task-selector-list">
                            <Form.Check className="task-selector-item" type="checkbox" label="Выбрать все задачи" checked={extraData.selectAllTasks}
                                onChange={(e) => {extraData.setSelectAllTasks(e.target.checked);
                                    if (e.target.checked) extraData.setSelectedTaskIds(users.map(t => t.task_id));
                                    else extraData.setSelectedTaskIds([]);}}/>
                            {[...users].sort((a, b) => {
                                if (a.project_name !== b.project_name) return a.project_name.localeCompare(b.project_name);
                                    return a.task_name.localeCompare(b.task_name);
                            })
                            .map(task => (
                                <div key={task.task_id} className="task-selector-item">
                                    <Form.Check type="checkbox" id={`task-${task.task_id}`}
                                        label={<span>
                                            <strong>{task.task_name}</strong>
                                            <span className="task-project-label"> ({task.project_name})</span>
                                            <span className="task-project-label"> ({task.status_name})</span>
                                        </span>}
                                        checked={extraData.selectedTaskIds.includes(task.task_id)}
                                        onChange={(e) => {
                                            if (e.target.checked) extraData.setSelectedTaskIds([...extraData.selectedTaskIds, task.task_id]);
                                            else extraData.setSelectedTaskIds(extraData.selectedTaskIds.filter(id => id !== task.task_id));
                                            extraData.setSelectAllTasks(extraData.selectedTaskIds.length + 1 === users.length);
                                        }}/>
                                </div>
                            ))}
                        </div>
                        <div className="task-selector-footer"><span>Выбрано задач: {extraData.selectedTaskIds.length} из {users.length}</span></div>
                    </>)}
                </Form>
            </Modal.Body>
            <Modal.Footer>
                {extraData && extraData.button ? (<Button variant="primary" onClick={onHide}>{extraData.button}</Button>) :
                (<><Button variant="secondary" onClick={onHide}>Закрыть</Button>
                {fields.includes('deadline_task') ? <Button variant="primary" onClick={() => onSave(useDeadline)}>{isNew ? 'Добавить' : 'Сохранить'}</Button> :
                    <Button variant="primary" onClick={onSave}>{isNew ? 'Добавить' : 'Сохранить'}</Button>}</>)}
            </Modal.Footer>
        </Modal>
    );
};
export default ModalStr;