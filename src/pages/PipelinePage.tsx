import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  ChevronRight,
  GripVertical,
  Layers,
  MoveRight,
  Search,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getClients, updateClientStage } from '../services/clientService';
import { getPipelineStages } from '../services/settingsService';
import { Client, PipelineStage } from '../types';
import { formatAED, formatFullAED } from '../utils/formatters';
import { getCategoryVariant, StatusPill } from '../components/StatusPill';
import { KanbanSkeleton } from '../components/Skeleton';

export const PipelinePage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [draggedClientId, setDraggedClientId] = useState<string | null>(null);
  const [dragOverStageId, setDragOverStageId] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [updatingStage, setUpdatingStage] = useState<string | null>(null);

  const loadPipeline = async () => {
    setLoading(true);
    try {
      const [allStages, allClients] = await Promise.all([
        getPipelineStages(),
        getClients(undefined, currentUser || undefined),
      ]);
      setStages(allStages);
      setClients(allClients);
    } catch (err) {
      console.error('Failed to load pipeline', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPipeline();
  }, [currentUser]);

  // Drag and Drop handlers using HTML5 Drag and Drop API
  const handleDragStart = (e: React.DragEvent, clientId: string) => {
    e.dataTransfer.setData('text/plain', clientId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedClientId(clientId);
  };

  const handleDragEnd = () => {
    setDraggedClientId(null);
    setDragOverStageId(null);
  };

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverStageId !== stageId) {
      setDragOverStageId(stageId);
    }
  };

  const handleDragLeave = (stageId: string) => {
    if (dragOverStageId === stageId) {
      setDragOverStageId(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetStageId: string) => {
    e.preventDefault();
    setDragOverStageId(null);

    const clientId = e.dataTransfer.getData('text/plain') || draggedClientId;
    if (!clientId) return;

    const currentClient = clients.find((c) => c.id === clientId);
    if (!currentClient || currentClient.stageId === targetStageId) {
      setDraggedClientId(null);
      return;
    }

    // Optimistic UI update
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId ? { ...c, stageId: targetStageId } : c
      )
    );
    setDraggedClientId(null);
    setUpdatingStage(clientId);

    try {
      // Persist through the service layer
      await updateClientStage(clientId, targetStageId);
    } catch (err) {
      console.error('Failed to update stage via service', err);
      // Revert on failure
      loadPipeline();
    } finally {
      setUpdatingStage(null);
    }
  };

  // Direct move handler (accessible fallback for touch / buttons)
  const handleMoveStage = async (clientId: string, targetStageId: string) => {
    setUpdatingStage(clientId);
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId ? { ...c, stageId: targetStageId } : c
      )
    );
    try {
      await updateClientStage(clientId, targetStageId);
    } catch (err) {
      console.error(err);
      loadPipeline();
    } finally {
      setUpdatingStage(null);
    }
  };

  const filteredClients = clients.filter((c) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.companyName && c.companyName.toLowerCase().includes(q)) ||
      c.location.toLowerCase().includes(q)
    );
  });

  const totalValue = clients.reduce((acc, c) => acc + (c.dealValueAED || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header with Title and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#004080]">
            Transaction Workflow
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#101828]">
            Deal Pipeline
          </h1>
          <p className="text-xs text-[#5C6880] mt-0.5">
            Total active transactions: {clients.length} deals • Pipeline Value:{' '}
            <span className="font-semibold text-[#004080]">
              {formatAED(totalValue)}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search
              size={15}
              strokeWidth={1.75}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5C6880]"
            />
            <input
              type="text"
              id="pipeline-search-input"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter deals by client or area..."
              className="w-full bg-white text-[#101828] text-xs pl-8 pr-3 py-1.5 rounded-[6px] border border-[#DDE3EC] focus:border-[#004080] focus:ring-1 focus:ring-[#004080] focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      {loading ? (
        <KanbanSkeleton />
      ) : (
        <div
          id="kanban-board-container"
          className="flex items-start gap-4 overflow-x-auto pb-6 pt-1 select-none"
          style={{ minHeight: 'calc(100vh - 240px)' }}
        >
          {stages.map((stage) => {
            const stageClients = filteredClients.filter(
              (c) => c.stageId === stage.id
            );
            const stageTotalAED = stageClients.reduce(
              (sum, c) => sum + (c.dealValueAED || 0),
              0
            );
            const isDragOver = dragOverStageId === stage.id;

            return (
              <div
                key={stage.id}
                id={`kanban-col-${stage.id}`}
                onDragOver={(e) => handleDragOver(e, stage.id)}
                onDragLeave={() => handleDragLeave(stage.id)}
                onDrop={(e) => handleDrop(e, stage.id)}
                className={`w-72 shrink-0 rounded-[8px] border transition-colors flex flex-col ${
                  isDragOver
                    ? 'bg-[#E7EEF7] border-[#004080] ring-2 ring-[#004080]/30'
                    : 'bg-[#F0F4F9] border-[#DDE3EC]'
                }`}
              >
                {/* Column Header */}
                <div className="p-3.5 border-b border-[#DDE3EC] bg-white rounded-t-[7px] flex items-center justify-between">
                  <div>
                    <h3 className="font-serif font-semibold text-sm text-[#101828]">
                      {stage.name}
                    </h3>
                    <span className="text-[10px] text-[#5C6880] font-mono">
                      {formatAED(stageTotalAED)}
                    </span>
                  </div>

                  <span
                    id={`count-${stage.id}`}
                    className="w-6 h-6 rounded-full bg-[#E7EEF7] text-[#004080] text-xs font-semibold flex items-center justify-center border border-[#004080]/20"
                  >
                    {stageClients.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="p-2.5 space-y-2.5 flex-1 min-h-[380px] overflow-y-auto">
                  {stageClients.length === 0 ? (
                    <div className="h-28 rounded-[6px] border border-dashed border-[#DDE3EC] flex flex-col items-center justify-center p-3 text-center text-[#5C6880]">
                      <span className="text-xs">No active dossiers</span>
                      <span className="text-[10px] text-[#5C6880]/80">
                        Drag deals here
                      </span>
                    </div>
                  ) : (
                    stageClients.map((client) => {
                      const isBeingDragged = draggedClientId === client.id;
                      const isUpdating = updatingStage === client.id;

                      return (
                        <div
                          key={client.id}
                          id={`kanban-card-${client.id}`}
                          draggable
                          onDragStart={(e) => handleDragStart(e, client.id)}
                          onDragEnd={handleDragEnd}
                          onClick={() => navigate(`/clients/${client.id}`)}
                          className={`bg-white rounded-[8px] border border-[#DDE3EC] card-shadow p-3.5 transition-all cursor-grab active:cursor-grabbing hover:border-[#004080]/50 hover:shadow-md relative group ${
                            isBeingDragged ? 'opacity-40 scale-95' : 'opacity-100'
                          } ${isUpdating ? 'animate-pulse' : ''}`}
                        >
                          {/* Client Header in Card */}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className="font-serif font-semibold text-sm text-[#101828] group-hover:text-[#004080] transition-colors leading-snug">
                              {client.name}
                            </h4>
                            <GripVertical
                              size={14}
                              strokeWidth={1.75}
                              className="text-[#DDE3EC] group-hover:text-[#5C6880] shrink-0 mt-0.5"
                            />
                          </div>

                          {/* Location & Entity */}
                          <p className="text-[11px] text-[#5C6880] mb-2.5 line-clamp-1">
                            {client.companyName ? `${client.companyName} • ` : ''}
                            {client.location}
                          </p>

                          {/* Category pill & Deal Value */}
                          <div className="pt-2 border-t border-[#DDE3EC] flex items-center justify-between">
                            <StatusPill
                              label={client.category}
                              variant={getCategoryVariant(client.category)}
                            />
                            <span className="font-semibold text-xs text-[#004080]">
                              {formatFullAED(client.dealValueAED)}
                            </span>
                          </div>

                          {/* Quick Stage Mover (For accessible touch / fast jump) */}
                          <div
                            className="mt-2.5 pt-2 border-t border-[#DDE3EC]/70 flex items-center justify-between text-[11px] text-[#5C6880]"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="text-[10px] uppercase font-semibold text-[#5C6880]">
                              Stage:
                            </span>
                            <select
                              value={client.stageId}
                              onChange={(e) =>
                                handleMoveStage(client.id, e.target.value)
                              }
                              className="text-[11px] text-[#004080] font-medium bg-[#F0F4F9] hover:bg-[#E7EEF7] border border-[#DDE3EC] rounded px-1.5 py-0.5 focus:outline-hidden"
                            >
                              {stages.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
