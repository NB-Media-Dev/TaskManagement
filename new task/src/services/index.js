import api from './api';



// ---------- Auth ----------
export const createAccount = ({ username, email, password, role }) =>
  api.post('/create', { username, email, password, role });

export const login = ({ email, password, role }) =>
  api.post('/Login', { email, password, role });

export const resetPassword = ({ email, password }) =>
  api.post('/forget', { email, password });

// ---------- Employees ----------
export const getNextEmpId = () => api.get('/next-emp-id');

export const addEmployee = ({ id, name, email, phone, gender, salary, role, password }) =>
  api.post('/AddEmployee', { id, name, email, phone, gender, salary, role, password });

export const getEmployees = (id) =>
  api.get('/AdminEmployee', { params: id ? { id } : {} });

export const deleteEmployee = (id) => api.delete(`/DeleteEmployee/${id}`);

export const updateEmployee = (id, data) =>
  api.put(`/updateEmployee/${id}`, data);

export const makeTL = (id) => api.put(`/MakeTL/${id}`);
export const undoTL = (id) => api.put(`/UndoTL/${id}`);

export const changePassword = ({ email,  newPassword }) =>
  api.post('/ChangePassword', { email, newPassword });


// ---------- Attendance ----------
export const getAttendance = ({ id, from, to } = {}) =>
  api.get('/AdminAttendance', { params: { id, from, to } });



// ---------- Tasks ----------
export const assignTask = ({ task, role, assign, dline, descrip, team_name }) =>
  api.post('/AdminAssign', { task, role, assign, dline, descrip, team_name });

export const getTasks = ({ id, from, to, status } = {}) =>
  api.get('/AdminTasks', { params: { id, from, to, status } });

export const updateTaskStatus = ({ assign_id, task_name, assign_to, status, remarks, daily_update, tl_reply, performance }) =>
  api.post('/UpdateTaskStatus', { assign_id, task_name, assign_to, status, remarks, daily_update, tl_reply, performance });


export * from "./notification";
