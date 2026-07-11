import { useState, useEffect, useCallback } from 'react';
import { Package, Plus, Edit2, Trash2, Tag, DollarSign } from 'lucide-react';
import api from '@/api/axios';
import { useAuth } from '@/hooks/useAuth';
import Card from '@/components/common/Card';
import Table from '@/components/common/Table';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import { Select, Textarea } from '@/components/common/Input';
import { formatCurrency } from '@/utils/helpers';

const CATEGORIES = ['construction', 'hazardous', 'perishable', 'machinery', 'furniture', 'electronics', 'other'];
const PRICE_UNITS = ['per_ton', 'per_kg', 'per_km', 'per_trip', 'per_unit'];

const defaultForm = {
  name: '', category: 'other', price: '', priceUnit: 'per_ton',
  discount: 0, availability: true, description: '', minQuantity: '', maxQuantity: '', unit: '',
};

const Materials = () => {
  const { isAdmin } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, item: null });
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [deleteModal, setDeleteModal] = useState({ open: false, item: null });

  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    try { const { data } = await api.get('/materials'); setMaterials(data.data); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchMaterials(); }, [fetchMaterials]);

  const openAdd  = () => { setForm(defaultForm); setErrors({}); setModal({ open: true, item: null }); };
  const openEdit = (m) => { setForm({ ...m }); setErrors({}); setModal({ open: true, item: m }); };

  const validate = () => {
    const e = {};
    if (!form.name) e.name = 'Required';
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) e.price = 'Enter a valid price';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      if (modal.item) await api.put(`/materials/${modal.item._id}`, form);
      else await api.post('/materials', form);
      fetchMaterials();
      setModal({ open: false, item: null });
    } catch (err) { console.error(err); } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/materials/${deleteModal.item._id}`);
      fetchMaterials();
      setDeleteModal({ open: false, item: null });
    } catch (e) { console.error(e); }
  };

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target ? e.target.value : e }));
  const setCheck = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.checked }));

  const effectivePrice = (m) => m.price - (m.price * (m.discount || 0) / 100);

  const columns = [
    { key: 'name', label: 'Material', render: (v, r) => (
      <div>
        <p className="font-medium text-slate-700 dark:text-slate-200">{v}</p>
        <p className="text-xs text-slate-400 capitalize">{r.category}</p>
      </div>
    )},
    { key: 'price', label: 'Price', render: (v, r) => (
      <div>
        <p className="font-semibold text-slate-700 dark:text-slate-200">{formatCurrency(effectivePrice(r))}</p>
        <p className="text-xs text-slate-400">{r.priceUnit?.replace('_', ' ')}{r.discount > 0 && <span className="ml-1 text-success-600">-{r.discount}%</span>}</p>
      </div>
    )},
    { key: 'unit', label: 'Unit', render: (v) => v || '—' },
    { key: 'availability', label: 'Available', render: (v) => (
      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${v ? 'bg-success-100 text-success-700' : 'bg-slate-100 text-slate-500'}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${v ? 'bg-success-500' : 'bg-slate-400'}`} />
        {v ? 'Yes' : 'No'}
      </span>
    )},
    { key: '_id', label: 'Actions', render: (_, row) => (
      <div className="flex gap-1.5">
        <Button size="xs" variant="ghost" icon={Edit2} onClick={() => openEdit(row)} disabled={isAdmin}>Edit</Button>
        <Button size="xs" variant="danger" icon={Trash2} onClick={() => setDeleteModal({ open: true, item: row })} disabled={isAdmin}>Delete</Button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Materials</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isAdmin ? 'View all transport materials across companies' : 'Manage your transport materials & pricing'}
          </p>
        </div>
        {!isAdmin && <Button icon={Plus} onClick={openAdd}>Add Material</Button>}
      </div>

      {isAdmin && (
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Admin View:</strong> You can view all materials but cannot add new ones. Materials are managed by individual companies.
          </p>
        </Card>
      )}

      <Card>
        <Table columns={columns} data={materials} loading={loading} emptyMessage="No materials listed yet" emptyIcon={Package} />
      </Card>

      {/* Add / Edit Modal */}
      <Modal isOpen={modal.open} onClose={() => setModal({ open: false, item: null })}
        title={modal.item ? 'Edit Material' : 'Add Material'}
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModal({ open: false, item: null })}>Cancel</Button>
            <Button loading={saving} onClick={handleSave}>{modal.item ? 'Save Changes' : 'Add Material'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Material Name" value={form.name} onChange={set('name')} error={errors.name} required />
            <Select label="Category" value={form.category} onChange={set('category')}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </Select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input label="Base Price" type="number" min="0" icon={DollarSign} value={form.price} onChange={set('price')} error={errors.price} required />
            <Select label="Price Unit" value={form.priceUnit} onChange={set('priceUnit')}>
              {PRICE_UNITS.map((u) => <option key={u} value={u}>{u.replace('_', ' ')}</option>)}
            </Select>
            <Input label="Discount %" type="number" min="0" max="100" icon={Tag} value={form.discount} onChange={set('discount')} />
          </div>
          {Number(form.price) > 0 && Number(form.discount) > 0 && (
            <p className="text-xs text-success-600">Effective price: <strong>{formatCurrency(form.price - (form.price * form.discount / 100))}</strong></p>
          )}
          <div className="grid grid-cols-3 gap-3">
            <Input label="Unit Label" placeholder="e.g. kg, m³" value={form.unit} onChange={set('unit')} />
            <Input label="Min Qty" type="number" min="0" value={form.minQuantity} onChange={set('minQuantity')} />
            <Input label="Max Qty" type="number" min="0" value={form.maxQuantity} onChange={set('maxQuantity')} />
          </div>
          <Textarea label="Description" rows={2} value={form.description} onChange={set('description')} />
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer select-none">
            <input type="checkbox" className="w-4 h-4 accent-primary-600" checked={form.availability} onChange={setCheck('availability')} />
            Available for orders
          </label>
        </div>
      </Modal>

      <Modal isOpen={deleteModal.open} onClose={() => setDeleteModal({ open: false, item: null })}
        title="Delete Material" size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteModal({ open: false, item: null })}>Cancel</Button>
            <Button variant="danger" icon={Trash2} onClick={handleDelete}>Delete</Button>
          </>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Remove <strong>{deleteModal.item?.name}</strong> from your catalog?
        </p>
      </Modal>
    </div>
  );
};

export default Materials;
