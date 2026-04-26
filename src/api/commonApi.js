import { $authHost, $host  } from "./index";

export const login = async (email, password) => {
    const { data } = await $authHost.post('/api/login', {email, password});
    return data; // Возвращаем данные от сервера
}
export const registration = async (first_name, last_name, email, password, phone_number, birthday) => {
    const { data } = await $authHost.post('/api/registration', { first_name, last_name, email, password, phone_number, birthday });
    return data; // Возвращаем данные от сервера
}



export const get_profile_settings_email = async () => {
    const { data } = await $host.get(`/api/profile_settings_email/`);
    return data; // Возвращаем данные от сервера
}
export const get_profile_user_email = async () => {
    const { data } = await $host.get(`/api/profile_user_email/`);
    return data; // Возвращаем данные от сервера
}
export const profile_user_put = async (id, last_name, first_name, email, curPassword, newPassword, phone_number, birthday, role_name, note) => {
    const { data } = await $host.put(`/api/profile_put/${id}`, {last_name, first_name, email, curPassword, newPassword, phone_number, birthday, role_name, note});
    return data; // Возвращаем данные от сервера
}
export const profile_settings_put = async (id, formData) => {
    const { data } = await $host.put(`/api/settings_put/${id}`, {formData});
    return data; // Возвращаем данные от сервера
}
export const get_profile_matrix_email = async () => {
    const { data } = await $host.get(`/api/profile_matrix_email/`);
    return data; // Возвращаем данные от сервера
}
export const profile_matrix_put = async (id, users_id, matrix_part, name, description, color) => {
    const { data } = await $host.put(`/api/matrix_put/${id}`, {users_id, matrix_part, name, description, color});
    return data; // Возвращаем данные от сервера
}
export const get_profile_status_email = async () => {
    const { data } = await $host.get(`/api/profile_status_email/`);
    return data; // Возвращаем данные от сервера
}
export const get_admin_settings_note = async (note) => {
    const { data } = await $host.get(`/api/profile_settings_note/${note}`);
    return data; // Возвращаем данные от сервера
}
export const get_admin_matrix_note = async () => {
    const { data } = await $host.get(`/api/profile_matrix_note`);
    return data; // Возвращаем данные от сервера
}
export const get_admin_status_note = async (note) => {
    const { data } = await $host.get(`/api/profile_status_note/${note}`);
    return data; // Возвращаем данные от сервера
}
export const profile_status_put = async (id, name, users_id, system_code) => {
    const { data } = await $host.put(`/api/status_put/${id}`, {name, users_id, system_code});
    return data; // Возвращаем данные от сервера
}
export const profile_status_add = async (status_name, users_id, system_code) => {
    const { data } = await $host.post(`/api/status_add/`, {status_name, users_id, system_code});
    return data; // Возвращаем данные от сервера
}



export const get_settings = async () => {
    const { data } = await $host.get(`/api/settings/`);
    return data; // Возвращаем данные от сервера
}
export const get_users = async () => {
    const { data } = await $host.get(`/api/users/`);
    return data; // Возвращаем данные от сервера
}
export const get_matrix = async () => {
    const { data } = await $host.get(`/api/matrix/`);
    return data; // Возвращаем данные от сервера
}
export const get_status = async () => {
    const { data } = await $host.get(`/api/status/`);
    return data; // Возвращаем данные от сервера
}
export const user_post = async (userData) => {
    const { data } = await $host.post(`/api/user_add/`, {userData});
    return data; // Возвращаем данные от сервера
}
export const user_put = async (id, userData) => {
    const { data } = await $host.put(`/api/user_put/${id}`, {userData});
    return data; // Возвращаем данные от сервера
}




export const get_projects = async () => {
    const { data } = await $host.get(`/api/projects/`);
    return data; // Возвращаем данные от сервера
}
export const project_post = async (project_name, description, color, is_active) => {
    const { data } = await $host.post(`/api/project_add/`, {project_name, description, color, is_active});
    return data; // Возвращаем данные от сервера
}
export const project_delete = async (id) => {
    const { data } = await $host.delete(`/api/project_delete/${id}`);
    return data; // Возвращаем данные от сервера
}
export const get_projects_with_user = async () => {
    const { data } = await $host.get(`/api/projects_with_users/`);
    return data; // Возвращаем данные от сервера
}
export const project_put = async (id, users_id, project_name, description, color, is_active) => {
    const { data } = await $host.put(`/api/projects_put/${id}`, {users_id, project_name, description, color, is_active});
    return data; // Возвращаем данные от сервера
}


export const get_project_by_id = async (id) => {
    const { data } = await $host.get(`/api/project/${id}`);
    return data; // Возвращаем данные от сервера
}
export const get_tasks_by_id = async (id) => {
    const { data } = await $host.get(`/api/tasks/${id}`);
    return data; // Возвращаем данные от сервера
}
export const get_tasks = async () => {
    const { data } = await $host.get(`/api/tasks_to_user/`);
    return data; // Возвращаем данные от сервера
}
export const get_tasks_for_gantt = async () => {
    const { data } = await $host.get(`/api/tasks_for_gantt`);
    return data; // Возвращаем данные от сервера
}
export const get_dates_stages_history = async (startDate, endDate) => {
    const { data } = await $host.get(`/api/dates_stages_history_to_user?startDate=${startDate}&endDate=${endDate}`);
    return data;
};
export const get_datesTasks = async () => {
    const { data } = await $host.get(`/api/dates_tasks/`);
    return data; // Возвращаем данные от сервера
}
export const get_datesStages = async () => {
    const { data } = await $host.get(`/api/dates_stages/`);
    return data; // Возвращаем данные от сервера
}
export const get_export_date_from_dates_tasks_history = async () => {
    const { data } = await $host.get(`/api/export_date_from_dates_tasks_history/`);
    return data; // Возвращаем данные от сервера
}
export const post_dates_tasks_history = async (dateInput) => {
    const { data } = await $host.post(`/api/dates_tasks_history_add/`, {dateInput});
    return data; // Возвращаем данные от сервера
}
export const get_all_tasks = async () => {
    const { data } = await $host.get(`/api/all_tasks_to_all_projects_not_complete/`);
    return data; // Возвращаем данные от сервера
}
export const get_info_task_by_id = async (id, execution_date) => {
    const { data } = await $host.get(`/api/info_task/${id}?execution_date=${execution_date}`);
    return data; // Возвращаем данные от сервера
}
export const task_put = async (id, value, field, isChangeDeadline) => {
    const { data } = await $host.put(`/api/task_put/${id}`, {value, field, isChangeDeadline});
    return data; // Возвращаем данные от сервера
}
export const dates_tasks_put_for_task = async (formData) => {
    const { data } = await $host.put(`/api/dates_tasks_put_for_task/`, {formData});
    return data; // Возвращаем данные от сервера
}
export const get_repeat_types = async () => {
    const { data } = await $host.get(`/api/repeat_types/`);
    return data; // Возвращаем данные от сервера
}
export const get_executionStatus = async () => {
    const { data } = await $host.get(`/api/execution_status/`);
    return data; // Возвращаем данные от сервера
}
export const repeat_task_put = async (taskId, repeat_type_id, number_repeat, execution_date, newDates, planned_start_time, planned_end_time) => {
    const response = await $host.put(`/api/update_repeat_type/${taskId}`, {repeat_type_id, number_repeat, execution_date, newDates, planned_start_time, planned_end_time});
    return response.data;
  };
export const  repeat_type_put = async (id, type_name, description) => {
    const response = await $host.put(`/api/repeat_type_table_put/${id}`, {type_name, description});
    return response.data;
  };
export const  execution_status_put = async (id, exec_status_name, color) => {
    const response = await $host.put(`/api/execution_status_table_put/${id}`, {exec_status_name, color});
    return response.data;
  };  
export const    put_statusExec = async () => {
    const response = await $host.put(`/api/execution_status_put_overdue`);
    return response.data;
  };  
  export const dates_tasks_get_for_task = async (id) => {
    const { data } = await $host.get(`/api/dates_tasks_for_task/${id}`);
    return data; // Возвращаем данные от сервера
}
export const task_post = async (id, formData) => {
    const { data } = await $host.post(`/api/task_add/`, {id, formData});
    return data; // Возвращаем данные от сервера
}
export const  status_put_for_task = async (id, status) => {
    const response = await $host.put(`/api/status_put_for_task/${id}`, {status});
    return response.data;
  };
 export const  get_info_dates_tasks = async (id) => {
    const { data } = await $host.get(`/api/info_dates_tasks/${id}`);
    return data; // Возвращаем данные от сервера
}
 export const  get_info_dates_stages = async (id) => {
    const { data } = await $host.get(`/api/info_dates_stages/${id}`);
    return data; // Возвращаем данные от сервера
}
export const get_all_tasks_only_complete = async () => {
    const { data } = await $host.get(`/api/all_tasks_to_all_projects_only_complete/`);
    return data; // Возвращаем данные от сервера
}
export const get_tasks_name = async () => {
    const { data } = await $host.get(`/api/tasks_name/`);
    return data; // Возвращаем данные от сервера
}
export const pomodoro_post = async (task_id, stage_id, pomodoro_date, start_time, end_time, duration, was_interrupted) => {
    const { data } = await $host.post(`/api/pomodoro_add/`, {task_id, stage_id, pomodoro_date, start_time, end_time, duration, was_interrupted});
    return data; // Возвращаем данные от сервера
}
export const get_pomodoro = async () => {
    const { data } = await $host.get(`/api/pomodoro/`);
    return data; // Возвращаем данные от сервера
}
export const get_export_date_from_pomodoro_history = async () => {
    const { data } = await $host.get(`/api/export_date_from_pomodoro_history/`);
    return data; // Возвращаем данные от сервера
}
export const post_pomodoro_history = async (dateInput) => {
    const { data } = await $host.post(`/api/pomodoro_history_add/`, {dateInput});
    return data; // Возвращаем данные от сервера
}
export const get_stages_by_task_id = async (id, execution_date) => {
    const { data } = await $host.get(`/api/stages/${id}?execution_date=${execution_date}`);
    return data; // Возвращаем данные от сервера
}
export const stage_post = async (id, formData) => {
    const { data } = await $host.post(`/api/stage_add/`, {id, formData});
    return data; // Возвращаем данные от сервера
}
export const  updateStagesOrder = async (stages) => {
    const response = await $host.put(`/api/stage_order_put/`, {stages});
    return response.data;
};
export const get_info_stage_by_id = async (id, execution_date) => {
    const { data } = await $host.get(`/api/info_stage/${id}?execution_date=${execution_date}`);
    return data; // Возвращаем данные от сервера
}
export const stage_put = async (id, value, field) => {
    const { data } = await $host.put(`/api/stage_put/${id}`, {value, field});
    return data; // Возвращаем данные от сервера
}
export const dates_stages_put_for_stage = async (formData) => {
    const { data } = await $host.put(`/api/dates_stages_put_for_stage/`, {formData});
    return data; // Возвращаем данные от сервера
}
export const deleteStage = async (id) => {
    const { data } = await $host.delete(`/api/stage_delete/${id}`);
    return data; // Возвращаем данные от сервера
}
export const deleteTask = async (id) => {
    const { data } = await $host.delete(`/api/task_delete/${id}`);
    return data; // Возвращаем данные от сервера
}
export const task_copy = async (project_id, taskId) => {
    const { data } = await $host.post(`/api/task_copy/`, {project_id, taskId});
    return data; // Возвращаем данные от сервера
}
export const get_tasks_time_pomodoro = async (date) => {
    const { data } = await $host.get(`/api/get_tasks_time_pomodoro?date=${date}`);
    return data;
};
export const get_PomodoroWithoutTasks = async (date) => {
    const { data } = await $host.get(`/api/get_PomodoroWithoutTasks?date=${date}`);
    return data;
};
export const get_tasks_with_user = async () => {
    const { data } = await $host.get(`/api/tasks_with_user`);
    return data;
};
export const get_stages = async () => {
    const { data } = await $host.get(`/api/stages_pomodoro/`);
    return data; // Возвращаем данные от сервера
}
export const execution_status_add = async (exec_status_name, code, color) => {
    const { data } = await $host.post(`/api/execution_status_add/`, {exec_status_name, code, color});
    return data; // Возвращаем данные от сервера
}