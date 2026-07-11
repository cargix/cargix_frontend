import { useState, useEffect, useCallback } from 'react';
import { Package, Search, Eye, MapPin } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '@/api/axios';
import Card from '@/components/common/Card';
import Table from '@/components/common/Table';
import { OrderBadge } from '@/components/common/Badge';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Modal from '@/components/common/Modal';
import PageTransition from '@/components/layout/PageTransition';
import { Select } from '@/components/common/Input';
import { timeAgo, formatDate, formatCurrency } from '@/utils/helpers';

// Fix Leaflet default icon URLs broken by Vite bundling
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', search: '' });
  const [selected, setSelected] = useState(null);

  const fetchOrders = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10, ...filters }).toString();
      const { data } = await api.get(`/admin/orders?${params}`);
      setOrders(data.data);
      setPagination(data.pagination);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchOrders(1); }, [fetchOrders]);

  const columns = [
    { key: 'orderNumber', label: 'Order #', render: (v) => (
      <span className="font-mono text-xs font-semibold text-primary-700 dark:text-primary-300">{v}</span>
    )},
    { key: 'customerName', label: 'Customer' },
    { key: 'companyId', label: 'Company', render: (v) => v?.companyName || '—' },
    { key: 'materialId', label: 'Material', render: (v) => v?.name || '—' },
    { key: 'quantity', label: 'Qty', render: (v, row) => `${v} ${row.materialId?.unit || ''}` },
    { key: 'totalAmount', label: 'Amount', render: (v) => formatCurrency(v) },
    { key: 'status', label: 'Status', render: (v) => <OrderBadge status={v} /> },
    { key: 'assignedDriver', label: 'Driver', render: (v) => v?.name || <span className="text-slate-400 text-xs">Unassigned</span> },
    { key: 'createdAt', label: 'Date', render: (v) => <span className="text-xs text-slate-400">{timeAgo(v)}</span> },
    { key: '_id', label: '', render: (_, row) => (
      <Button size="xs" variant="ghost" icon={Eye} onClick={() => setSelected(row)}>View</Button>
    )},
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Order Monitoring</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Track all platform orders</p>
        </div>

        <Card>
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <Input placeholder="Search orders..." icon={Search}
              value={filters.search}
              onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
              className="sm:max-w-xs"
            />
            <Select value={filters.status}
              onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
              className="sm:max-w-[180px]">
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="in_transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </Select>
          </div>
          <Table columns={columns} data={orders} loading={loading} pagination={pagination} onPageChange={fetchOrders} />
        </Card>
      </div>

      {/* Order detail modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Order Detail" size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm font-bold text-primary-700 dark:text-primary-300">
                {selected.orderNumber}
              </span>
              <OrderBadge status={selected.status} />
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <DetailRow label="Customer" value={selected.customerName} />
              <DetailRow label="Phone" value={selected.customerPhone} />
              <DetailRow label="Company" value={selected.companyId?.companyName} />
              <DetailRow label="Material" value={selected.materialId?.name} />
              <DetailRow label="Quantity" value={selected.quantity} />
              <DetailRow label="Amount" value={formatCurrency(selected.totalAmount)} />
              <DetailRow label="Driver" value={selected.assignedDriver?.name} />
              <DetailRow label="Vehicle" value={selected.assignedVehicle?.registrationNumber} />
              <DetailRow label="Pickup" value={selected.pickupAddress} />
              <DetailRow label="Delivery" value={selected.deliveryAddress} />
              <DetailRow label="Created" value={formatDate(selected.createdAt)} />
              {selected.actualDelivery && <DetailRow label="Delivered" value={formatDate(selected.actualDelivery)} />}
            </div>
            {selected.notes && (
              <div className="p-3 bg-slate-50 dark:bg-dark-card2 rounded-xl">
                <p className="text-xs font-semibold text-slate-400 mb-1">Notes</p>
                <p className="text-sm text-slate-700 dark:text-slate-300">{selected.notes}</p>
              </div>
            )}

            {/* Delivery location map */}
            {selected.deliveryCoordinates?.lat && selected.deliveryCoordinates?.lng ? (
              <div className="rounded-xl overflow-hidden border border-light-border dark:border-dark-border">
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-dark-card2 border-b border-light-border dark:border-dark-border">
                  <MapPin className="w-3.5 h-3.5 text-primary-500" />
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Delivery Location
                  </span>
                  <span className="ml-auto text-xs text-slate-400 font-mono">
                    {selected.deliveryCoordinates.lat.toFixed(5)},&nbsp;
                    {selected.deliveryCoordinates.lng.toFixed(5)}
                  </span>
                </div>
                <MapContainer
                  key={`${selected._id}-map`}
                  center={[selected.deliveryCoordinates.lat, selected.deliveryCoordinates.lng]}
                  zoom={15}
                  style={{ height: '220px', width: '100%' }}
                  scrollWheelZoom={false}
                  zoomControl={true}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[selected.deliveryCoordinates.lat, selected.deliveryCoordinates.lng]}>
                    <Popup>
                      <div className="text-xs">
                        <p className="font-semibold">{selected.deliveryAddress}</p>
                        <p className="text-slate-400 mt-1">
                          {selected.deliveryCoordinates.lat.toFixed(6)},&nbsp;
                          {selected.deliveryCoordinates.lng.toFixed(6)}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
                <div className="px-3 py-2 bg-slate-50 dark:bg-dark-card2 text-xs text-slate-500 truncate">
                  📍 {selected.deliveryAddress}
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
    </PageTransition>
  );
};

const DetailRow = ({ label, value }) => (
  <div>
    <p className="text-xs text-slate-400 font-medium">{label}</p>
    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mt-0.5">{value || '—'}</p>
  </div>
);

export default AdminOrders;
