import { toast } from "react-hot-toast";

// Custom notification hook with predefined styles and messages
export const useNotifications = () => {
  const notify = {
    // Success notifications
    success: (message, options = {}) => {
      return toast.success(message, {
        duration: 4000,
        position: 'top-right',
        style: {
          background: '#1a1e23',
          color: '#4caf50',
          border: '1px solid #4caf50',
          borderRadius: '8px',
          fontWeight: '500',
        },
        iconTheme: {
          primary: '#4caf50',
          secondary: '#1a1e23',
        },
        ...options
      });
    },

    // Error notifications
    error: (message, options = {}) => {
      return toast.error(message, {
        duration: 5000,
        position: 'top-right',
        style: {
          background: '#1a1e23',
          color: '#f44336',
          border: '1px solid #f44336',
          borderRadius: '8px',
          fontWeight: '500',
        },
        iconTheme: {
          primary: '#f44336',
          secondary: '#1a1e23',
        },
        ...options
      });
    },

    // Warning notifications
    warning: (message, options = {}) => {
      return toast(message, {
        duration: 4500,
        position: 'top-right',
        style: {
          background: '#1a1e23',
          color: '#ff9800',
          border: '1px solid #ff9800',
          borderRadius: '8px',
          fontWeight: '500',
        },
        icon: '⚠️',
        ...options
      });
    },

    // Info notifications
    info: (message, options = {}) => {
      return toast(message, {
        duration: 4000,
        position: 'top-right',
        style: {
          background: '#1a1e23',
          color: '#00a1e0',
          border: '1px solid #00a1e0',
          borderRadius: '8px',
          fontWeight: '500',
        },
        icon: 'ℹ️',
        ...options
      });
    },

    // Action-specific notifications
    actionComplete: (action, item = '') => {
      const messages = {
        'delete_review': `Review deleted successfully! ${item ? `from ${item}` : ''}`,
        'add_project': `Project "${item}" added successfully!`,
        'update_project': `Project "${item}" updated successfully!`,
        'delete_project': `Project "${item}" deleted successfully!`,
        'status_change': `Project status updated to "${item}"!`,
        'profile_update': 'Profile updated successfully!',
        'artwork_upload': `Artwork "${item}" uploaded successfully!`,
        'artwork_delete': `Artwork "${item}" deleted successfully!`,
        'award_add': `Award "${item}" added successfully!`,
        'award_delete': `Award "${item}" deleted successfully!`,
        'experience_add': 'Experience added successfully!',
        'experience_update': 'Experience updated successfully!',
        'experience_delete': 'Experience deleted successfully!',
        'specialization_update': 'Specialization updated successfully!',
        'basic_details_update': 'Basic details updated successfully!',
      };

      const message = messages[action] || `${action} completed successfully!`;
      return notify.success(message);
    },

    // Loading notifications
    loading: (message, options = {}) => {
      return toast.loading(message, {
        position: 'top-right',
        style: {
          background: '#1a1e23',
          color: '#00a1e0',
          border: '1px solid #00a1e0',
          borderRadius: '8px',
          fontWeight: '500',
        },
        ...options
      });
    },

    // Dismiss notifications
    dismiss: (toastId) => {
      toast.dismiss(toastId);
    },

    // Dismiss all notifications
    dismissAll: () => {
      toast.dismiss();
    }
  };

  return notify;
};

// Predefined notification messages for common actions
export const NOTIFICATION_MESSAGES = {
  REVIEW_DELETED: 'Review deleted successfully!',
  PROJECT_ADDED: 'Project added successfully!',
  PROJECT_UPDATED: 'Project updated successfully!',
  PROJECT_DELETED: 'Project deleted successfully!',
  STATUS_CHANGED: 'Project status updated successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  UPLOAD_SUCCESS: 'Upload completed successfully!',
  SAVE_SUCCESS: 'Changes saved successfully!',
  DELETE_SUCCESS: 'Item deleted successfully!',
  ERROR_OCCURRED: 'An error occurred. Please try again.',
  LOADING: 'Processing your request...',
  EMAIL_SENT: 'Email notification sent successfully!',
  VALIDATION_ERROR: 'Please check your input and try again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
};
