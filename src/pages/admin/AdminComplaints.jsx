import { useState, useEffect, useCallback } from 'react';
import { AlertCircle, CheckCircle, MessageSquare } from 'lucide-react';
import api from '@/api/axios';
import Card from '@/components/common/Card';
import Table from '@/components/common/Table';
import { ComplaintBadge, PriorityBadge } from '@/components/common/Badge';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import PageTransition from '@/components/layout/PageTransition';
import { Select, Textarea } from '@/components/common/Input';
import { timeAgo, formatDate } from '@/utils/helpers';

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', priority: '' });
  const [selected, setSelected] = useState(null);
  const [notes, setNotes] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchComplaints = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10, ...filters }).toString();
      const { data } = await api.get(`/admin/complaints?${params}`);
      setComplaints(data.data);
      setPagination(data.pagination);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchComplaints(1); }, [fetchComplaints]);

  const openDetail = (c) => {
    setSelected(c);
    setNotes(c.adminNotes || '');
    setNewStatus(c.status);
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await api.put(`/admin/complaints/${selected._id}`, { status: newStatus, adminNotes: notes });
      fetchComplaints(1);
      setSelected(null);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const columns = [
    { key: 'orderId', label: 'Order', render: (v) => <span className="font-mono text-xs">{v?.orderNumber || '—'}</span> },
    { key: 'companyId', label: 'Company', render: (v) => v?.companyName || '—' },
    { key: 'customerName', label: 'Customer' },
    { key: 'category', label: 'Category', render: (v) => <span className="capitalize text-xs">{v?.replace(/_/g, ' ')}</span> },
    { key: 'priority', label: 'Priority', render: (v) => <PriorityBadge priority={v} /> },
    { key: 'status', label: 'Status', render: (v) => <ComplaintBadge status={v} /> },
    { key: 'createdAt', label: 'Filed', render: (v) => <span className="text-xs text-slate-400">{timeAgo(v)}</span> },
    { key: '_id', label: '', render: (_, row) => (
      <Button size="xs" variant="ghost" onClick={() => openDetail(row)}>Review</Button>
    )},
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Complaints</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Review and resolve customer complaints</p>
        </div>

        <Card>
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <Select value={filters.status} onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))} className="sm:max-w-[180px]">
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </Select>
            <Select value={filters.priority} onChange={(e) => setFilters((p) => ({ ...p, priority: e.target.value }))} className="sm:max-w-[180px]">
              <option value="">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </Select>
          </div>
          <Table columns={columns} data={complaints} loading={loading} pagination={pagination} onPageChange={fetchComplaints} />
        </Card>
      </div>

      {/* Complaint detail + action modal */}
      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title="Complaint Review"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setSelected(null)}>Cancel</Button>
            <Button variant="primary" loading={saving} icon={CheckCircle} onClick={handleSave}>Save Changes</Button>
          </>
        }
      >
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <ComplaintBadge status={selected.status} />
              <PriorityBadge priority={selected.priority} />
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-dark-card2 rounded-xl">
              <p className="text-xs font-semibold text-slate-400 mb-1.5">Description</p>
              <p className="text-sm text-slate-700 dark:text-slate-300">{selected.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <DetailRow label="Customer" value={selected.customerName} />
              <DetailRow label="Email" value={selected.customerEmail} />
              <DetailRow label="Company" value={selected.companyId?.companyName} />
              <DetailRow label="Order #" value={selected.orderId?.orderNumber} />
              <DetailRow label="Filed" value={formatDate(selected.createdAt)} />
              {selected.resolvedAt && <DetailRow label="Resolved" value={formatDate(selected.resolvedAt)} />}
            </div>

            <Select
              label="Update Status"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </Select>

            <Textarea
              label="Admin Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter your resolution notes..."
              rows={3}
            />
          </div>
        )}
      </Modal>
    </PageTransition>
  );
};

const DetailRow = ({ label, value }) => (
  <div>
    <p className="text-xs text-slate-400 font-medium">{label}</p>
    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mt-0.5">{value || '—'}</p>
  </div>
);

export default AdminComplaints;
