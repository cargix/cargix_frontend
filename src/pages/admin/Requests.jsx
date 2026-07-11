import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FileText, Search, CheckCircle, XCircle, Eye, MapPin, Phone, Mail, Clock } from 'lucide-react';
import api from '@/api/axios';
import Card, { CardHeader } from '@/components/common/Card';
import Table from '@/components/common/Table';
import Badge, { CompanyBadge } from '@/components/common/Badge';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Modal from '@/components/common/Modal';
import PageTransition from '@/components/layout/PageTransition';
import { formatDate, timeAgo } from '@/utils/helpers';
import { Select, Textarea } from '@/components/common/Input';

const RequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: 'pending', search: '' });
  const [selected, setSelected] = useState(null);
  const [actionModal, setActionModal] = useState({ open: false, type: null, item: null });
  const [reason, setReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRequests = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10, ...filters }).toString();
      const { data } = await api.get(`/admin/requests?${params}`);
      setRequests(data.data);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchRequests(1); }, [fetchRequests]);

  const handleAction = async () => {
    if (!actionModal.item) return;
    setActionLoading(true);
    try {
      await api.put(`/admin/requests/${actionModal.item._id}`, {
        status: actionModal.type,
        reason: actionModal.type === 'rejected' ? reason : undefined,
      });
      fetchRequests(1);
      setActionModal({ open: false, type: null, item: null });
      setReason('');
      if (selected?._id === actionModal.item._id) setSelected(null);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    { key: 'companyName', label: 'Company Name' },
    { key: 'userId', label: 'Contact', render: (v) => (
      <div>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{v?.name}</p>
        <p className="text-xs text-slate-400">{v?.email}</p>
      </div>
    )},
    { key: 'serviceArea', label: 'Service Areas', render: (v) => (
      <div className="flex flex-wrap gap-1">
        {(v || []).slice(0, 3).map((a) => (
          <span key={a} className="px-2 py-0.5 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-full text-xs">{a}</span>
        ))}
        {(v || []).length > 3 && <span className="text-xs text-slate-400">+{v.length - 3}</span>}
      </div>
    )},
    { key: 'approvalStatus', label: 'Status', render: (v) => <CompanyBadge status={v} /> },
    { key: 'createdAt', label: 'Submitted', render: (v) => <span className="text-xs text-slate-400">{timeAgo(v)}</span> },
    { key: '_id', label: 'Actions', render: (_, row) => (
      <div className="flex items-center gap-1.5">
        <Button size="xs" variant="ghost" icon={Eye} onClick={() => setSelected(row)}>View</Button>
        {row.approvalStatus === 'pending' && (
          <>
            <Button size="xs" variant="success" icon={CheckCircle}
              onClick={() => setActionModal({ open: true, type: 'approved', item: row })}>
              Approve
            </Button>
            <Button size="xs" variant="danger" icon={XCircle}
              onClick={() => setActionModal({ open: true, type: 'rejected', item: row })}>
              Reject
            </Button>
          </>
        )}
      </div>
    )},
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Registration Requests</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review and approve transport company registrations
          </p>
        </div>

        <Card>
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <Input
              placeholder="Search by company name..."
              icon={Search}
              value={filters.search}
              onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
              className="sm:max-w-xs"
            />
            <Select
              value={filters.status}
              onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
              className="sm:max-w-[180px]"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </Select>
          </div>

          <Table
            columns={columns}
            data={requests}
            loading={loading}
            pagination={pagination}
            onPageChange={(p) => fetchRequests(p)}
            emptyMessage="No registration requests found"
          />
        </Card>
      </div>

      {/* Detail Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Company Details" size="lg">
        {selected && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <Building2 className="w-7 h-7 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">{selected.companyName}</h3>
                <CompanyBadge status={selected.approvalStatus} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoItem icon={Mail} label="Email" value={selected.userId?.email} />
              <InfoItem icon={Phone} label="Phone" value={selected.contactPhone} />
              <InfoItem icon={MapPin} label="Address" value={selected.address} />
              <InfoItem icon={Clock} label="Submitted" value={formatDate(selected.createdAt)} />
            </div>

            {selected.serviceArea?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Service Areas</p>
                <div className="flex flex-wrap gap-2">
                  {selected.serviceArea.map((a) => (
                    <span key={a} className="px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-full text-xs font-medium">{a}</span>
                  ))}
                </div>
              </div>
            )}

            {selected.approvalStatus === 'pending' && (
              <div className="flex gap-3 pt-2">
                <Button variant="success" icon={CheckCircle} fullWidth
                  onClick={() => { setSelected(null); setActionModal({ open: true, type: 'approved', item: selected }); }}>
                  Approve
                </Button>
                <Button variant="danger" icon={XCircle} fullWidth
                  onClick={() => { setSelected(null); setActionModal({ open: true, type: 'rejected', item: selected }); }}>
                  Reject
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Action confirmation modal */}
      <Modal
        isOpen={actionModal.open}
        onClose={() => { setActionModal({ open: false, type: null, item: null }); setReason(''); }}
        title={actionModal.type === 'approved' ? 'Approve Company' : 'Reject Company'}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setActionModal({ open: false, type: null, item: null })}>Cancel</Button>
            <Button
              variant={actionModal.type === 'approved' ? 'success' : 'danger'}
              loading={actionLoading}
              onClick={handleAction}
            >
              {actionModal.type === 'approved' ? 'Confirm Approval' : 'Confirm Rejection'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
          {actionModal.type === 'approved'
            ? `Are you sure you want to approve "${actionModal.item?.companyName}"? They will be able to log in immediately.`
            : `Are you sure you want to reject "${actionModal.item?.companyName}"?`}
        </p>
        {actionModal.type === 'rejected' && (
          <Textarea
            label="Rejection reason"
            placeholder="Please provide a reason..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
          />
        )}
      </Modal>
    </PageTransition>
  );
};

const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="p-2 rounded-lg bg-slate-50 dark:bg-dark-card2 mt-0.5">
      <Icon className="w-4 h-4 text-slate-500" />
    </div>
    <div>
      <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{label}</p>
      <p className="text-sm text-slate-700 dark:text-slate-200 mt-0.5">{value || '—'}</p>
    </div>
  </div>
);

export default RequestsPage;
