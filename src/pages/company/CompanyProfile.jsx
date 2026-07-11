import { useState, useEffect, useMemo } from 'react';
import { Building2, Phone, Mail, MapPin, Clock, Globe, Save } from 'lucide-react';
import { State, City } from 'country-state-city';
import api from '@/api/axios';
import Card, { CardHeader } from '@/components/common/Card';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { Textarea } from '@/components/common/Input';
import { CompanyBadge } from '@/components/common/Badge';
import { SkeletonCard } from '@/components/common/Loader';
import SearchableSelect from '@/components/common/SearchableSelect';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const COUNTRY = 'IN';

// All Indian states as {isoCode, name}
const ALL_STATES = State.getStatesOfCountry(COUNTRY);

const CompanyProfile = () => {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [stateIso, setStateIso] = useState(''); // isoCode for fetching cities
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  // City list derived from selected state
  const cityOptions = useMemo(
    () => stateIso ? City.getCitiesOfState(COUNTRY, stateIso).map((c) => c.name) : [],
    [stateIso]
  );
  const stateOptions = ALL_STATES.map((s) => s.name);

  useEffect(() => {
    api.get('/company/profile')
      .then(({ data }) => {
        setProfile(data.data);
        const savedState = data.data.state || '';
        const iso = ALL_STATES.find((s) => s.name === savedState)?.isoCode || '';
        setStateIso(iso);
        setForm({
          companyName:        data.data.companyName        || '',
          contactPhone:       data.data.contactPhone       || '',
          contactEmail:       data.data.contactEmail       || '',
          address:            data.data.address            || '',
          state:              savedState,
          district:           data.data.district           || '',
          city:               data.data.city               || '',
          servicingDistricts: data.data.servicingDistricts || [],
          description:        data.data.description        || '',
          website:            data.data.website            || '',
          openingHours:       data.data.openingHours       || {},
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      const { data } = await api.put('/company/profile', form);
      setProfile(data.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  // When the state changes, reset district, city, servicingDistricts
  const handleStateChange = (name) => {
    const iso = ALL_STATES.find((s) => s.name === name)?.isoCode || '';
    setStateIso(iso);
    setForm((p) => ({ ...p, state: name, district: '', city: '', servicingDistricts: [] }));
  };

  const setHours = (day, field, value) => {
    setForm((p) => ({
      ...p,
      openingHours: {
        ...p.openingHours,
        [day]: { ...p.openingHours[day], [field]: field === 'closed' ? value : value },
      },
    }));
  };

  if (loading) return (
    <div className="space-y-6">
      <div className="h-8 shimmer-bg w-48 rounded" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonCard /><SkeletonCard />
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Company Profile</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your company information</p>
        </div>
        <div className="flex items-center gap-3">
          {profile && <CompanyBadge status={profile.approvalStatus} />}
          <Button type="submit" loading={saving} icon={Save} variant={saved ? 'success' : 'primary'}>
            {saved ? 'Saved!' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Basic Info */}
      <Card animate={false}>
        <CardHeader title="Basic Information" icon={Building2} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Company Name" icon={Building2} value={form.companyName}
            onChange={(e) => setForm((p) => ({ ...p, companyName: e.target.value }))} required />
          <Input label="Contact Phone" icon={Phone} value={form.contactPhone}
            onChange={(e) => setForm((p) => ({ ...p, contactPhone: e.target.value }))} />
          <Input label="Contact Email" type="email" icon={Mail} value={form.contactEmail}
            onChange={(e) => setForm((p) => ({ ...p, contactEmail: e.target.value }))} />
          <Input label="Website" icon={Globe} value={form.website}
            onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))} />
          <Input label="Street Address" icon={MapPin} value={form.address}
            onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
            placeholder="Building / street name"
            className="md:col-span-2" />
          <Textarea label="Description" value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            placeholder="Describe your services..."
            rows={3} className="md:col-span-2" />
        </div>
      </Card>

      {/* Location & Service Coverage */}
      <Card animate={false}>
        <CardHeader title="Location & Service Coverage" icon={MapPin} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* State */}
          <SearchableSelect
            label="State"
            icon={MapPin}
            options={stateOptions}
            value={form.state}
            onChange={handleStateChange}
            placeholder="Select state…"
          />

          {/* District / Main City */}
          <SearchableSelect
            label="District / Main City"
            icon={MapPin}
            options={cityOptions}
            value={form.district}
            onChange={(v) => setForm((p) => ({ ...p, district: v }))}
            placeholder={form.state ? 'Select district…' : 'Select state first'}
            disabled={!form.state}
          />

          {/* Operating City / Area */}
          <SearchableSelect
            label="Operating City / Area"
            icon={MapPin}
            options={cityOptions}
            value={form.city}
            onChange={(v) => setForm((p) => ({ ...p, city: v }))}
            placeholder={form.state ? 'Select city / area…' : 'Select state first'}
            disabled={!form.state}
          />

          {/* Servicing Districts — multi-select */}
          <SearchableSelect
            label="Servicing Districts"
            icon={MapPin}
            options={cityOptions}
            value={form.servicingDistricts}
            onChange={(v) => setForm((p) => ({ ...p, servicingDistricts: v }))}
            placeholder={form.state ? 'Pick all districts you serve…' : 'Select state first'}
            multi
            disabled={!form.state}
            hint="All districts / cities your company delivers to"
            className="md:col-span-2"
          />
        </div>
      </Card>

      {/* Opening Hours */}
      <Card animate={false}>
        <CardHeader title="Opening Hours" icon={Clock} />
        <div className="space-y-3">
          {DAYS.map((day) => {
            const h = form.openingHours?.[day] || {};
            return (
              <div key={day} className="flex items-center gap-4 py-2 border-b border-light-border dark:border-dark-border last:border-0">
                <div className="w-28 flex-shrink-0">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">{day}</p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!h.closed}
                    onChange={(e) => setHours(day, 'closed', !e.target.checked)}
                    className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-slate-500">{h.closed ? 'Closed' : 'Open'}</span>
                </label>
                {!h.closed && (
                  <div className="flex items-center gap-2 flex-1">
                    <input type="time" value={h.open || '09:00'} onChange={(e) => setHours(day, 'open', e.target.value)}
                      className="input-base !w-auto !py-1.5 text-xs" />
                    <span className="text-slate-400 text-sm">to</span>
                    <input type="time" value={h.close || '18:00'} onChange={(e) => setHours(day, 'close', e.target.value)}
                      className="input-base !w-auto !py-1.5 text-xs" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </form>
  );
};

export default CompanyProfile;
