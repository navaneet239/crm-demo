import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Building,
  CheckCircle2,
  ChevronRight,
  Download,
  Plus,
  Search,
  TrendingUp,
  UserPlus,
  Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  exportClientsCsv,
  getClients,
  getClientStats,
} from '../services/clientService';
import { getPipelineStages } from '../services/settingsService';
import {
  Client,
  ClientCategory,
  ClientStats,
  PipelineStage,
} from '../types';
import { formatAED, formatFullAED } from '../utils/formatters';
import {
  getCategoryVariant,
  getDealStatusVariant,
  getStageVariant,
  StatusPill,
} from '../components/StatusPill';
import { StatCardsSkeleton, TableSkeleton } from '../components/Skeleton';
import { AddClientModal } from '../components/AddClientModal';

const CATEGORIES: (ClientCategory | 'All')[] = [
  'All',
  'Buyer',
  'Seller',
  'Landlord',
  'Tenant',
  'Investor',
];

export const ClientsListPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [stats, setStats] = useState<ClientStats | null>(null);
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ClientCategory | 'All'>('All');

  const loadData = async () => {
    setLoading(true);
    try {
      const [clientList, clientStats, pipelineStages] = await Promise.all([
        getClients(
          {
            category: selectedCategory,
            search: searchTerm,
          },
          currentUser || undefined
        ),
        getClientStats(currentUser || undefined),
        getPipelineStages(),
      ]);

      setClients(clientList);
      setStats(clientStats);
      setStages(pipelineStages);
    } catch (err) {
      console.error('Error fetching clients data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser, selectedCategory, searchTerm]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const csv = await exportClientsCsv(
        {
          category: selectedCategory,
          search: searchTerm,
        },
        currentUser || undefined
      );

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `dubai_brokerage_clients_${new Date().toISOString().split('T')[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Export failed', err);
    } finally {
      setExporting(false);
    }
  };

  const getStageName = (stageId: string) => {
    const stage = stages.find((s) => s.id === stageId);
    return stage ? stage.name : stageId;
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#004080]">
            Brokerage Portfolio
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#101828]">
            Clients & Advisory Dossiers
          </h1>
          {currentUser?.role === 'Agent' && (
            <p className="text-xs text-[#5C6880] mt-0.5">
              Showing accounts assigned exclusively to {currentUser.name}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            id="export-clients-btn"
            type="button"
            onClick={handleExport}
            disabled={exporting || loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-[6px] bg-white text-[#004080] border border-[#DDE3EC] hover:bg-[#F0F4F9] card-shadow transition-colors disabled:opacity-60 cursor-pointer"
          >
            <Download size={15} strokeWidth={1.75} />
            <span>{exporting ? 'Generating...' : 'Export CSV'}</span>
          </button>

          <button
            id="add-client-btn"
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-[6px] bg-[#004080] text-white hover:bg-[#003060] card-shadow transition-colors cursor-pointer"
          >
            <Plus size={15} strokeWidth={1.75} />
            <span>Add Client</span>
          </button>
        </div>
      </div>

      {/* Three Stat Cards Across the Top */}
      {loading && !stats ? (
        <StatCardsSkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div
            id="stat-total-clients"
            className="bg-white p-5 rounded-[8px] border border-[#DDE3EC] card-shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#004080]">
                  Total Clients
                </span>
                <Users size={16} strokeWidth={1.75} className="text-[#5C6880]" />
              </div>
              <p className="font-serif text-3xl sm:text-4xl font-bold text-[#004080]">
                {stats?.totalClients ?? 0}
              </p>
            </div>
            <p className="text-xs text-[#5C6880] mt-3">
              Active buyer, seller, landlord & investor accounts
            </p>
          </div>

          <div
            id="stat-active-deals"
            className="bg-white p-5 rounded-[8px] border border-[#DDE3EC] card-shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#004080]">
                  Active Deals
                </span>
                <TrendingUp size={16} strokeWidth={1.75} className="text-[#067647]" />
              </div>
              <p className="font-serif text-3xl sm:text-4xl font-bold text-[#004080]">
                {stats?.activeDeals ?? 0}
              </p>
            </div>
            <p className="text-xs text-[#5C6880] mt-3">
              Under current negotiation or contractual agreement
            </p>
          </div>

          <div
            id="stat-closed-month"
            className="bg-white p-5 rounded-[8px] border border-[#DDE3EC] card-shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#004080]">
                  Closed This Month
                </span>
                <CheckCircle2 size={16} strokeWidth={1.75} className="text-[#004080]" />
              </div>
              <p className="font-serif text-3xl sm:text-4xl font-bold text-[#004080]">
                {stats?.closedThisMonth ?? 0}
              </p>
            </div>
            <p className="text-xs text-[#5C6880] mt-3">
              Successfully executed titles and tenancy mandates
            </p>
          </div>
        </div>
      )}

      {/* Filter and Search Controls */}
      <div className="bg-white p-4 rounded-[8px] border border-[#DDE3EC] card-shadow space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  id={`filter-cat-${cat.toLowerCase()}`}
                  className={`px-3 py-1.5 rounded text-xs font-semibold tracking-wide transition-colors shrink-0 ${
                    isSelected
                      ? 'bg-[#E7EEF7] text-[#004080] border border-[#004080]/20'
                      : 'text-[#5C6880] hover:text-[#101828] hover:bg-[#F0F4F9]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search
              size={16}
              strokeWidth={1.75}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5C6880]"
            />
            <input
              type="text"
              id="clients-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search name, area, company..."
              className="w-full bg-white text-[#101828] text-xs pl-9 pr-3 py-2 rounded-[6px] border border-[#DDE3EC] focus:border-[#004080] focus:ring-1 focus:ring-[#004080] focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Table / Responsive Card View */}
      {loading ? (
        <TableSkeleton rows={8} />
      ) : clients.length === 0 ? (
        <div className="bg-white rounded-[8px] border border-[#DDE3EC] card-shadow p-12 text-center">
          <Briefcase size={36} strokeWidth={1.5} className="mx-auto text-[#5C6880] mb-3" />
          <h3 className="font-serif text-lg font-semibold text-[#101828]">
            No clients match your filter
          </h3>
          <p className="text-xs text-[#5C6880] max-w-md mx-auto mt-1">
            Try adjusting your search query or switching category filter tabs.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-[8px] border border-[#DDE3EC] card-shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse" id="clients-table">
                <thead>
                  <tr className="bg-[#F0F4F9] border-b border-[#DDE3EC] text-[10px] font-semibold uppercase tracking-[0.14em] text-[#004080]">
                    <th className="py-3 px-6">Client & Entity</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Stage</th>
                    <th className="py-3 px-4">Deal Status</th>
                    <th className="py-3 px-4 text-right">Deal Value</th>
                    <th className="py-3 px-4">Advisor</th>
                    <th className="py-3 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDE3EC] text-sm">
                  {clients.map((client) => {
                    const initials = client.name
                      .split(' ')
                      .map((p) => p[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase();

                    return (
                      <tr
                        key={client.id}
                        id={`client-row-${client.id}`}
                        onClick={() => navigate(`/clients/${client.id}`)}
                        className="hover:bg-[#F0F4F9] cursor-pointer transition-colors group"
                      >
                        <td className="py-3.5 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#E7EEF7] text-[#004080] font-semibold text-xs flex items-center justify-center shrink-0 border border-[#DDE3EC]">
                              {initials}
                            </div>
                            <div>
                              <p className="font-serif font-semibold text-[#101828] group-hover:text-[#004080] transition-colors">
                                {client.name}
                              </p>
                              <div className="flex items-center gap-2 text-[11px] text-[#5C6880]">
                                {client.companyName && (
                                  <span className="truncate max-w-[140px]">
                                    {client.companyName}
                                  </span>
                                )}
                                {client.companyName && <span>•</span>}
                                <span>{client.location}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <StatusPill
                            label={client.category}
                            variant={getCategoryVariant(client.category)}
                          />
                        </td>

                        <td className="py-3.5 px-4">
                          <StatusPill
                            label={getStageName(client.stageId)}
                            variant={getStageVariant(client.stageId)}
                          />
                        </td>

                        <td className="py-3.5 px-4">
                          <StatusPill
                            label={client.dealStatus}
                            variant={getDealStatusVariant(client.dealStatus)}
                          />
                        </td>

                        <td className="py-3.5 px-4 text-right font-medium text-[#101828]">
                          {formatAED(client.dealValueAED)}
                        </td>

                        <td className="py-3.5 px-4 text-xs text-[#5C6880]">
                          {client.assignedAgentName}
                        </td>

                        <td className="py-3.5 px-6 text-right">
                          <div className="inline-flex items-center justify-center p-1 rounded group-hover:bg-white text-[#5C6880] group-hover:text-[#004080] transition-colors">
                            <ChevronRight size={16} strokeWidth={1.75} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-3 border-t border-[#DDE3EC] bg-white text-xs text-[#5C6880] flex items-center justify-between">
              <span>Showing {clients.length} active client dossiers</span>
              <span className="text-[11px] font-mono uppercase text-[#004080]">
                AED Subtotal: {formatAED(clients.reduce((acc, c) => acc + c.dealValueAED, 0))}
              </span>
            </div>
          </div>

          {/* Mobile Stacked Cards View */}
          <div className="md:hidden space-y-3">
            {clients.map((client) => {
              const initials = client.name
                .split(' ')
                .map((p) => p[0])
                .slice(0, 2)
                .join('')
                .toUpperCase();

              return (
                <div
                  key={client.id}
                  onClick={() => navigate(`/clients/${client.id}`)}
                  className="bg-white rounded-[8px] border border-[#DDE3EC] card-shadow p-4 hover:bg-[#F0F4F9] transition-colors cursor-pointer space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#E7EEF7] text-[#004080] font-semibold text-xs flex items-center justify-center shrink-0 border border-[#DDE3EC]">
                        {initials}
                      </div>
                      <div>
                        <p className="font-serif font-semibold text-sm text-[#101828]">
                          {client.name}
                        </p>
                        <p className="text-[11px] text-[#5C6880]">
                          {client.location}
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={18} strokeWidth={1.75} className="text-[#5C6880]" />
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    <StatusPill
                      label={client.category}
                      variant={getCategoryVariant(client.category)}
                    />
                    <StatusPill
                      label={getStageName(client.stageId)}
                      variant={getStageVariant(client.stageId)}
                    />
                    <StatusPill
                      label={client.dealStatus}
                      variant={getDealStatusVariant(client.dealStatus)}
                    />
                  </div>

                  <div className="pt-2 border-t border-[#DDE3EC] flex items-center justify-between text-xs">
                    <span className="text-[#5C6880]">
                      Advisor: {client.assignedAgentName}
                    </span>
                    <span className="font-semibold text-[#004080]">
                      {formatFullAED(client.dealValueAED)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Add Client Modal */}
      <AddClientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        stages={stages}
        onClientAdded={(newClient) => {
          setClients((prev) => [newClient, ...prev]);
          loadData();
        }}
      />
    </div>
  );
};
