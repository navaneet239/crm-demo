import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  Briefcase,
  Building,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  FileCheck,
  FileText,
  Mail,
  MapPin,
  Phone,
  Plus,
  Trash2,
  User,
  Users,
} from 'lucide-react';
import {
  deleteClient,
  getClientById,
  updateClient,
  updateClientStage,
} from '../services/clientService';
import { getCustomFields, getPipelineStages } from '../services/settingsService';
import {
  Client,
  CustomFieldDefinition,
  DealStatus,
  FinancialRecord,
  Meeting,
  PipelineStage,
} from '../types';
import { formatAED, formatDate, formatFullAED } from '../utils/formatters';
import {
  getCategoryVariant,
  getDealStatusVariant,
  getStageVariant,
  StatusPill,
} from '../components/StatusPill';
import { DetailSkeleton } from '../components/Skeleton';
import { Modal } from '../components/Modal';

type ActiveTab = 'details' | 'financials' | 'meetings' | 'documents';

export const ClientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState<Client | null>(null);
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [customFields, setCustomFields] = useState<CustomFieldDefinition[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('details');

  // Deletion modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Financial record modal state
  const [isFinancialModalOpen, setIsFinancialModalOpen] = useState(false);
  const [newFinDesc, setNewFinDesc] = useState('');
  const [newFinType, setNewFinType] = useState<FinancialRecord['type']>('Deposit');
  const [newFinAmount, setNewFinAmount] = useState(50000);
  const [newFinStatus, setNewFinStatus] = useState<FinancialRecord['status']>('Pending');

  // Meeting record modal state
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [newMeetTitle, setNewMeetTitle] = useState('');
  const [newMeetType, setNewMeetType] = useState<Meeting['type']>('In-Person');
  const [newMeetDate, setNewMeetDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [newMeetTime, setNewMeetTime] = useState('11:00 AM');
  const [newMeetLoc, setNewMeetLoc] = useState('Client Office / Site');
  const [newMeetNotes, setNewMeetNotes] = useState('');

  const loadClientData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [fetchedClient, fetchedStages, fetchedFields] = await Promise.all([
        getClientById(id),
        getPipelineStages(),
        getCustomFields(),
      ]);
      if (!fetchedClient) {
        navigate('/clients');
        return;
      }
      setClient(fetchedClient);
      setStages(fetchedStages);
      setCustomFields(fetchedFields);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClientData();
  }, [id]);

  const handleStageChange = async (newStageId: string) => {
    if (!client) return;
    try {
      const updated = await updateClientStage(client.id, newStageId);
      setClient(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDealStatusChange = async (newStatus: DealStatus) => {
    if (!client) return;
    try {
      const updated = await updateClient(client.id, { dealStatus: newStatus });
      setClient(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteClient = async () => {
    if (!client) return;
    setIsDeleting(true);
    try {
      await deleteClient(client.id);
      navigate('/clients');
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const handleAddFinancial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;

    const newRecord: FinancialRecord = {
      id: `f-${Date.now()}`,
      description: newFinDesc,
      type: newFinType,
      amountAED: Number(newFinAmount),
      status: newFinStatus,
      date: new Date().toISOString().split('T')[0],
      invoiceNumber: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
    };

    const updatedFinancials = [...client.financials, newRecord];
    const updated = await updateClient(client.id, {
      financials: updatedFinancials,
    });
    setClient(updated);
    setIsFinancialModalOpen(false);
    setNewFinDesc('');
  };

  const handleAddMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;

    const newMeeting: Meeting = {
      id: `m-${Date.now()}`,
      title: newMeetTitle,
      type: newMeetType,
      date: newMeetDate,
      time: newMeetTime,
      location: newMeetLoc,
      agentName: client.assignedAgentName,
      notes: newMeetNotes,
    };

    const updatedMeetings = [newMeeting, ...client.meetings];
    const updated = await updateClient(client.id, {
      meetings: updatedMeetings,
    });
    setClient(updated);
    setIsMeetingModalOpen(false);
    setNewMeetTitle('');
    setNewMeetNotes('');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate('/clients')}
          className="inline-flex items-center gap-1.5 text-xs text-[#004080] font-medium"
        >
          <ArrowLeft size={14} strokeWidth={1.75} />
          <span>Back to Clients</span>
        </button>
        <DetailSkeleton />
      </div>
    );
  }

  if (!client) return null;

  const currentStageName =
    stages.find((s) => s.id === client.stageId)?.name || client.stageId;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate('/clients')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#004080] hover:text-[#003060] transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} strokeWidth={1.75} />
          <span>Back to Clients Portfolio</span>
        </button>
      </div>

      {/* Header with client name in serif, status pill, location, and date joined */}
      <div
        id="client-header-card"
        className="bg-white rounded-[8px] border border-[#DDE3EC] card-shadow p-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#101828]">
                {client.name}
              </h1>
              <StatusPill
                label={client.dealStatus}
                variant={getDealStatusVariant(client.dealStatus)}
              />
              <StatusPill
                label={client.category}
                variant={getCategoryVariant(client.category)}
              />
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-[#5C6880]">
              {client.companyName && (
                <div className="flex items-center gap-1.5 font-medium text-[#101828]">
                  <Building size={14} strokeWidth={1.75} className="text-[#004080]" />
                  <span>{client.companyName}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <MapPin size={14} strokeWidth={1.75} className="text-[#004080]" />
                <span>{client.location}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar size={14} strokeWidth={1.75} className="text-[#004080]" />
                <span>Client Since: {formatDate(client.dateJoined)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-[0.14em] font-semibold text-[#004080] block">
                Total Deal Valuation
              </span>
              <span className="font-serif text-2xl font-bold text-[#004080]">
                {formatFullAED(client.dealValueAED)}
              </span>
            </div>
          </div>
        </div>

        {/* Four Tabs: Details, Financials, Meetings, Documents */}
        <div className="flex items-center gap-2 border-t border-[#DDE3EC] mt-6 pt-3 overflow-x-auto scrollbar-none">
          {(
            [
              { id: 'details', label: 'Details' },
              { id: 'financials', label: `Financials (${client.financials.length})` },
              { id: 'meetings', label: `Meetings (${client.meetings.length})` },
              { id: 'documents', label: `Documents (${client.documents.length})` },
            ] as const
          ).map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-[6px] text-xs font-semibold tracking-wide transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#E7EEF7] text-[#004080] border border-[#004080]/20'
                    : 'text-[#5C6880] hover:text-[#101828] hover:bg-[#F0F4F9]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Details */}
      {activeTab === 'details' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Details shows contact info, registered address, assigned agent */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[8px] border border-[#DDE3EC] card-shadow p-6 space-y-6">
              <div>
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#004080] mb-4">
                  Contact & Entity Specifications
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-[#F0F4F9] p-3.5 rounded-[6px] border border-[#DDE3EC]">
                    <span className="text-[10px] uppercase tracking-wider text-[#5C6880] block mb-1">
                      Email Address
                    </span>
                    <a
                      href={`mailto:${client.email}`}
                      className="text-xs font-semibold text-[#004080] hover:underline flex items-center gap-1.5"
                    >
                      <Mail size={13} strokeWidth={1.75} />
                      <span className="truncate">{client.email}</span>
                    </a>
                  </div>

                  <div className="bg-[#F0F4F9] p-3.5 rounded-[6px] border border-[#DDE3EC]">
                    <span className="text-[10px] uppercase tracking-wider text-[#5C6880] block mb-1">
                      Direct Phone
                    </span>
                    <a
                      href={`tel:${client.phone}`}
                      className="text-xs font-semibold text-[#004080] hover:underline flex items-center gap-1.5"
                    >
                      <Phone size={13} strokeWidth={1.75} />
                      <span>{client.phone}</span>
                    </a>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#004080] mb-2">
                  Registered Legal Address
                </h3>
                <p className="text-xs text-[#101828] bg-[#F0F4F9] p-3 rounded-[6px] border border-[#DDE3EC]">
                  {client.registeredAddress}
                </p>
              </div>

              <div>
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#004080] mb-2">
                  Assigned Property Advisor
                </h3>
                <div className="flex items-center gap-3 bg-[#F0F4F9] p-3.5 rounded-[6px] border border-[#DDE3EC]">
                  <div className="w-9 h-9 rounded-full bg-[#004080] text-white font-semibold text-xs flex items-center justify-center">
                    {client.assignedAgentName
                      .split(' ')
                      .map((x) => x[0])
                      .join('')}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#101828]">
                      {client.assignedAgentName}
                    </p>
                    <p className="text-[11px] text-[#5C6880]">
                      Senior Advisory Consultant • License RERA Certified
                    </p>
                  </div>
                </div>
              </div>

              {/* Dynamic Custom Fields */}
              {customFields.length > 0 && (
                <div>
                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#004080] mb-3">
                    Workspace Custom Parameters
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {customFields.map((field) => {
                      const val = client.customFields?.[field.id] ?? '—';
                      return (
                        <div
                          key={field.id}
                          className="p-3 bg-[#FFFFFF] rounded-[6px] border border-[#DDE3EC]"
                        >
                          <span className="text-[10px] uppercase tracking-wider text-[#5C6880] block mb-1">
                            {field.label}
                          </span>
                          <span className="text-xs font-semibold text-[#101828]">
                            {String(val)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right-hand panel with deal stage and key dates */}
          <div className="space-y-6">
            <div
              id="deal-stage-panel"
              className="bg-white rounded-[8px] border border-[#DDE3EC] card-shadow p-6 space-y-4"
            >
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#004080]">
                Transaction Milestones
              </h3>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#5C6880] mb-1.5">
                  Pipeline Stage
                </label>
                <select
                  id="client-stage-select"
                  value={client.stageId}
                  onChange={(e) => handleStageChange(e.target.value)}
                  className="w-full bg-[#F0F4F9] text-xs font-semibold text-[#004080] px-3 py-2 rounded-[6px] border border-[#DDE3EC] focus:outline-hidden"
                >
                  {stages.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#5C6880] mb-1.5">
                  Deal Status
                </label>
                <select
                  id="client-status-select"
                  value={client.dealStatus}
                  onChange={(e) =>
                    handleDealStatusChange(e.target.value as DealStatus)
                  }
                  className="w-full bg-[#F0F4F9] text-xs font-semibold text-[#101828] px-3 py-2 rounded-[6px] border border-[#DDE3EC] focus:outline-hidden"
                >
                  <option value="Active">Active</option>
                  <option value="Under Offer">Under Offer</option>
                  <option value="Won">Won</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>

              <div className="pt-3 border-t border-[#DDE3EC] space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#5C6880]">Date Registered:</span>
                  <span className="font-semibold text-[#101828]">
                    {formatDate(client.dateJoined)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#5C6880]">Expected Closing:</span>
                  <span className="font-semibold text-[#004080]">
                    {formatDate(client.expectedClosingDate || '')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#5C6880]">Location Tier:</span>
                  <span className="font-semibold text-[#101828]">
                    {client.location} (Prime)
                  </span>
                </div>
              </div>

              {client.notes && (
                <div className="pt-3 border-t border-[#DDE3EC]">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#5C6880] block mb-1">
                    Advisory Notes
                  </span>
                  <p className="text-xs text-[#5C6880] italic leading-relaxed bg-[#F0F4F9] p-2.5 rounded-[6px]">
                    "{client.notes}"
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Financials */}
      {activeTab === 'financials' && (
        <div className="bg-white rounded-[8px] border border-[#DDE3EC] card-shadow p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg font-semibold text-[#101828]">
                Settlements & Commission Schedule
              </h3>
              <p className="text-xs text-[#5C6880]">
                All escrow amounts and brokerage fee ledger entries in AED
              </p>
            </div>
            <button
              onClick={() => setIsFinancialModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#004080] text-white rounded-[6px] hover:bg-[#003060] transition-colors cursor-pointer"
            >
              <Plus size={14} strokeWidth={1.75} />
              <span>Add Amount</span>
            </button>
          </div>

          {client.financials.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#5C6880] border border-dashed border-[#DDE3EC] rounded-[6px]">
              No financial records logged yet for this dossier.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F0F4F9] border-b border-[#DDE3EC] text-[10px] font-semibold uppercase tracking-[0.14em] text-[#004080]">
                    <th className="py-2.5 px-4">Description</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Invoice Ref</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Due / Date</th>
                    <th className="py-2.5 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDE3EC]">
                  {client.financials.map((fin) => (
                    <tr key={fin.id} className="hover:bg-[#F0F4F9]">
                      <td className="py-3 px-4 font-medium text-[#101828]">
                        {fin.description}
                      </td>
                      <td className="py-3 px-3 text-[#5C6880]">{fin.type}</td>
                      <td className="py-3 px-3 font-mono text-[11px] text-[#004080]">
                        {fin.invoiceNumber}
                      </td>
                      <td className="py-3 px-3">
                        <StatusPill
                          label={fin.status}
                          variant={
                            fin.status === 'Paid'
                              ? 'success'
                              : fin.status === 'Pending'
                              ? 'warning'
                              : 'danger'
                          }
                        />
                      </td>
                      <td className="py-3 px-3 text-[#5C6880]">
                        {formatDate(fin.date)}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-[#101828]">
                        {formatFullAED(fin.amountAED)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="p-3 border-t border-[#DDE3EC] bg-[#F0F4F9] flex justify-between text-xs font-semibold">
                <span className="text-[#004080]">Total Logged Settlements</span>
                <span className="text-[#004080]">
                  {formatFullAED(
                    client.financials.reduce((acc, f) => acc + f.amountAED, 0)
                  )}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Meetings */}
      {activeTab === 'meetings' && (
        <div className="bg-white rounded-[8px] border border-[#DDE3EC] card-shadow p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg font-semibold text-[#101828]">
                Advisory Consultation Timeline
              </h3>
              <p className="text-xs text-[#5C6880]">
                Chronological record of site inspections and legal signings
              </p>
            </div>
            <button
              onClick={() => setIsMeetingModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#004080] text-white rounded-[6px] hover:bg-[#003060] transition-colors cursor-pointer"
            >
              <Plus size={14} strokeWidth={1.75} />
              <span>Schedule Meeting</span>
            </button>
          </div>

          {client.meetings.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#5C6880] border border-dashed border-[#DDE3EC] rounded-[6px]">
              No meetings or site visits recorded.
            </div>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-[#DDE3EC]">
              {client.meetings.map((m) => (
                <div key={m.id} className="relative group">
                  {/* Timeline dot */}
                  <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-white border-2 border-[#004080]" />

                  <div className="bg-[#F0F4F9] rounded-[6px] border border-[#DDE3EC] p-4 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-serif font-semibold text-sm text-[#101828]">
                          {m.title}
                        </h4>
                        <StatusPill
                          label={m.type}
                          variant={
                            m.type === 'Contract Signing'
                              ? 'success'
                              : m.type === 'Site Visit'
                              ? 'primary'
                              : 'neutral'
                          }
                        />
                      </div>
                      <span className="text-xs font-mono text-[#5C6880]">
                        {formatDate(m.date)} at {m.time}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-[#5C6880]">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} strokeWidth={1.75} />
                        {m.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <User size={12} strokeWidth={1.75} />
                        Conducted by: {m.agentName}
                      </span>
                    </div>

                    {m.notes && (
                      <p className="text-xs text-[#101828] pt-1 border-t border-[#DDE3EC]/70">
                        {m.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Documents */}
      {activeTab === 'documents' && (
        <div className="bg-white rounded-[8px] border border-[#DDE3EC] card-shadow p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg font-semibold text-[#101828]">
                Dossier Attachments & DLD Filings
              </h3>
              <p className="text-xs text-[#5C6880]">
                Verified passport copies, Title deeds, Form F and Ejari contracts
              </p>
            </div>
          </div>

          <div className="divide-y divide-[#DDE3EC] border border-[#DDE3EC] rounded-[6px] overflow-hidden">
            {client.documents.map((doc) => (
              <div
                key={doc.id}
                className="p-3.5 flex items-center justify-between hover:bg-[#F0F4F9] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-[#E7EEF7] text-[#004080] flex items-center justify-center font-semibold text-xs shrink-0">
                    <FileText size={16} strokeWidth={1.75} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#101828]">
                      {doc.name}
                    </p>
                    <p className="text-[11px] text-[#5C6880]">
                      {doc.type} • {doc.size} • Uploaded {formatDate(doc.uploadedDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <StatusPill
                    label={doc.status}
                    variant={
                      doc.status === 'Signed' || doc.status === 'Verified'
                        ? 'success'
                        : 'warning'
                    }
                  />
                  <button
                    onClick={() =>
                      alert(`Demo: downloading ${doc.name} from secure document vault.`)
                    }
                    className="p-1 text-[#5C6880] hover:text-[#004080] rounded transition-colors"
                    title="Download document"
                  >
                    <Download size={15} strokeWidth={1.75} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Danger Zone Panel at the bottom: #FEF3F2 background and #B42318 border */}
      <div
        id="danger-zone-panel"
        className="bg-[#FEF3F2] rounded-[8px] border border-[#B42318] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2 text-[#B42318] font-serif font-semibold text-base mb-1">
            <AlertTriangle size={18} strokeWidth={1.75} />
            <span>Danger Zone</span>
          </div>
          <p className="text-xs text-[#B42318]/90">
            Permanently delete this client dossier, transactions, meetings, and
            attached documents. This action cannot be undone.
          </p>
        </div>

        <button
          id="delete-client-trigger-btn"
          type="button"
          onClick={() => setIsDeleteModalOpen(true)}
          className="px-4 py-2 text-xs font-semibold bg-[#B42318] hover:bg-[#912018] text-white rounded-[6px] transition-colors cursor-pointer shrink-0 inline-flex items-center justify-center gap-1.5"
        >
          <Trash2 size={14} strokeWidth={1.75} />
          <span>Delete Dossier</span>
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Client Dossier Deletion"
        id="delete-confirm-modal"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-[#FEF3F2] rounded-[6px] border border-[#B42318]/30 text-[#B42318] flex items-start gap-2.5">
            <AlertTriangle size={16} strokeWidth={1.75} className="shrink-0 mt-0.5" />
            <p>
              Are you sure you want to permanently delete the dossier for{' '}
              <strong className="font-semibold text-[#101828]">
                {client.name}
              </strong>
              ? All records and pipeline history will be erased from the
              brokerage CRM.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#DDE3EC]">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-[#5C6880] hover:text-[#101828] rounded-[6px] hover:bg-[#F0F4F9]"
            >
              Cancel
            </button>
            <button
              id="confirm-delete-btn"
              type="button"
              disabled={isDeleting}
              onClick={handleDeleteClient}
              className="px-4 py-2 text-xs font-semibold bg-[#B42318] hover:bg-[#912018] text-white rounded-[6px] transition-colors cursor-pointer disabled:opacity-60"
            >
              {isDeleting ? 'Deleting...' : 'Confirm Permanent Deletion'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Financial Modal */}
      <Modal
        isOpen={isFinancialModalOpen}
        onClose={() => setIsFinancialModalOpen(false)}
        title="Record Financial Transaction"
      >
        <form onSubmit={handleAddFinancial} className="space-y-4 text-xs">
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#004080] mb-1">
              Description *
            </label>
            <input
              type="text"
              required
              value={newFinDesc}
              onChange={(e) => setNewFinDesc(e.target.value)}
              placeholder="e.g. 5% Handover Installment to Trustee"
              className="w-full bg-white text-xs px-3 py-2 rounded-[6px] border border-[#DDE3EC] focus:border-[#004080] focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#004080] mb-1">
                Type
              </label>
              <select
                value={newFinType}
                onChange={(e) =>
                  setNewFinType(e.target.value as FinancialRecord['type'])
                }
                className="w-full bg-white text-xs px-3 py-2 rounded-[6px] border border-[#DDE3EC] focus:border-[#004080] focus:outline-hidden"
              >
                <option value="Deposit">Deposit</option>
                <option value="Commission">Commission</option>
                <option value="Transfer Tax">Transfer Tax</option>
                <option value="Listing Fee">Listing Fee</option>
                <option value="Escrow">Escrow</option>
                <option value="Legal Fee">Legal Fee</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#004080] mb-1">
                Amount (AED) *
              </label>
              <input
                type="number"
                required
                min={100}
                value={newFinAmount}
                onChange={(e) => setNewFinAmount(Number(e.target.value))}
                className="w-full bg-white text-xs px-3 py-2 rounded-[6px] border border-[#DDE3EC] focus:border-[#004080] focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#004080] mb-1">
              Status
            </label>
            <select
              value={newFinStatus}
              onChange={(e) =>
                setNewFinStatus(e.target.value as FinancialRecord['status'])
              }
              className="w-full bg-white text-xs px-3 py-2 rounded-[6px] border border-[#DDE3EC] focus:border-[#004080] focus:outline-hidden"
            >
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#DDE3EC]">
            <button
              type="button"
              onClick={() => setIsFinancialModalOpen(false)}
              className="px-4 py-2 text-xs text-[#5C6880]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold bg-[#004080] text-white rounded-[6px]"
            >
              Save Record
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Meeting Modal */}
      <Modal
        isOpen={isMeetingModalOpen}
        onClose={() => setIsMeetingModalOpen(false)}
        title="Schedule Client Meeting / Site Visit"
      >
        <form onSubmit={handleAddMeeting} className="space-y-4 text-xs">
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#004080] mb-1">
              Meeting Title *
            </label>
            <input
              type="text"
              required
              value={newMeetTitle}
              onChange={(e) => setNewMeetTitle(e.target.value)}
              placeholder="e.g. Contract F Review & Trustee Booking"
              className="w-full bg-white text-xs px-3 py-2 rounded-[6px] border border-[#DDE3EC] focus:border-[#004080] focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#004080] mb-1">
                Type
              </label>
              <select
                value={newMeetType}
                onChange={(e) =>
                  setNewMeetType(e.target.value as Meeting['type'])
                }
                className="w-full bg-white text-xs px-3 py-2 rounded-[6px] border border-[#DDE3EC] focus:border-[#004080] focus:outline-hidden"
              >
                <option value="In-Person">In-Person</option>
                <option value="Video Call">Video Call</option>
                <option value="Site Visit">Site Visit</option>
                <option value="Contract Signing">Contract Signing</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#004080] mb-1">
                Time
              </label>
              <input
                type="text"
                value={newMeetTime}
                onChange={(e) => setNewMeetTime(e.target.value)}
                placeholder="e.g. 02:30 PM"
                className="w-full bg-white text-xs px-3 py-2 rounded-[6px] border border-[#DDE3EC] focus:border-[#004080] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#004080] mb-1">
                Date
              </label>
              <input
                type="date"
                value={newMeetDate}
                onChange={(e) => setNewMeetDate(e.target.value)}
                className="w-full bg-white text-xs px-3 py-2 rounded-[6px] border border-[#DDE3EC] focus:border-[#004080] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#004080] mb-1">
                Location
              </label>
              <input
                type="text"
                value={newMeetLoc}
                onChange={(e) => setNewMeetLoc(e.target.value)}
                placeholder="e.g. DIFC Gate Village or Site"
                className="w-full bg-white text-xs px-3 py-2 rounded-[6px] border border-[#DDE3EC] focus:border-[#004080] focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#004080] mb-1">
              Discussion Agenda / Notes
            </label>
            <textarea
              rows={3}
              value={newMeetNotes}
              onChange={(e) => setNewMeetNotes(e.target.value)}
              placeholder="Key terms to align..."
              className="w-full bg-white text-xs px-3 py-2 rounded-[6px] border border-[#DDE3EC] focus:border-[#004080] focus:outline-hidden"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#DDE3EC]">
            <button
              type="button"
              onClick={() => setIsMeetingModalOpen(false)}
              className="px-4 py-2 text-xs text-[#5C6880]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold bg-[#004080] text-white rounded-[6px]"
            >
              Schedule
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
