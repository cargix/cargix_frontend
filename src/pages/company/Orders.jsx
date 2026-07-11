import { useState, useEffect, useCallback } from 'react';
import { Eye, CheckCircle, XCircle, Truck, ChevronDown, Search, MapPin } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '@/api/axios';
import Card from '@/components/common/Card';
import Table from '@/components/common/Table';
import { OrderBadge } from '@/components/common/Badge';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import { Select, Textarea } from '@/components/common/Input';
import { formatDate, formatCurrency } from '@/utils/helpers';

// Fix Leaflet default icon URLs broken by Vite bundling
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const STATUSES = ['', 'pending', 'accepted', 'in_transit', 'delivered', 'cancelled', 'rejected'];
const PAGE_SIZE = 10;

const NEXT_STATUS = { pending: ['accepted', 'rejected'], accepted: ['in_transit', 'cancelled'], in_transit: ['delivered', 'cancelled'] };
const STATUS_LABEL = { accepted: 'Accept', rejected: 'Reject', in_transit: 'Mark In Transit', delivered: 'Mark Delivered', cancelled: 'Cancel' };

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [viewModal, setViewModal] = useState({ open: false, order: null });
  const [actionModal, setActionModal] = useState({ open: false, order: null, status: null });
  const [actionForm, setActionForm] = useState({ assignedDriver: '', assignedVehicle: '', rejectionReason: '' });
  const [saving, setSaving] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: PAGE_SIZE });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      const { data } = await api.get(`/orders?${params}`);
      setOrders(data.data);
      setTotal(data.total);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [page, search, statusFilter]);

  const fetchResources = useCallback(async () => {
    try {
      const [{ data: d }, { data: v }] = await Promise.all([
        api.get('/drivers'),
        api.get('/vehicles'),
      ]);
      setDrivers(d.data.filter((dr) => dr.status === 'available' || dr.status === 'on_duty'));
      setVehicles(v.data.filter((vh) => vh.status === 'available' || vh.status === 'in_use'));
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);
  useEffect(() => { fetchResources(); }, [fetchResources]);

  const openAction = (order, status) => {
    setActionForm({ assignedDriver: order.assignedDriver?._id || '', assignedVehicle: order.assignedVehicle?._id || '', rejectionReason: '' });
    setActionModal({ open: true, order, status });
  };

  const handleAction = async () => {
    setSaving(true);
    try {
      const payload = { status: actionModal.status };
      if (['accepted', 'in_transit'].includes(actionModal.status)) {
        payload.assignedDriver = actionForm.assignedDriver || null;
        payload.assignedVehicle = actionForm.assignedVehicle || null;
      }
      if (['rejected', 'cancelled'].includes(actionModal.status)) {
        payload.rejectionReason = actionForm.rejectionReason;
      }
      await api.put(`/orders/${actionModal.order._id}/status`, payload);
      setActionModal({ open: false, order: null, status: null });
      fetchOrders();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  const setAF = (f) => (e) => setActionForm((p) => ({ ...p, [f]: e.target.value }));

  const needsAssignment = ['accepted', 'in_transit'].includes(actionModal.status);
  const needsReason = ['rejected', 'cancelled'].includes(actionModal.status);

  const columns = [
    { key: 'orderNumber', label: 'Order', render: (v) => <span className="font-mono text-xs font-semibold text-primary-700 dark:text-primary-300">{v}</span> },
    { key: 'customerName', label: 'Customer', render: (v, r) => (
      <div>
        <p className="font-medium text-slate-700 dark:text-slate-200 text-sm">{v}</p>
        <p className="text-xs text-slate-400">{r.customerPhone}</p>
      </div>
    )},
    { key: 'materialId', label: 'Material', render: (v) => v?.name || '—' },
    { key: 'quantity', label: 'Qty', render: (v, r) => `${v} ${r.materialId?.unit || ''}` },
    { key: 'totalAmount', label: 'Amount', render: (v) => formatCurrency(v || 0) },
    { key: 'status', label: 'Status', render: (v) => <OrderBadge status={v} /> },
    { key: 'createdAt', label: 'Date', render: (v) => formatDate(v) },
    { key: '_id', label: 'Actions', render: (_, row) => (
      <div className="flex gap-1">
        <Button size="xs" variant="ghost" icon={Eye} onClick={() => setViewModal({ open: true, order: row })}>View</Button>
        {NEXT_STATUS[row.status]?.map((s) => (
          <Button key={s} size="xs"
            variant={s === 'rejected' || s === 'cancelled' ? 'danger' : s === 'accepted' ? 'success' : 'outline'}
            onClick={() => openAction(row, s)}
          >
            {STATUS_LABEL[s]}
          </Button>
        ))}
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Orders</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage incoming &amp; active orders</p>
        </div>
      </div>

      <Card>
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex-1 min-w-48">
            <Input placeholder="Search orders…" icon={Search} value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">All Statuses</option>
            {STATUSES.filter(Boolean).map((s) => <option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>)}
          </Select>
        </div>
        <Table
          columns={columns} data={orders} loading={loading}
          emptyMessage="No orders found"
          pagination={{ page, totalPages: Math.ceil(total / PAGE_SIZE) || 1 }}
          onPageChange={setPage}
        />
      </Card>

      {/* View Modal */}
      <Modal isOpen={viewModal.open} onClose={() => setViewModal({ open: false, order: null })}
        title={`Order ${viewModal.order?.orderNumber}`} size="lg"
        footer={<Button onClick={() => setViewModal({ open: false, order: null })}>Close</Button>}
      >
        {viewModal.order && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              {[
                ['Customer', viewModal.order.customerName],
                ['Phone', viewModal.order.customerPhone],
                ['Email', viewModal.order.customerEmail],
                ['Material', viewModal.order.materialId?.name],
                ['Quantity', `${viewModal.order.quantity} ${viewModal.order.materialId?.unit || ''}`],
                ['Amount', formatCurrency(viewModal.order.totalAmount || 0)],
                ['Status', <OrderBadge key="s" status={viewModal.order.status} />],
                ['Date', formatDate(viewModal.order.createdAt)],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">{label}</p>
                  <p className="font-medium text-slate-700 dark:text-slate-200">{value}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide">Pickup</p>
              <p className="text-slate-600 dark:text-slate-300">{viewModal.order.pickupAddress}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide">Delivery</p>
              <p className="text-slate-600 dark:text-slate-300">{viewModal.order.deliveryAddress}</p>
            </div>
            {viewModal.order.notes && (
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide">Notes</p>
                <p className="text-slate-600 dark:text-slate-300">{viewModal.order.notes}</p>
              </div>
            )}
            {viewModal.order.assignedDriver && (
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide">Driver</p>
                <p className="text-slate-600 dark:text-slate-300">{viewModal.order.assignedDriver.name}</p>
              </div>
            )}

            {/* Delivery location map */}
            {viewModal.order.deliveryCoordinates?.lat && viewModal.order.deliveryCoordinates?.lng ? (
              <div className="rounded-xl overflow-hidden border border-light-border dark:border-dark-border">
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-dark-card2 border-b border-light-border dark:border-dark-border">
                  <MapPin className="w-3.5 h-3.5 text-primary-500" />
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Delivery Location</span>
                  <span className="ml-auto text-xs text-slate-400 font-mono">
                    {viewModal.order.deliveryCoordinates.lat.toFixed(5)},&nbsp;
                    {viewModal.order.deliveryCoordinates.lng.toFixed(5)}
                  </span>
                </div>
                <MapContainer
                  key={`${viewModal.order._id}-map`}
                  center={[viewModal.order.deliveryCoordinates.lat, viewModal.order.deliveryCoordinates.lng]}
                  zoom={15}
                  style={{ height: '220px', width: '100%' }}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[viewModal.order.deliveryCoordinates.lat, viewModal.order.deliveryCoordinates.lng]}>
                    <Popup>
                      <p className="text-xs font-semibold">{viewModal.order.deliveryAddress}</p>
                    </Popup>
                  </Marker>
                </MapContainer>
                <div className="px-3 py-2 bg-slate-50 dark:bg-dark-card2 text-xs text-slate-500 truncate">
                  📍 {viewModal.order.deliveryAddress}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-dark-card2 text-xs text-slate-400">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                No GPS coordinates — address only order
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Action Modal */}
      <Modal isOpen={actionModal.open} onClose={() => setActionModal({ open: false, order: null, status: null })}
        title={STATUS_LABEL[actionModal.status]}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setActionModal({ open: false, order: null, status: null })}>Cancel</Button>
            <Button
              loading={saving}
              variant={needsReason ? 'danger' : 'primary'}
              onClick={handleAction}
            >
              Confirm
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Order <strong className="text-slate-700 dark:text-slate-200">{actionModal.order?.orderNumber}</strong> → <OrderBadge status={actionModal.status} />
          </p>
          {needsAssignment && (
            <>
              <Select label="Assign Driver" value={actionForm.assignedDriver} onChange={setAF('assignedDriver')}>
                <option value="">— Select Driver —</option>
                {drivers.map((d) => <option key={d._id} value={d._id}>{d.name} ({d.phone})</option>)}
              </Select>
              <Select label="Assign Vehicle" value={actionForm.assignedVehicle} onChange={setAF('assignedVehicle')}>
                <option value="">— Select Vehicle —</option>
                {vehicles.map((v) => <option key={v._id} value={v._id}>{v.registrationNumber} — {v.make} {v.model}</option>)}
              </Select>
            </>
          )}
          {needsReason && (
            <Textarea label="Reason (optional)" rows={2} value={actionForm.rejectionReason} onChange={setAF('rejectionReason')} placeholder="Briefly explain why…" />
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Orders;
