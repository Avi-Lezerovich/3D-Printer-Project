import Protected from '../core/components/Protected';
import { ProjectsAnalyticsPanel } from '../features/projects/ProjectsAnalyticsPanel';

export default function ProjectAnalyticsPage(){
  return <Protected>
    <div className="container mx-auto p-4">
      <ProjectsAnalyticsPanel />
    </div>
  </Protected>;
}
