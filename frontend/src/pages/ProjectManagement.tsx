import React from 'react';

// Import CSS styles
import '../styles/project-management.css';
// Temporarily use simple shell for debugging
import { ModernManagementShell } from '../features/project-management/hub/ModernManagementShell';

export const ProjectManagement: React.FC = () => {
	// Toggle which shell to render; modern shell currently uses demo data
	return <ModernManagementShell />;
};
export default ProjectManagement;
