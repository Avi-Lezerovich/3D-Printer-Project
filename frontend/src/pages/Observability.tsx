import { MetricsPanel } from '../features/metrics/MetricsPanel';
import { AuditLogPanel } from '../features/audit/AuditLogPanel';
import Protected from '../core/components/Protected';

export default function ObservabilityPage(){
  return <Protected>
    <div className="container mx-auto p-4 grid gap-4 md:grid-cols-2">
      <MetricsPanel />
      <AuditLogPanel />
    </div>
  </Protected>;
}
