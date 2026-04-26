import React, { useState } from 'react';
import { Modal, Form, Button, Table } from 'react-bootstrap';
import moment from 'moment';

const ModalStr = ({ 
    show, 
    onHide,
    modalType,
    title,
    formData,
    onChange,
    onSave, 
    error,
    isNew,
    fields,
    users = [],
    extraData = {}
}) => {
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
                            <Form.Select
                                className="mt-3 mb-3 p-4 modal-input"
                                name="users_id"
                                value={formData.users_id || ''}
                                onChange={onChange}
                            >
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.email} {user.role_name === 'admin' ? '(Администратор)' : ''}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    )}
                    {fields.includes('project_name') && (
                        <Form.Group className="mb-3">
                            <Form.Label className="field-label">Название проекта</Form.Label>
                            <Form.Control
                                className="mt-3 custom-input"
                                type="text"
                                name="project_name"
                                value={formData.project_name || ''}
                                onChange={onChange}
                            />
                        </Form.Group>
                    )}
                    {fields.includes('task_name') && (
                            <Form.Group className="mb-3">
                                <Form.Label className="field-label">Название</Form.Label><br/>
                                <Form.Control
                                    className="mt-3 custom-input"
                                    type="text"
                                    name="task_name"
                                    value={formData.task_name || ''}
                                    onChange={onChange}
                                />
                            </Form.Group>
                        )}
                    {fields.includes('stage_name') && (
                            <Form.Group className="mb-3">
                                <Form.Label className="field-label">Название этапа</Form.Label><br/>
                                <Form.Control
                                    className="mt-3 custom-input"
                                    type="text"
                                    name="stage_name"
                                    value={formData.stage_name || ''}
                                    onChange={onChange}
                                />
                            </Form.Group>
                        )}
                    {fields.includes('description') && (
                        <Form.Group className="mb-3">
                            <Form.Label className="field-label">Описание</Form.Label><br/>
                            <Form.Control
                                className="mt-3 custom-input"
                                type="text"
                                name="description"
                                value={formData.description || ''}
                                onChange={onChange}
                            />
                        </Form.Group>
                    )}
                    {fields.includes('is_active') && (
                    <Form.Group className="mb-3">
                        <Form.Label className="field-label">Активен ли</Form.Label>
                        <Form.Select
                            className="mt-3 mb-3 p-4 modal-input"
                            name="is_active"
                            value={formData.is_active}
                            onChange={onChange}
                        >
                            <option value="true">Активен</option>
                            <option value="false">Не активен</option>
                        </Form.Select>
                    </Form.Group>
                    )}
                    {fields.includes('color') && (
                    <Form.Group className="mb-3">
                        <Form.Label className="matrix-field-label">Цвет</Form.Label>
                        <div className="color-picker-container">
                            <Form.Control
                                type="color"
                                name="color"
                                value={formData.color}
                                onChange={onChange}
                                className="color-picker"
                                title="Выберите цвет"
                            />
                            <span className="color-preview" style={{backgroundColor: formData.color}}></span>
                            <span className="color-value">{formData.color}</span>                                               
                        </div>
                    </Form.Group>
                    )}
                    {fields.includes('archiveStartDate') && (
                        <Form.Group className="mb-3">
                            <p>Выбранная дата находится в архиве. Выберите период для просмотра архивных данных.</p>
                            <Form.Label className="field-label">Начальная дата</Form.Label>
                            <Form.Control
                                className="mt-3 custom-input"
                                type="date"
                                name="archiveStartDate"
                                value={formData.archiveStartDate ? moment(formData.archiveStartDate).format('YYYY-MM-DD') : ''}
                                onChange={onChange}/>
                        </Form.Group>
                        )}
                        {fields.includes('archiveEndDate') && (
                        <Form.Group className="mb-3">
                            <Form.Label className="field-label">Конечная дата</Form.Label>
                            <Form.Control
                                className="mt-3 custom-input"
                                type="date"
                                name="archiveEndDate"
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
                            <Form.Select
                                className="mt-3 mb-3 p-4 modal-input"
                                name="project_id"
                                value={formData.project_id || ''}
                                onChange={onChange}
                            >
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
                            <Form.Select
                                className="mt-3 mb-3 p-4 modal-input"
                                name="matrix_id"
                                value={formData.matrix_id || ''}
                                onChange={onChange}
                            >
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
                            <Form.Select
                                className="mt-3 mb-3 p-4 modal-input"
                                name="system_code"
                                value={formData.system_code || ''}
                                onChange={onChange}
                            >
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
                                        {extraData.titleColums.map((header, index) => (
                                            <th key={index}>{header}</th>
                                        ))}
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
                                <Form.Control
                                    className="mt-3 custom-input"
                                    type="date"
                                    name="execution_date"
                                    value={formData.execution_date ? moment(formData.execution_date).format('YYYY-MM-DD') : ''}
                                    onChange={onChange}
                                />
                                <p>Вы можете поменять у задачи тип повторения, он применится для всех задач ПОСЛЕ ВВЕДЕННОЙ ДАТЫ ВЫПОЛНЕНИЯ и ДО ДЕДЛАЙНА (в вашем случае дедлайн: {new Date(formData.deadline).toLocaleDateString('ru-RU')}).</p>
                                <p>При этом удалятся все сроки задачи после введенной даты выполнения, которые не были начаты.</p>
                                <p>И создадутся новые сроки задачи после введенной даты выполнения в соответствии с выбранным типом повторения.</p>
                                <p>Плановое время начала и окончания будет применено для созданных сроков задачи.</p>
                            </Form.Group>
                        )}
                        {fields.includes('number_repeat') && (
                            <Form.Group className="mb-3">
                                <Form.Label className="field-label">Тип повторения</Form.Label><br/>
                                
                                {/* Select для выбора типа повторения */}
                                <Form.Select
                                    className="mt-3 mb-3 p-4 modal-input"
                                    name="repeat_type_id"
                                    value={formData.repeat_type_id || ''}
                                    onChange={onChange}
                                >
                                    {users.map(type => (
                                        <option key={type.id} value={type.id}>
                                            {type.type_name} — {type.description}
                                        </option>
                                    ))}
                                </Form.Select>
                                {/* Дополнительные поля в зависимости от выбранного типа */}
                                {formData.repeat_type_id && (
                                    <div className="repeat-options mt-3">
                                        {/* Для типа "Раз в N дней" (id=5) */}
                                        {(formData.repeat_type_id === 5 || formData.repeat_type_id === '5') && (
                                            <Form.Group className="mb-3">
                                                <Form.Label className="field-label">Повторять каждые N дней</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    className="mt-2 custom-input"
                                                    name="number_repeat"
                                                    value={formData.number_repeat?.[0] || '1'}
                                                    onChange={(e) => {
                                                        const newValue = [parseInt(e.target.value) || 1];
                                                        onChange({ 
                                                            target: { 
                                                                name: 'number_repeat', 
                                                                value: newValue 
                                                            } 
                                                        });
                                                    }}
                                                    min="1"
                                                    max="365"
                                                    placeholder="Введите количество дней"
                                                />
                                            </Form.Group>
                                        )}

                                        {/* Для типа "Еженедельно" (id=3) */}
                                        {(formData.repeat_type_id === 3 || formData.repeat_type_id === '3') && (
                                            <Form.Group className="mb-3">
                                                <Form.Label className="field-label">Дни недели (можно выбрать несколько, удерживайте Ctrl (Cmd на Mac))</Form.Label>
                                                <Form.Select
                                                    className="mt-5 modal-input repeat-select"
                                                    multiple
                                                    size="7"
                                                    name="number_repeat"
                                                    value={formData.number_repeat?.map(String) || []}
                                                    onChange={(e) => {
                                                        const selected = Array.from(e.target.selectedOptions, opt => parseInt(opt.value));
                                                        onChange({ 
                                                            target: { 
                                                                name: 'number_repeat', 
                                                                value: selected.length ? selected : [1] // если ничего не выбрано, оставляем понедельник
                                                            } 
                                                        });
                                                    }}
                                                >
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

                                        {/* Для типа "Ежемесячно" (id=4) */}
                                        {(formData.repeat_type_id === 4 || formData.repeat_type_id === '4') && (
                                            <Form.Group className="mb-3">
                                                <Form.Label className="field-label">Числа месяца (можно выбрать несколько, удерживайте Ctrl (Cmd на Mac))</Form.Label>
                                                <Form.Select
                                                    className="mt-2 modal-input repeat-select"
                                                    multiple
                                                    size="5"
                                                    name="number_repeat"
                                                    value={formData.number_repeat?.map(String) || []}
                                                    onChange={(e) => {
                                                        const selected = Array.from(e.target.selectedOptions, opt => parseInt(opt.value));
                                                        onChange({ 
                                                            target: { 
                                                                name: 'number_repeat', 
                                                                value: selected 
                                                            } 
                                                        });
                                                    }}
                                                >
                                                    {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                                                        <option key={day} value={day}>
                                                            {day} число
                                                        </option>
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
                                <Form.Control
                                    className="mt-3 custom-input"
                                    type="date"
                                    name="execution_date"
                                    value={formData.execution_date ? moment(formData.execution_date).format('YYYY-MM-DD') : ''}
                                    readonly
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label className="field-label">Выберите плановое время начала выполнения</Form.Label>
                                <Form.Control
                                    className="mt-3 custom-input"
                                    type="time"
                                    name="planned_start_time"
                                    value={formData.planned_start_time ? formData.planned_start_time.substring(0, 5) : ''}
                                    onChange={onChange}
                                    step="300"
                                    style={{color: (formData.planned_start_time.substring(0, 5) >= formData.start_working_day.substring(0, 5) && formData.planned_start_time.substring(0, 5) <= formData.end_working_day.substring(0, 5)) ? '#28a745' : '#dc3545'}}
                                />
                            </Form.Group>
                            </>)}

                        {fields.includes('planned_end_time') && (
                            <Form.Group className="mb-3">
                                <Form.Label className="field-label">Выберите плановое время окончания выполнения</Form.Label>
                                <Form.Control
                                    className="mt-3 custom-input"
                                    type="time"
                                    name="planned_end_time"
                                    value={formData.planned_end_time ? formData.planned_end_time.substring(0, 5) : ''}
                                    onChange={onChange}
                                    step="300"
                                    style={{color: (formData.planned_end_time.substring(0, 5) >= formData.start_working_day.substring(0, 5) && formData.planned_end_time.substring(0, 5) <= formData.end_working_day.substring(0, 5)) ? '#28a745' : '#dc3545'}}
                                />
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
                                <Form.Control
                                    className="mt-3 custom-input"
                                    type="date"
                                    name="deadline"
                                    value={formData.deadline ? moment(formData.deadline).format('YYYY-MM-DD') : ''}
                                    onChange={onChange}
                                />
                            </Form.Group>)}
                        {fields.includes('deadline_task') && (
                            <Form.Group className="mb-3">
                                <Form.Label className="field-label">Установить этот дейдлайн для этапов задачи?</Form.Label>
                                <Form.Check
                                    type="checkbox"
                                    id="use-deadline"
                                    label={useDeadline ? "Да, установить дедлайн" : "Нет, не устанавливать"}
                                    checked={useDeadline || false}
                                    onChange={(e) => {
                                        const newValue = e.target.checked;
                                        setUseDeadline(newValue);
                                    }}
                                />
                                <p>Если хотите удалить сроки задач до дедлайна, поменяйте тип повторения</p>
                            </Form.Group>                            
                        )}
                        {fields.includes('pomodoros_planned') && (
                            <Form.Group className="mb-3">
                                <Form.Label className="field-label">Количество помидоров</Form.Label><br/>
                                <Form.Control
                                    className="mt-3 custom-input"
                                    type="number"
                                    name="pomodoros_planned"
                                    value={formData.pomodoros_planned || ''}
                                    onChange={onChange}
                                />
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