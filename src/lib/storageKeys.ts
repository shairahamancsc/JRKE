
// These keys are for localStorage and will be gradually phased out as data moves to server-side storage.
export const LABOURS_STORAGE_KEY = 'jrk-labour-management-labours'; // Will be replaced by Vercel KV based key
export const ADVANCES_STORAGE_KEY = 'jrk-labor-management-advances';
export const WORK_LOGS_STORAGE_KEY = 'jrk-labor-management-work-logs';
export const DAILY_ENTRIES_STORAGE_KEY = 'jrk-labor-management-daily-entries';
export const AUTH_STORAGE_KEY = 'jrk-auth-status';
export const CURRENT_USER_STORAGE_KEY = 'jrk-current-user';
export const SUPERVISORS_STORAGE_KEY = 'jrk-supervisors';
export const PROPRIETOR_DOCUMENTS_STORAGE_KEY = 'jrk-proprietor-documents';

// Vercel KV specific keys (example for labours)
export const LABOURS_KV_STORAGE_KEY = 'jrk_labours'; // Changed hyphen to underscore
