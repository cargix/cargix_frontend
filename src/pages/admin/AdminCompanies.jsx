import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Building2, Search, Eye, MapPin, Phone, Mail, Clock, Ban, CheckCircle } from 'lucide-react';
import api from '@/api/axios';
import Card from '@/components/common/Card';
import Table from '@/components/common/Table';
import Badge, { CompanyBadge } from '@/components/common/Badge';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Modal from '@/components/common/Modal';
import PageTransition from '@/components/layout/PageTransition';
import { formatDate, timeAgo } from '@/utils/helpers';
import { Select } from '@/components/common/Input';

const AdminCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ approvalStatus: 'all', search: '' });
  const [selected, setSelected] = useState(null);
  const [statusModal, setStatusModal] = useState({ open: false, item: null, status: null });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchCompanies = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ 
        page, 
        limit: 10, 
        ...filters,
        ...(filters.approvalStatus !== 'all' && { approvalStatus: filters.approvalStatus })
      }).toString();
      const { data } = await api.get(`/admin/companies?${params}`);
      setCompanies(data.data);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchCompanies(1); }, [fetchCompanies]);

  const handleStatusChange = async () => {
    if (!statusModal.item) return;
    setActionLoading(true);
    try {
      await api.put(`/admin/companies/${statusModal.item._id}/status`, {
        status: statusModal.status,
      });
      fetchCompanies(pagination.page);
      setStatusModal({ open: false, item: null, status: null });
      if (selected?._id === statusModal.item._id) setSelected(null);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    { key: 'companyName', label: 'Company Name', render: (v) => (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
          <Building2 className="w-4 h-4 text-primary-600" />
        </div>
        <span className="font-medium text-slate-700 dark:text-slate-200">{v}</span>
      </div>
    )},
    { key: 'userId', label: 'Contact', render: (v) => (
      <div>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{v?.name}</p>
        <p className="text-xs text-slate-400">{v?.email}</p>
      </div>
    )},
    { key: 'serviceArea', label: 'Service Areas', render: (v) => (
      <div className="flex flex-wrap gap-1">
        {(v || []).slice(0, 2).map((a) => (
          <span key={a} className="px-2 py-0.5 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-full text-xs">{a}</span>
        ))}
        {(v || []).length > 2 && <span className="text-xs text-slate-400">+{v.length - 2}</span>}
      </div>
    )},
    { key: 'approvalStatus', label: 'Status', render: (v) => <CompanyBadge status={v} /> },
    { key: 'userId', label: 'Account Status', render: (v) => (
      <Badge variant={
        v?.status === 'active' ? 'success' : 
        v?.status === 'suspended' ? 'danger' : 'secondary'
      }>
        {v?.status || 'inactive'}
      </Badge>
    )},
    { key: 'createdAt', label: 'Joined', render: (v) => <span className="text-xs text-slate-400">{timeAgo(v)}</span> },
    { key: '_id', label: 'Actions', render: (_, row) => (
      <div className="flex items-center gap-1.5">
        <Button size="xs" variant="ghost" icon={Eye} onClick={() => setSelected(row)}>View</Button>
        {row.userId?.status === 'active' && (
          <Button size="xs" variant="danger" icon={Ban}
            onClick={() => setStatusModal({ open: true, item: row, status: 'suspended' })}>
            Suspend
          </Button>
        )}
        {row.userId?.status === 'suspended' && (
          <Button size="xs" variant="success" icon={CheckCircle}
            onClick={() => setStatusModal({ open: true, item: row, status: 'active' })}>
            Activate
          </Button>
        )}
      </div>
    )},
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Companies</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage all registered transport companies
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
              value={filters.approvalStatus}
              onChange={(e) => setFilters((p) => ({ ...p, approvalStatus: e.target.value }))}
              className="sm:max-w-[180px]"
            >
              <option value="all">All Approval Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </Select>
          </div>

          <Table
            columns={columns}
            data={companies}
            loading={loading}
            pagination={pagination}
            onPageChange={(p) => fetchCompanies(p)}
            emptyMessage="No companies found"
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
                <div className="flex gap-2 mt-1">
                  <CompanyBadge status={selected.approvalStatus} />
                  <Badge variant={
                    selected.userId?.status === 'active' ? 'success' : 
                    selected.userId?.status === 'suspended' ? 'danger' : 'secondary'
                  }>
                    {selected.userId?.status || 'inactive'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoItem icon={Mail} label="Email" value={selected.userId?.email} />
              <InfoItem icon={Phone} label="Phone" value={selected.contactPhone} />
              <InfoItem icon={MapPin} label="Address" value={selected.address} />
              <InfoItem icon={Clock} label="Joined" value={formatDate(selected.createdAt)} />
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

            <div className="flex gap-3 pt-2">
              {selected.userId?.status === 'active' && (
                <Button variant="danger" icon={Ban} fullWidth
                  onClick={() => { setSelected(null); setStatusModal({ open: true, item: selected, status: 'suspended' }); }}>
                  Suspend Account
                </Button>
              )}
              {selected.userId?.status === 'suspended' && (
                <Button variant="success" icon={CheckCircle} fullWidth
                  onClick={() => { setSelected(null); setStatusModal({ open: true, item: selected, status: 'active' }); }}>
                  Activate Account
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Status change confirmation modal */}
      <Modal
        isOpen={statusModal.open}
        onClose={() => setStatusModal({ open: false, item: null, status: null })}
        title={statusModal.status === 'active' ? 'Activate Company' : 'Suspend Company'}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setStatusModal({ open: false, item: null, status: null })}>Cancel</Button>
            <Button
              variant={statusModal.status === 'active' ? 'success' : 'danger'}
              loading={actionLoading}
              onClick={handleStatusChange}
            >
              Confirm
            </Button>
          </>
        }
      >
        <p className="text-slate-600 dark:text-slate-300">
          Are you sure you want to {statusModal.status === 'active' ? 'activate' : 'suspend'} <strong>{statusModal.item?.companyName}</strong>?
        </p>
      </Modal>
    </PageTransition>
  );
};

const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-2">
    <Icon className="w-4 h-4 text-slate-400 mt-0.5" />
    <div>
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{value || 'N/A'}</p>
    </div>
  </div>
);

export default AdminCompanies;
