import api from "./api";


export const getNotifications = (email)=>{
    return api.get(`/notifications/${email}`);
};


export const createNotification = (data)=>{
    return api.post("/notifications",data);
};


export const markNotificationRead=(id)=>{
    return api.put(`/notifications/${id}/read`);
};

export const markAllNotificationsRead=(email)=>{
    return api.put(`/notifications/read-all/${email}`);
};