import { useState, useEffect, useCallback } from 'react';
import { Truck, Plus, Edit2, Trash2 } from 'lucide-react';
import api from '@/api/axios';
import Card, { CardHeader } from '@/components/common/Card';
import Table from '@/components/common/Table';
import { VehicleBadge } from '@/components/common/Badge';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import { Select } from '@/components/common/Input';
import { capitalize } from '@/utils/helpers';

const TYPES = ['truck', 'van', 'flatbed', 'refrigerated', 'tanker', 'container', 'pickup', 'other'];
const STATUSES = ['available', 'in_use', 'maintenance', 'inactive'];

const defaultForm = { type: 'truck', registrationNumber: '', make: '', model: '', year: '', color: '', capacity: { value: '', unit: 'ton' }, status: 'available' };

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, item: null });
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [deleteModal, setDeleteModal] = useState({ open: false, item: null });

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try { const { data } = await api.get('/vehicles'); setVehicles(data.data); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchVehicles(); }, [fetchVehicles]);

  const openAdd  = () => { setForm(defaultForm); setErrors({}); setModal({ open: true, item: null }); };
  const openEdit = (v) => {
    setForm({ ...v, capacity: v.capacity || { value: '', unit: 'ton' } });
    setErrors({});
    setModal({ open: true, item: v });
  };

  const validate = () => {
    const e = {};
    if (!form.type) e.type = 'Required';
    if (!form.registrationNumber) e.registrationNumber = 'Required';
    if (!form.capacity?.value) e.capacity = 'Required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      if (modal.item) await api.put(`/vehicles/${modal.item._id}`, form);
      else await api.post('/vehicles', form);
      fetchVehicles();
      setModal({ open: false, item: null });
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/vehicles/${deleteModal.item._id}`);
      fetchVehicles();
      setDeleteModal({ open: false, item: null });
    } catch (e) { console.error(e); }
  };

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));
  const setCapacity = (field) => (e) =>
    setForm((p) => ({ ...p, capacity: { ...p.capacity, [field]: e.target.value } }));

  const columns = [
    { key: 'type', label: 'Type', render: (v) => capitalize(v) },
    { key: 'registrationNumber', label: 'Reg. Number', render: (v) => (
      <span className="font-mono text-xs font-semibold text-primary-700 dark:text-primary-300">{v}</span>
    )},
    { key: 'make', label: 'Make/Model', render: (_, r) => `${r.make || '—'} ${r.model || ''}`.trim() },
    { key: 'capacity', label: 'Capacity', render: (v) => v?.value ? `${v.value} ${v.unit}` : '—' },
    { key: 'status', label: 'Status', render: (v) => <VehicleBadge status={v} /> },
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
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Vehicles</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your fleet</p>
        </div>
        <Button icon={Plus} onClick={openAdd}>Add Vehicle</Button>
      </div>

      <Card>
        <Table columns={columns} data={vehicles} loading={loading} emptyMessage="No vehicles added yet" />
      </Card>

      {/* Add / Edit Modal */}
      <Modal isOpen={modal.open} onClose={() => setModal({ open: false, item: null })}
        title={modal.item ? 'Edit Vehicle' : 'Add Vehicle'}
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModal({ open: false, item: null })}>Cancel</Button>
            <Button loading={saving} onClick={handleSave}>{modal.item ? 'Save Changes' : 'Add Vehicle'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select label="Vehicle Type" value={form.type} onChange={set('type')} error={errors.type} required>
            {TYPES.map((t) => <option key={t} value={t}>{capitalize(t)}</option>)}
          </Select>
          <Input label="Registration Number" value={form.registrationNumber} onChange={set('registrationNumber')} error={errors.registrationNumber} placeholder="ABC-1234" required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Make" value={form.make} onChange={set('make')} placeholder="Toyota" />
            <Input label="Model" value={form.model} onChange={set('model')} placeholder="Hilux" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Year" type="number" value={form.year} onChange={set('year')} placeholder="2022" />
            <Input label="Color" value={form.color} onChange={set('color')} placeholder="White" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Capacity" type="number" value={form.capacity?.value} onChange={setCapacity('value')} error={errors.capacity} placeholder="10" required />
            <Select label="Unit" value={form.capacity?.unit} onChange={setCapacity('unit')}>
              <option value="ton">Ton</option>
              <option value="kg">Kg</option>
              <option value="liter">Liter</option>
            </Select>
          </div>
          {modal.item && (
            <Select label="Status" value={form.status} onChange={set('status')}>
              {STATUSES.map((s) => <option key={s} value={s}>{capitalize(s.replace('_', ' '))}</option>)}
            </Select>
          )}
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal isOpen={deleteModal.open} onClose={() => setDeleteModal({ open: false, item: null })}
        title="Delete Vehicle" size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteModal({ open: false, item: null })}>Cancel</Button>
            <Button variant="danger" icon={Trash2} onClick={handleDelete}>Delete</Button>
          </>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Are you sure you want to remove <strong>{deleteModal.item?.registrationNumber}</strong>? This cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default Vehicles;
