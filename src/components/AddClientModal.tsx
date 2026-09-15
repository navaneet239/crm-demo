import React, { useEffect, useState } from 'react';
import { Modal } from './Modal';
import { getCustomFields } from '../services/settingsService';
import { getUsers } from '../services/userService';
import { createClient } from '../services/clientService';
import { Client, ClientCategory, CustomFieldDefinition, DealStatus, PipelineStage, User } from '../types';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClientAdded: (client: Client) => void;
  stages: PipelineStage[];
}

export const AddClientModal: React.FC<AddClientModalProps> = ({
  isOpen,
  onClose,
  onClientAdded,
  stages,
}) => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [customFields, setCustomFields] = useState<CustomFieldDefinition[]>([]);

  // Form state
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+971 50 ');
  const [location, setLocation] = useState('Downtown Dubai');
  const [registeredAddress, setRegisteredAddress] = useState('');
  const [category, setCategory] = useState<ClientCategory>('Buyer');
  const [stageId, setStageId] = useState(stages[0]?.id || 'enquiry');
  const [dealStatus, setDealStatus] = useState<DealStatus>('Active');
  const [dealValueAED, setDealValueAED] = useState<number>(3500000);
  const [assignedAgentId, setAssignedAgentId] = useState('');
  const [customValues, setCustomValues] = useState<Record<string, any>>({});

  useEffect(() => {
    if (isOpen) {
      getUsers().then((u) => {
        setUsers(u);
        const defaultAgent = u.find((x) => x.role === 'Agent') || u[0];
        if (defaultAgent) {
          setAssignedAgentId(defaultAgent.id);
        }
      });
      getCustomFields().then((f) => setCustomFields(f));
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const assignedUser = users.find((u) => u.id === assignedAgentId);
      const newClient = await createClient({
        name,
        companyName: companyName.trim() || undefined,
        email,
        phone,
        location,
        registeredAddress: registeredAddress || `${location}, Dubai, UAE`,
        category,
        stageId,
        dealStatus,
        dealValueAED: Number(dealValueAED) || 0,
        assignedAgentId: assignedUser ? assignedUser.id : 'user-3',
        assignedAgentName: assignedUser ? assignedUser.name : 'Farhan Malik',
        customFields: customValues,
      });

      onClientAdded(newClient);
      onClose();
      // Reset form
      setName('');
      setCompanyName('');
      setEmail('');
      setPhone('+971 50 ');
      setCustomValues({});
    } catch (err) {
      console.error('Failed to create client', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Client Dossier"
      maxWidth="max-w-2xl"
      id="add-client-modal"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#004080] mb-1">
              Full Client Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rashid Al-Ghurair"
              className="w-full bg-white text-[#101828] text-sm px-3 py-2 rounded-[6px] border border-[#DDE3EC] focus:border-[#004080] focus:ring-1 focus:ring-[#004080] focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#004080] mb-1">
              Entity / Company Name
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Al-Ghurair Investment Holdings"
              className="w-full bg-white text-[#101828] text-sm px-3 py-2 rounded-[6px] border border-[#DDE3EC] focus:border-[#004080] focus:ring-1 focus:ring-[#004080] focus:outline-hidden"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#004080] mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="client@emiratesholding.ae"
              className="w-full bg-white text-[#101828] text-sm px-3 py-2 rounded-[6px] border border-[#DDE3EC] focus:border-[#004080] focus:ring-1 focus:ring-[#004080] focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#004080] mb-1">
              Contact Phone *
            </label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+971 50 123 4567"
              className="w-full bg-white text-[#101828] text-sm px-3 py-2 rounded-[6px] border border-[#DDE3EC] focus:border-[#004080] focus:ring-1 focus:ring-[#004080] focus:outline-hidden"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#004080] mb-1">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ClientCategory)}
              className="w-full bg-white text-[#101828] text-sm px-3 py-2 rounded-[6px] border border-[#DDE3EC] focus:border-[#004080] focus:outline-hidden"
            >
              <option value="Buyer">Buyer</option>
              <option value="Seller">Seller</option>
              <option value="Landlord">Landlord</option>
              <option value="Tenant">Tenant</option>
              <option value="Investor">Investor</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#004080] mb-1">
              Location / Sub-Market *
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-white text-[#101828] text-sm px-3 py-2 rounded-[6px] border border-[#DDE3EC] focus:border-[#004080] focus:outline-hidden"
            >
              <option value="Downtown Dubai">Downtown Dubai</option>
              <option value="Palm Jumeirah">Palm Jumeirah</option>
              <option value="Business Bay">Business Bay</option>
              <option value="Jumeirah Lake Towers">Jumeirah Lake Towers</option>
              <option value="Dubai Hills Estate">Dubai Hills Estate</option>
              <option value="Al Barsha">Al Barsha</option>
              <option value="Deira">Deira</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#004080] mb-1">
              Deal Value (AED) *
            </label>
            <input
              type="number"
              required
              min={10000}
              step={50000}
              value={dealValueAED}
              onChange={(e) => setDealValueAED(Number(e.target.value))}
              className="w-full bg-white text-[#101828] text-sm px-3 py-2 rounded-[6px] border border-[#DDE3EC] focus:border-[#004080] focus:outline-hidden"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#004080] mb-1">
              Pipeline Stage
            </label>
            <select
              value={stageId}
              onChange={(e) => setStageId(e.target.value)}
              className="w-full bg-white text-[#101828] text-sm px-3 py-2 rounded-[6px] border border-[#DDE3EC] focus:border-[#004080] focus:outline-hidden"
            >
              {stages.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#004080] mb-1">
              Deal Status
            </label>
            <select
              value={dealStatus}
              onChange={(e) => setDealStatus(e.target.value as DealStatus)}
              className="w-full bg-white text-[#101828] text-sm px-3 py-2 rounded-[6px] border border-[#DDE3EC] focus:border-[#004080] focus:outline-hidden"
            >
              <option value="Active">Active</option>
              <option value="Under Offer">Under Offer</option>
              <option value="Won">Won</option>
              <option value="On Hold">On Hold</option>
              <option value="Lost">Lost</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#004080] mb-1">
              Assigned Advisor
            </label>
            <select
              value={assignedAgentId}
              onChange={(e) => setAssignedAgentId(e.target.value)}
              className="w-full bg-white text-[#101828] text-sm px-3 py-2 rounded-[6px] border border-[#DDE3EC] focus:border-[#004080] focus:outline-hidden"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#004080] mb-1">
            Registered Address
          </label>
          <input
            type="text"
            value={registeredAddress}
            onChange={(e) => setRegisteredAddress(e.target.value)}
            placeholder="Office/Villa number, Community, Dubai, UAE"
            className="w-full bg-white text-[#101828] text-sm px-3 py-2 rounded-[6px] border border-[#DDE3EC] focus:border-[#004080] focus:outline-hidden"
          />
        </div>

        {/* Dynamic Custom Fields configured in Settings */}
        {customFields.length > 0 && (
          <div className="pt-3 border-t border-[#DDE3EC]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#004080] mb-2">
              Workspace Custom Fields
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {customFields.map((field) => (
                <div key={field.id}>
                  <label className="block text-[10px] text-[#5C6880] mb-1 font-medium">
                    {field.label}
                  </label>
                  {field.type === 'select' && field.options ? (
                    <select
                      value={customValues[field.id] || ''}
                      onChange={(e) =>
                        setCustomValues({
                          ...customValues,
                          [field.id]: e.target.value,
                        })
                      }
                      className="w-full bg-white text-[#101828] text-sm px-3 py-1.5 rounded-[6px] border border-[#DDE3EC] focus:border-[#004080] focus:outline-hidden"
                    >
                      <option value="">{field.placeholder || 'Select...'}</option>
                      {field.options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type === 'number' ? 'number' : 'text'}
                      value={customValues[field.id] || ''}
                      placeholder={field.placeholder}
                      onChange={(e) =>
                        setCustomValues({
                          ...customValues,
                          [field.id]: e.target.value,
                        })
                      }
                      className="w-full bg-white text-[#101828] text-sm px-3 py-1.5 rounded-[6px] border border-[#DDE3EC] focus:border-[#004080] focus:outline-hidden"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-[#DDE3EC] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-[#5C6880] hover:text-[#101828] rounded-[6px] hover:bg-[#F0F4F9] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-semibold bg-[#004080] hover:bg-[#003060] text-white rounded-[6px] transition-colors disabled:opacity-60 cursor-pointer"
          >
            {loading ? 'Registering...' : 'Save Client Dossier'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
