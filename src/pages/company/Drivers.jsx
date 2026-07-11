import { useState, useEffect, useCallback } from 'react';
import { Users, Plus, Edit2, Trash2, Phone, Mail } from 'lucide-react';
import api from '@/api/axios';
import Card from '@/components/common/Card';
import Table from '@/components/common/Table';
import { DriverBadge } from '@/components/common/Badge';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import { Select } from '@/components/common/Input';
import { capitalize } from '@/utils/helpers';

const STATUSES = ['available', 'on_duty', 'off_duty', 'inactive'];
const defaultForm = { name: '', phone: '', email: '', licenseNumber: '', licenseExpiry: '', address: '', emergencyContact: '', assignedVehicle: '', status: 'available' };

const Drivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, item: null });
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [deleteModal, setDeleteModal] = useState({ open: false, item: null });

  const fetchDrivers = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: d }, { data: v }] = await Promise.all([
        api.get('/drivers'),
        api.get('/vehicles'),
      ]);
      setDrivers(d.data);
      setVehicles(v.data.filter((v) => v.status === 'available' || v.status === 'in_use'));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchDrivers(); }, [fetchDrivers]);

  const openAdd  = () => { setForm(defaultForm); setErrors({}); setModal({ open: true, item: null }); };
  const openEdit = (d) => {
    setForm({ ...d, assignedVehicle: d.assignedVehicle?._id || '' });
    setErrors({});
    setModal({ open: true, item: d });
  };

  const validate = () => {
    const e = {};
    if (!form.name) e.name = 'Required';
    if (!form.phone) e.phone = 'Required';
    if (!form.licenseNumber) e.licenseNumber = 'Required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = { ...form, assignedVehicle: form.assignedVehicle || null };
      if (modal.item) await api.put(`/drivers/${modal.item._id}`, payload);
      else await api.post('/drivers', payload);
      fetchDrivers();
      setModal({ open: false, item: null });
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/drivers/${deleteModal.item._id}`);
      fetchDrivers();
      setDeleteModal({ open: false, item: null });
    } catch (e) { console.error(e); }
  };

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const columns = [
    { key: 'name', label: 'Name', render: (v, r) => (
      <div>
        <p className="font-medium text-slate-700 dark:text-slate-200">{v}</p>
        <p className="text-xs text-slate-400 flex items-center gap-1"><Phone className="w-3 h-3" />{r.phone}</p>
      </div>
    )},
    { key: 'licenseNumber', label: 'License', render: (v) => <span className="font-mono text-xs text-primary-700 dark:text-primary-300">{v}</span> },
    { key: 'assignedVehicle', label: 'Vehicle', render: (v) => v?.registrationNumber ? (
      <span className="font-mono text-xs">{v.registrationNumber}</span>
    ) : <span className="text-slate-400 text-xs">Unassigned</span> },
    { key: 'status', label: 'Status', render: (v) => <DriverBadge status={v} /> },
    { key: '_id', label: 'Actions', render: (_, row) => (
      <div className="flex gap-1.5">
        <Button size="xs" variant="ghost" icon={Edit2} onClick={() => openEdit(row)}>Edit</Button>
        <Button size="xs" variant="danger" icon={Trash2} onClick={() => setDeleteModal({ open: true, item: row })}>Delete</Button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Drivers</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your driver pool</p>
        </div>
        <Button icon={Plus} onClick={openAdd}>Add Driver</Button>
      </div>

      <Card>
        <Table columns={columns} data={drivers} loading={loading} emptyMessage="No drivers added yet" />
      </Card>

      {/* Add / Edit Modal */}
      <Modal isOpen={modal.open} onClose={() => setModal({ open: false, item: null })}
        title={modal.item ? 'Edit Driver' : 'Add Driver'}
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModal({ open: false, item: null })}>Cancel</Button>
            <Button loading={saving} onClick={handleSave}>{modal.item ? 'Save Changes' : 'Add Driver'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Full Name" value={form.name} onChange={set('name')} error={errors.name} required />
            <Input label="Phone" icon={Phone} value={form.phone} onChange={set('phone')} error={errors.phone} required />
          </div>
          <Input label="Email" type="email" icon={Mail} value={form.email} onChange={set('email')} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="License Number" value={form.licenseNumber} onChange={set('licenseNumber')} error={errors.licenseNumber} required />
            <Input label="License Expiry" type="date" value={form.licenseExpiry ? form.licenseExpiry.split('T')[0] : ''} onChange={set('licenseExpiry')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Address" value={form.address} onChange={set('address')} />
            <Input label="Emergency Contact" value={form.emergencyContact} onChange={set('emergencyContact')} />
          </div>
          <Select label="Assign Vehicle" value={form.assignedVehicle} onChange={set('assignedVehicle')}>
            <option value="">— No Vehicle —</option>
            {vehicles.map((v) => (
              <option key={v._id} value={v._id}>{v.registrationNumber} ({capitalize(v.type)})</option>
            ))}
          </Select>
          {modal.item && (
            <Select label="Status" value={form.status} onChange={set('status')}>
              {STATUSES.map((s) => <option key={s} value={s}>{capitalize(s.replace('_', ' '))}</option>)}
            </Select>
          )}
        </div>
      </Modal>

      <Modal isOpen={deleteModal.open} onClose={() => setDeleteModal({ open: false, item: null })}
        title="Delete Driver" size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteModal({ open: false, item: null })}>Cancel</Button>
            <Button variant="danger" icon={Trash2} onClick={handleDelete}>Delete</Button>
          </>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Are you sure you want to remove <strong>{deleteModal.item?.name}</strong>?
        </p>
      </Modal>
    </div>
  );
};

export default Drivers;
