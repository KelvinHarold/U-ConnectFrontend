
// src/services/announcementService.js
import api from '../api/axios';

export const announcementService = {
    // Get all announcements (admin)
    getAllAnnouncements: (params = {}) => {
        // Clean params - remove empty values
        const cleanParams = {};
        if (params.status && params.status !== '') {
            cleanParams.status = params.status;
        }
        if (params.audience && params.audience !== '') {
            cleanParams.audience = params.audience;
        }
        if (params.search && params.search !== '') {
            cleanParams.search = params.search;
        }
        return api.get('/announcements', { params: cleanParams });
    },
    
    // Get published announcements for users (filtered by role automatically)
    getPublishedAnnouncements: () => {
        return api.get('/published-announcements');
    },
    
    // Get single announcement
    getAnnouncement: (id) => {
        return api.get(`/announcements/${id}`);
    },
    
    // Create announcement
    createAnnouncement: (data) => {
        return api.post('/announcements', data);
    },
    
    // Update announcement
    updateAnnouncement: (id, data) => {
        return api.put(`/announcements/${id}`, data);
    },
    
    // Delete announcement
    deleteAnnouncement: (id) => {
        return api.delete(`/announcements/${id}`);
    },
    
    // Bulk update status
    bulkUpdateStatus: (announcementIds, status) => {
        return api.post('/announcements/bulk-update-status', { announcement_ids: announcementIds, status });
    }
};