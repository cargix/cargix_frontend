import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Eye, Search } from 'lucide-react';
import api from '@/api/axios';
import Card from '@/components/common/Card';
import Table from '@/components/common/Table';
import { ComplaintBadge, PriorityBadge } from '@/components/common/Badge';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import { Select } from '@/components/common/Input';
import { formatDate } from '@/utils/helpers';

const STATUSES = ['', 'open', 'in_progress', 'resolved', 'closed'];

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [viewModal, setViewModal] = useState({ open: false, item: null });

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/complaints/company');
      setComplaints(data.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchComplaints(); }, [fetchComplaints]);

  const filtered = complaints.filter((c) => {
    const matchStatus = !statusFilter || c.status === statusFilter;
    const matchSearch = !search || c.customerName?.toLowerCase().includes(search.toLowerCase()) || c.orderId?.orderNumber?.includes(search);
    return matchStatus && matchSearch;
  });

  const columns = [
    { key: 'orderId', label: 'Order', render: (v) => <span className="font-mono text-xs font-semibold text-primary-700 dark:text-primary-300">{v?.orderNumber || '—'}</span> },
    { key: 'customerName', label: 'Customer', render: (v, r) => (
      <div>
        <p className="font-medium text-slate-700 dark:text-slate-200 text-sm">{v}</p>
        <p className="text-xs text-slate-400">{r.customerEmail}</p>
      </div>
    )},
    { key: 'category', label: 'Category', render: (v) => <span className="text-xs capitalize text-slate-500 dark:text-slate-400">{v?.replace('_', ' ')}</span> },
    { key: 'priority', label: 'Priority', render: (v) => <PriorityBadge priority={v} /> },
    { key: 'status', label: 'Status', render: (v) => <ComplaintBadge status={v} /> },
    { key: 'createdAt', label: 'Date', render: (v) => formatDate(v) },
    { key: '_id', label: '', render: (_, row) => (
      <Button size="xs" variant="ghost" icon={Eye} onClick={() => setViewModal({ open: true, item: row })}>View</Button>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Complaints</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Customer complaints related to your orders</p>
        </div>
      </div>

      <Card>
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex-1 min-w-48">
            <Input placeholder="Search by customer or order…" icon={Search} value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            {STATUSES.filter(Boolean).map((s) => <option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>)}
          </Select>
        </div>
        <Table columns={columns} data={filtered} loading={loading} emptyMessage="No complaints filed" emptyIcon={MessageSquare} />
      </Card>

      {/* View Modal */}
      <Modal isOpen={viewModal.open} onClose={() => setViewModal({ open: false, item: null })}
        title="Complaint Details" size="md"
        footer={<Button onClick={() => setViewModal({ open: false, item: null })}>Close</Button>}
      >
        {viewModal.item && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              {[
                ['Order', viewModal.item.orderId?.orderNumber],
                ['Filed', formatDate(viewModal.item.createdAt)],
                ['Customer', viewModal.item.customerName],
                ['Email', viewModal.item.customerEmail],
                ['Phone', viewModal.item.customerPhone],
                ['Category', viewModal.item.category?.replace('_', ' ')],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">{label}</p>
                  <p className="font-medium text-slate-700 dark:text-slate-200 capitalize">{value || '—'}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <div><p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Priority</p><PriorityBadge priority={viewModal.item.priority} /></div>
              <div><p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Status</p><ComplaintBadge status={viewModal.item.status} /></div>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide">Description</p>
              <p className="mt-1 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 rounded-lg p-3">{viewModal.item.description}</p>
            </div>
            {viewModal.item.adminNotes && (
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide">Admin Notes</p>
                <p className="mt-1 text-slate-600 dark:text-slate-300 bg-primary-50 dark:bg-primary-900/20 rounded-lg p-3">{viewModal.item.adminNotes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Complaints;
