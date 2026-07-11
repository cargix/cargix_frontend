import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { User, Search, Eye, Phone, Mail, Clock, Car } from 'lucide-react';
import api from '@/api/axios';
import Card from '@/components/common/Card';
import Table from '@/components/common/Table';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Modal from '@/components/common/Modal';
import PageTransition from '@/components/layout/PageTransition';
import { formatDate, timeAgo } from '@/utils/helpers';

const AdminDrivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState(null);

  const fetchDrivers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/drivers');
      setDrivers(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDrivers(); }, [fetchDrivers]);

  const filteredDrivers = drivers.filter(d => 
    !searchQuery || 
    d.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.licenseNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.phone?.includes(searchQuery)
  );

  const columns = [
    { key: 'name', label: 'Driver Name', render: (v) => (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
          <User className="w-4 h-4 text-primary-600" />
        </div>
        <span className="font-medium text-slate-700 dark:text-slate-200">{v}</span>
      </div>
    )},
    { key: 'phone', label: 'Phone', render: (v) => (
      <span className="text-sm text-slate-600 dark:text-slate-300">{v || 'N/A'}</span>
    )},
    { key: 'licenseNumber', label: 'License Number', render: (v) => (
      <span className="text-sm font-mono text-slate-600 dark:text-slate-300">{v || 'N/A'}</span>
    )},
    { key: 'companyId', label: 'Company', render: (v) => (
      <span className="text-sm text-slate-600 dark:text-slate-300">{v?.companyName || 'N/A'}</span>
    )},
    { key: 'assignedVehicle', label: 'Assigned Vehicle', render: (v) => (
      v ? (
        <div className="flex items-center gap-1.5">
          <Car className="w-3.5 h-3.5 text-primary-500" />
          <span className="text-sm text-slate-600 dark:text-slate-300">{v.registrationNumber}</span>
        </div>
      ) : (
        <Badge variant="secondary">Unassigned</Badge>
      )
    )},
    { key: 'createdAt', label: 'Added', render: (v) => <span className="text-xs text-slate-400">{timeAgo(v)}</span> },
    { key: '_id', label: 'Actions', render: (_, row) => (
      <Button size="xs" variant="ghost" icon={Eye} onClick={() => setSelected(row)}>View</Button>
    )},
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Drivers</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            View all drivers across all companies
          </p>
        </div>

        <Card>
          <div className="mb-5">
            <Input
              placeholder="Search by name, license, or phone..."
              icon={Search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="sm:max-w-md"
            />
          </div>

          <Table
            columns={columns}
            data={filteredDrivers}
            loading={loading}
            emptyMessage="No drivers found"
          />
        </Card>
      </div>

      {/* Detail Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Driver Details" size="lg">
        {selected && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <User className="w-7 h-7 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">{selected.name}</h3>
                <p className="text-sm text-slate-500">{selected.companyId?.companyName || 'No company'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoItem icon={Phone} label="Phone" value={selected.phone} />
              <InfoItem icon={Mail} label="License Number" value={selected.licenseNumber} />
              <InfoItem icon={Car} label="Vehicle" value={
                selected.assignedVehicle 
                  ? `${selected.assignedVehicle.registrationNumber} (${selected.assignedVehicle.type})`
                  : 'No vehicle assigned'
              } />
              <InfoItem icon={Clock} label="Added" value={formatDate(selected.createdAt)} />
            </div>

            {selected.address && (
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Address</p>
                <p className="text-sm text-slate-700 dark:text-slate-300">{selected.address}</p>
              </div>
            )}
          </div>
        )}
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

export default AdminDrivers;
