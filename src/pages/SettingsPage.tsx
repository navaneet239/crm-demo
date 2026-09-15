import React, { useEffect, useState } from 'react';
import {
  Check,
  CheckCircle2,
  Edit2,
  Lock,
  Mail,
  Plus,
  Save,
  Sliders,
  Sparkles,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  addCustomField,
  getSettings,
  removeCustomField,
  updateEmailTemplate,
  updatePipelineStage,
} from '../services/settingsService';
import { addUser, deleteUser, getUsers, updateUserRole } from '../services/userService';
import {
  BrokerageSettings,
  CustomFieldDefinition,
  CustomFieldType,
  EmailTemplate,
  PipelineStage,
  Role,
  User,
} from '../types';
import { Modal } from '../components/Modal';

type SettingsTab = 'pipeline' | 'fields' | 'users' | 'email';

export const SettingsPage: React.FC = () => {
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<SettingsTab>('pipeline');
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Settings data
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [customFields, setCustomFields] = useState<CustomFieldDefinition[]>([]);
  const [emailTemplate, setEmailTemplate] = useState<EmailTemplate | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  // Editing stages state
  const [editingStageId, setEditingStageId] = useState<string | null>(null);
  const [stageNameDraft, setStageNameDraft] = useState('');

  // Custom field modal state
  const [isAddFieldModalOpen, setIsAddFieldModalOpen] = useState(false);
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState<CustomFieldType>('text');
  const [newFieldOptions, setNewFieldOptions] = useState('');
  const [newFieldPlaceholder, setNewFieldPlaceholder] = useState('');

  // Add user modal state
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<Role>('Agent');
  const [newUserTitle, setNewUserTitle] = useState('Property Consultant');

  // Email template draft
  const [emailSubjectDraft, setEmailSubjectDraft] = useState('');
  const [emailBodyDraft, setEmailBodyDraft] = useState('');

  const loadSettingsData = async () => {
    setLoading(true);
    try {
      const [settings, userList] = await Promise.all([
        getSettings(),
        getUsers(),
      ]);
      setStages(settings.pipelineStages);
      setCustomFields(settings.customFields);
      setEmailTemplate(settings.emailTemplate);
      setEmailSubjectDraft(settings.emailTemplate.subject);
      setEmailBodyDraft(settings.emailTemplate.body);
      setUsers(userList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettingsData();
  }, []);

  const notify = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Pipeline stage rename handler
  const handleSaveStageRename = async (stageId: string) => {
    if (!stageNameDraft.trim()) return;
    try {
      const updated = await updatePipelineStage(stageId, stageNameDraft.trim());
      setStages(updated);
      setEditingStageId(null);
      notify(`Pipeline stage renamed to "${stageNameDraft.trim()}".`);
    } catch (err) {
      console.error(err);
    }
  };

  // Add custom field handler
  const handleAddCustomField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldLabel.trim()) return;

    const options =
      newFieldType === 'select'
        ? newFieldOptions
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined;

    try {
      const updated = await addCustomField({
        label: newFieldLabel.trim(),
        type: newFieldType,
        options,
        placeholder: newFieldPlaceholder.trim() || undefined,
      });
      setCustomFields(updated);
      setIsAddFieldModalOpen(false);
      setNewFieldLabel('');
      setNewFieldOptions('');
      setNewFieldPlaceholder('');
      notify('Custom field added to client dossiers.');
    } catch (err) {
      console.error(err);
    }
  };

  // Remove custom field handler
  const handleRemoveCustomField = async (fieldId: string) => {
    try {
      const updated = await removeCustomField(fieldId);
      setCustomFields(updated);
      notify('Custom field removed.');
    } catch (err) {
      console.error(err);
    }
  };

  // User role update handler
  const handleUserRoleChange = async (userId: string, newRole: Role) => {
    try {
      await updateUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      notify(`User role updated to ${newRole}.`);
    } catch (err) {
      console.error(err);
    }
  };

  // Add user handler
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await addUser({
        name: newUserName.trim(),
        email: newUserEmail.trim(),
        role: newUserRole,
        title: newUserTitle.trim(),
      });
      setUsers((prev) => [...prev, created]);
      setIsAddUserModalOpen(false);
      setNewUserName('');
      setNewUserEmail('');
      notify(`User ${created.name} added to roster.`);
    } catch (err) {
      console.error(err);
    }
  };

  // Delete user handler
  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      notify('User removed from roster.');
    } catch (err) {
      console.error(err);
    }
  };

  // Save email template handler
  const handleSaveEmailTemplate = async () => {
    try {
      const updated = await updateEmailTemplate({
        subject: emailSubjectDraft,
        body: emailBodyDraft,
      });
      setEmailTemplate(updated);
      notify('Email notification template updated.');
    } catch (err) {
      console.error(err);
    }
  };

  const isAdmin = currentUser?.role === 'Admin';
  const isManager = currentUser?.role === 'Manager';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#004080]">
          Workspace Configuration
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#101828]">
          Brokerage Settings
        </h1>
        <p className="text-xs text-[#5C6880] mt-0.5">
          Customize transaction stages, client dossier fields, staff credentials,
          and client communications.
        </p>
      </div>

      {/* Floating or Banner Success Feedback */}
      {successMessage && (
        <div className="p-3 bg-[#ECFDF3] border border-[#067647]/30 rounded-[6px] text-xs font-semibold text-[#067647] flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 size={16} strokeWidth={1.75} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white rounded-[8px] border border-[#DDE3EC] card-shadow p-2 flex items-center gap-2 overflow-x-auto">
        <button
          id="tab-btn-pipeline"
          onClick={() => setActiveTab('pipeline')}
          className={`px-4 py-2 rounded-[6px] text-xs font-semibold tracking-wide transition-colors shrink-0 ${
            activeTab === 'pipeline'
              ? 'bg-[#E7EEF7] text-[#004080] border border-[#004080]/20'
              : 'text-[#5C6880] hover:text-[#101828] hover:bg-[#F0F4F9]'
          }`}
        >
          Pipeline Stages ({stages.length})
        </button>

        <button
          id="tab-btn-fields"
          onClick={() => setActiveTab('fields')}
          className={`px-4 py-2 rounded-[6px] text-xs font-semibold tracking-wide transition-colors shrink-0 ${
            activeTab === 'fields'
              ? 'bg-[#E7EEF7] text-[#004080] border border-[#004080]/20'
              : 'text-[#5C6880] hover:text-[#101828] hover:bg-[#F0F4F9]'
          }`}
        >
          Custom Client Fields ({customFields.length})
        </button>

        <button
          id="tab-btn-users"
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-[6px] text-xs font-semibold tracking-wide transition-colors shrink-0 flex items-center gap-1.5 ${
            activeTab === 'users'
              ? 'bg-[#E7EEF7] text-[#004080] border border-[#004080]/20'
              : 'text-[#5C6880] hover:text-[#101828] hover:bg-[#F0F4F9]'
          }`}
        >
          <span>Team & Roles ({users.length})</span>
          {!isAdmin && <Lock size={12} className="text-[#B54708]" />}
        </button>

        <button
          id="tab-btn-email"
          onClick={() => setActiveTab('email')}
          className={`px-4 py-2 rounded-[6px] text-xs font-semibold tracking-wide transition-colors shrink-0 ${
            activeTab === 'email'
              ? 'bg-[#E7EEF7] text-[#004080] border border-[#004080]/20'
              : 'text-[#5C6880] hover:text-[#101828] hover:bg-[#F0F4F9]'
          }`}
        >
          Email Advisory Template
        </button>
      </div>

      {/* Tab 1: Rename Pipeline Stages Inline */}
      {activeTab === 'pipeline' && (
        <div className="bg-white rounded-[8px] border border-[#DDE3EC] card-shadow p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#DDE3EC]">
            <div>
              <h3 className="font-serif text-lg font-semibold text-[#101828]">
                Rename Pipeline Stages Inline
              </h3>
              <p className="text-xs text-[#5C6880]">
                Rename any stage. Changes reflect across the Kanban board, client
                lists, and filter pills immediately.
              </p>
            </div>
          </div>

          <div className="divide-y divide-[#DDE3EC] border border-[#DDE3EC] rounded-[6px] overflow-hidden">
            {stages.map((stage, idx) => {
              const isEditing = editingStageId === stage.id;

              return (
                <div
                  key={stage.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F0F4F9] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#E7EEF7] text-[#004080] text-xs font-mono font-semibold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        autoFocus
                        value={stageNameDraft}
                        onChange={(e) => setStageNameDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveStageRename(stage.id);
                          if (e.key === 'Escape') setEditingStageId(null);
                        }}
                        className="bg-white text-xs font-semibold px-2.5 py-1.5 rounded border border-[#004080] focus:outline-hidden"
                      />
                    ) : (
                      <div>
                        <span className="font-serif font-semibold text-sm text-[#101828]">
                          {stage.name}
                        </span>
                        <span className="text-[10px] text-[#5C6880] font-mono ml-2">
                          (id: {stage.id})
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleSaveStageRename(stage.id)}
                          className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-[#004080] text-white rounded hover:bg-[#003060]"
                        >
                          <Check size={13} strokeWidth={2} />
                          <span>Save</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingStageId(null)}
                          className="px-2.5 py-1 text-xs text-[#5C6880] hover:text-[#101828]"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingStageId(stage.id);
                          setStageNameDraft(stage.name);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#004080] bg-[#E7EEF7] hover:bg-[#D4E2F3] rounded transition-colors"
                      >
                        <Edit2 size={13} strokeWidth={1.75} />
                        <span>Rename Inline</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Custom Client Fields */}
      {activeTab === 'fields' && (
        <div className="bg-white rounded-[8px] border border-[#DDE3EC] card-shadow p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#DDE3EC]">
            <div>
              <h3 className="font-serif text-lg font-semibold text-[#101828]">
                Custom Client Record Fields
              </h3>
              <p className="text-xs text-[#5C6880]">
                Add or remove dynamic fields on client dossiers. Added fields
                appear immediately in creation forms and detail views.
              </p>
            </div>

            <button
              onClick={() => setIsAddFieldModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-[#004080] text-white rounded-[6px] hover:bg-[#003060] transition-colors cursor-pointer shrink-0"
            >
              <Plus size={14} strokeWidth={1.75} />
              <span>Add Custom Field</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customFields.map((field) => (
              <div
                key={field.id}
                className="bg-[#F0F4F9] rounded-[6px] border border-[#DDE3EC] p-4 flex items-start justify-between gap-3"
              >
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#004080] block mb-1">
                    {field.type} Field
                  </span>
                  <h4 className="font-serif font-semibold text-sm text-[#101828]">
                    {field.label}
                  </h4>
                  {field.placeholder && (
                    <p className="text-xs text-[#5C6880] mt-1 italic">
                      Placeholder: "{field.placeholder}"
                    </p>
                  )}
                  {field.options && (
                    <p className="text-[11px] text-[#5C6880] mt-1">
                      Options: {field.options.join(', ')}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveCustomField(field.id)}
                  className="p-1 text-[#5C6880] hover:text-[#B42318] rounded transition-colors"
                  title="Remove custom field"
                >
                  <Trash2 size={15} strokeWidth={1.75} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: User & Role Management */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-[8px] border border-[#DDE3EC] card-shadow p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#DDE3EC]">
            <div>
              <h3 className="font-serif text-lg font-semibold text-[#101828]">
                Brokerage Staff & Permission Roles
              </h3>
              <p className="text-xs text-[#5C6880]">
                Manage team accounts. Admin has full privileges; Manager can see
                all clients; Agent is restricted to assigned accounts.
              </p>
            </div>

            {isAdmin && (
              <button
                onClick={() => setIsAddUserModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-[#004080] text-white rounded-[6px] hover:bg-[#003060] transition-colors cursor-pointer shrink-0"
              >
                <UserPlus size={14} strokeWidth={1.75} />
                <span>Add Team Member</span>
              </button>
            )}
          </div>

          {/* Enforce UI Permission: Manager can see all clients but not user management */}
          {!isAdmin ? (
            <div className="p-6 bg-[#FFFAEB] border border-[#B54708]/30 rounded-[6px] text-center space-y-2">
              <Lock size={24} strokeWidth={1.75} className="mx-auto text-[#B54708]" />
              <h4 className="font-serif text-sm font-semibold text-[#101828]">
                Administrator Authorization Required
              </h4>
              <p className="text-xs text-[#5C6880] max-w-md mx-auto">
                Your current role is <strong className="font-semibold text-[#101828]">{currentUser?.role}</strong>.
                Managers have complete read-write visibility across the client portfolio and pipeline, but staff roster management and role changes are restricted exclusively to Principal Administrators.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F0F4F9] border-b border-[#DDE3EC] text-[10px] font-semibold uppercase tracking-[0.14em] text-[#004080]">
                    <th className="py-2.5 px-4">User</th>
                    <th className="py-2.5 px-3">Title / Position</th>
                    <th className="py-2.5 px-3">Email</th>
                    <th className="py-2.5 px-3">Assigned Role</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDE3EC]">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-[#F0F4F9]">
                      <td className="py-3 px-4 font-semibold text-[#101828] flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#E7EEF7] text-[#004080] font-semibold text-[11px] flex items-center justify-center">
                          {u.avatarInitial}
                        </div>
                        <span>{u.name}</span>
                      </td>
                      <td className="py-3 px-3 text-[#5C6880]">
                        {u.title || 'Advisor'}
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-[#004080]">
                        {u.email}
                      </td>
                      <td className="py-3 px-3">
                        <select
                          value={u.role}
                          onChange={(e) =>
                            handleUserRoleChange(u.id, e.target.value as Role)
                          }
                          className="text-xs font-semibold bg-white text-[#004080] border border-[#DDE3EC] rounded px-2 py-1 focus:outline-hidden"
                        >
                          <option value="Admin">Admin</option>
                          <option value="Manager">Manager</option>
                          <option value="Agent">Agent</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {users.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(u.id)}
                            className="p-1 text-[#5C6880] hover:text-[#B42318] rounded transition-colors"
                            title="Delete user"
                          >
                            <Trash2 size={15} strokeWidth={1.75} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Edit Email Template */}
      {activeTab === 'email' && (
        <div className="bg-white rounded-[8px] border border-[#DDE3EC] card-shadow p-6 space-y-6">
          <div className="pb-4 border-b border-[#DDE3EC]">
            <h3 className="font-serif text-lg font-semibold text-[#101828]">
              Client Engagement & Portal Invitation Template
            </h3>
            <p className="text-xs text-[#5C6880]">
              Personalized transaction updates sent to buyers and investors.
              Dynamic variables inside brackets will be parsed automatically.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#004080] mb-1">
                  Email Subject Line
                </label>
                <input
                  type="text"
                  value={emailSubjectDraft}
                  onChange={(e) => setEmailSubjectDraft(e.target.value)}
                  className="w-full bg-white text-xs px-3 py-2 rounded-[6px] border border-[#DDE3EC] focus:border-[#004080] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#004080] mb-1">
                  Email Message Body
                </label>
                <textarea
                  rows={10}
                  value={emailBodyDraft}
                  onChange={(e) => setEmailBodyDraft(e.target.value)}
                  className="w-full bg-white text-xs p-3 font-sans rounded-[6px] border border-[#DDE3EC] focus:border-[#004080] focus:outline-hidden leading-relaxed"
                />
              </div>

              <div className="p-3 bg-[#F0F4F9] rounded-[6px] border border-[#DDE3EC] text-[11px] text-[#5C6880] space-y-1">
                <span className="font-semibold text-[#004080] block text-[10px] uppercase tracking-wider">
                  Available Merge Tokens:
                </span>
                <p className="font-mono text-[10px] text-[#004080]">
                  {'{{Client_Name}}'} • {'{{Stage_Name}}'} • {'{{Deal_Value}}'} •{' '}
                  {'{{Location}}'} • {'{{Agent_Name}}'}
                </p>
              </div>

              <button
                type="button"
                onClick={handleSaveEmailTemplate}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#004080] text-white rounded-[6px] hover:bg-[#003060] transition-colors cursor-pointer"
              >
                <Save size={14} strokeWidth={1.75} />
                <span>Save Template Changes</span>
              </button>
            </div>

            {/* Live Preview Panel */}
            <div className="bg-[#F0F4F9] rounded-[8px] border border-[#DDE3EC] p-5 space-y-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#004080] block">
                Live Dynamic Preview (Sample Dossier)
              </span>

              <div className="bg-white rounded-[6px] border border-[#DDE3EC] card-shadow p-4 space-y-3 text-xs">
                <div className="border-b border-[#DDE3EC] pb-2 text-[11px]">
                  <span className="text-[#5C6880]">Subject: </span>
                  <span className="font-semibold text-[#101828]">
                    {emailSubjectDraft}
                  </span>
                </div>

                <div className="whitespace-pre-wrap text-xs text-[#101828] leading-relaxed font-sans">
                  {emailBodyDraft
                    .replace(/{{Client_Name}}/g, 'Tariq Al-Hashimi')
                    .replace(/{{Stage_Name}}/g, 'Negotiation')
                    .replace(/{{Deal_Value}}/g, '14,500,000')
                    .replace(/{{Location}}/g, 'Downtown Dubai')
                    .replace(/{{Agent_Name}}/g, 'Farhan Malik')}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Field Modal */}
      <Modal
        isOpen={isAddFieldModalOpen}
        onClose={() => setIsAddFieldModalOpen(false)}
        title="Add Custom Dossier Field"
      >
        <form onSubmit={handleAddCustomField} className="space-y-4 text-xs">
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#004080] mb-1">
              Field Label *
            </label>
            <input
              type="text"
              required
              value={newFieldLabel}
              onChange={(e) => setNewFieldLabel(e.target.value)}
              placeholder="e.g. Developer Escrow Account No."
              className="w-full bg-white text-xs px-3 py-2 rounded-[6px] border border-[#DDE3EC] focus:border-[#004080] focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#004080] mb-1">
                Data Type
              </label>
              <select
                value={newFieldType}
                onChange={(e) =>
                  setNewFieldType(e.target.value as CustomFieldType)
                }
                className="w-full bg-white text-xs px-3 py-2 rounded-[6px] border border-[#DDE3EC] focus:border-[#004080] focus:outline-hidden"
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="select">Dropdown Select</option>
                <option value="date">Date</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#004080] mb-1">
                Placeholder
              </label>
              <input
                type="text"
                value={newFieldPlaceholder}
                onChange={(e) => setNewFieldPlaceholder(e.target.value)}
                placeholder="e.g. Enter reference"
                className="w-full bg-white text-xs px-3 py-2 rounded-[6px] border border-[#DDE3EC] focus:border-[#004080] focus:outline-hidden"
              />
            </div>
          </div>

          {newFieldType === 'select' && (
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#004080] mb-1">
                Comma-separated Options
              </label>
              <input
                type="text"
                value={newFieldOptions}
                onChange={(e) => setNewFieldOptions(e.target.value)}
                placeholder="Option 1, Option 2, Option 3"
                className="w-full bg-white text-xs px-3 py-2 rounded-[6px] border border-[#DDE3EC] focus:border-[#004080] focus:outline-hidden"
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-[#DDE3EC]">
            <button
              type="button"
              onClick={() => setIsAddFieldModalOpen(false)}
              className="px-4 py-2 text-xs text-[#5C6880]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold bg-[#004080] text-white rounded-[6px]"
            >
              Add Field
            </button>
          </div>
        </form>
      </Modal>

      {/* Add User Modal */}
      <Modal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        title="Register New Brokerage User"
      >
        <form onSubmit={handleAddUser} className="space-y-4 text-xs">
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#004080] mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              placeholder="e.g. Maya Al-Saleh"
              className="w-full bg-white text-xs px-3 py-2 rounded-[6px] border border-[#DDE3EC] focus:border-[#004080] focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#004080] mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              placeholder="maya@brokerage.ae"
              className="w-full bg-white text-xs px-3 py-2 rounded-[6px] border border-[#DDE3EC] focus:border-[#004080] focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#004080] mb-1">
                Role
              </label>
              <select
                value={newUserRole}
                onChange={(e) => setNewUserRole(e.target.value as Role)}
                className="w-full bg-white text-xs px-3 py-2 rounded-[6px] border border-[#DDE3EC] focus:border-[#004080] focus:outline-hidden"
              >
                <option value="Agent">Agent</option>
                <option value="Manager">Manager</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#004080] mb-1">
                Title
              </label>
              <input
                type="text"
                value={newUserTitle}
                onChange={(e) => setNewUserTitle(e.target.value)}
                placeholder="Senior Advisor"
                className="w-full bg-white text-xs px-3 py-2 rounded-[6px] border border-[#DDE3EC] focus:border-[#004080] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#DDE3EC]">
            <button
              type="button"
              onClick={() => setIsAddUserModalOpen(false)}
              className="px-4 py-2 text-xs text-[#5C6880]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold bg-[#004080] text-white rounded-[6px]"
            >
              Add User
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
