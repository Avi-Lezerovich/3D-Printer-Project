import React from 'react';

// Import CSS styles
import '../styles/project-management.css';
// Temporarily use simple shell for debugging
import { SimpleManagementShell } from '../features/project-management/hub/SimpleManagementShell';

export const ProjectManagement: React.FC = () => <SimpleManagementShell />;
export default ProjectManagement;
