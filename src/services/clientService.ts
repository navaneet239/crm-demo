// BACKEND: replace this implementation with a real API/database call. Signature stays the same.

import {
  clone,
  initialClients,
} from '../data/mockData';
import {
  Client,
  ClientFilters,
  ClientStats,
  PipelineStageId,
  User,
} from '../types';

function delay(ms?: number): Promise<void> {
  const duration = ms ?? Math.floor(200 + Math.random() * 200);
  return new Promise((resolve) => setTimeout(resolve, duration));
}

// In-memory persistent store for clients
let clientsStore: Client[] = clone(initialClients);

export async function getClients(
  filters?: ClientFilters,
  currentUser?: User
): Promise<Client[]> {
  await delay();

  let result = clone(clientsStore);

  // Role-based visibility enforcement:
  // Agent sees ONLY their own assigned clients
  // Admin and Manager can view all clients
  if (currentUser && currentUser.role === 'Agent') {
    result = result.filter(
      (c) => c.assignedAgentId === currentUser.id || c.assignedAgentName.toLowerCase().includes(currentUser.name.toLowerCase())
    );
  }

  if (filters?.assignedAgentId) {
    result = result.filter((c) => c.assignedAgentId === filters.assignedAgentId);
  }

  if (filters?.category && filters.category !== 'All') {
    result = result.filter((c) => c.category === filters.category);
  }

  if (filters?.stageId && filters.stageId !== 'All') {
    result = result.filter((c) => c.stageId === filters.stageId);
  }

  if (filters?.search && filters.search.trim()) {
    const q = filters.search.toLowerCase().trim();
    result = result.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.companyName && c.companyName.toLowerCase().includes(q)) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.location.toLowerCase().includes(q) ||
        c.assignedAgentName.toLowerCase().includes(q)
    );
  }

  return result;
}

export async function getClientById(id: string): Promise<Client | null> {
  await delay();
  const client = clientsStore.find((c) => c.id === id);
  return client ? clone(client) : null;
}

export async function createClient(
  clientData: Omit<Client, 'id' | 'dateJoined' | 'financials' | 'meetings' | 'documents'> & {
    financials?: Client['financials'];
    meetings?: Client['meetings'];
    documents?: Client['documents'];
  }
): Promise<Client> {
  await delay();

  const newClient: Client = {
    ...clientData,
    id: `cli-${Date.now().toString(36)}`,
    dateJoined: new Date().toISOString().split('T')[0],
    financials: clientData.financials ?? [],
    meetings: clientData.meetings ?? [],
    documents: clientData.documents ?? [
      {
        id: `d-${Date.now()}`,
        name: 'KYC_Verification_Checklist.pdf',
        type: 'PDF',
        size: '640 KB',
        uploadedDate: new Date().toISOString().split('T')[0],
        status: 'Verified',
      },
    ],
  };

  clientsStore.unshift(newClient);
  return clone(newClient);
}

export async function updateClient(
  id: string,
  updates: Partial<Client>
): Promise<Client> {
  await delay();

  const index = clientsStore.findIndex((c) => c.id === id);
  if (index === -1) {
    throw new Error(`Client with ID ${id} not found.`);
  }

  clientsStore[index] = {
    ...clientsStore[index],
    ...updates,
  };

  return clone(clientsStore[index]);
}

export async function updateClientStage(
  id: string,
  stageId: PipelineStageId
): Promise<Client> {
  await delay();

  const index = clientsStore.findIndex((c) => c.id === id);
  if (index === -1) {
    throw new Error(`Client with ID ${id} not found.`);
  }

  const dealStatus = stageId === 'closed' ? 'Won' : clientsStore[index].dealStatus === 'Won' ? 'Active' : clientsStore[index].dealStatus;

  clientsStore[index] = {
    ...clientsStore[index],
    stageId,
    dealStatus,
  };

  return clone(clientsStore[index]);
}

export async function deleteClient(id: string): Promise<boolean> {
  await delay();

  const initialLength = clientsStore.length;
  clientsStore = clientsStore.filter((c) => c.id !== id);
  return clientsStore.length < initialLength;
}

export async function getClientStats(currentUser?: User): Promise<ClientStats> {
  await delay();

  let targetClients = clone(clientsStore);
  if (currentUser && currentUser.role === 'Agent') {
    targetClients = targetClients.filter(
      (c) => c.assignedAgentId === currentUser.id || c.assignedAgentName.toLowerCase().includes(currentUser.name.toLowerCase())
    );
  }

  const totalClients = targetClients.length;
  const activeDeals = targetClients.filter(
    (c) => c.dealStatus === 'Active' || c.dealStatus === 'Under Offer'
  ).length;

  // Closed deals
  const closedThisMonth = targetClients.filter(
    (c) => c.stageId === 'closed' || c.dealStatus === 'Won'
  ).length;

  const totalPipelineAED = targetClients.reduce(
    (acc, curr) => acc + (curr.dealValueAED || 0),
    0
  );

  return {
    totalClients,
    activeDeals,
    closedThisMonth,
    totalPipelineAED,
  };
}

export async function exportClientsCsv(
  filters?: ClientFilters,
  currentUser?: User
): Promise<string> {
  const clients = await getClients(filters, currentUser);

  const headers = [
    'Client ID',
    'Full Name',
    'Company',
    'Category',
    'Stage',
    'Deal Status',
    'Deal Value (AED)',
    'Assigned Agent',
    'Location',
    'Email',
    'Phone',
    'Date Joined',
  ];

  const rows = clients.map((c) => [
    `"${c.id}"`,
    `"${c.name}"`,
    `"${c.companyName || ''}"`,
    `"${c.category}"`,
    `"${c.stageId}"`,
    `"${c.dealStatus}"`,
    `"${c.dealValueAED}"`,
    `"${c.assignedAgentName}"`,
    `"${c.location}"`,
    `"${c.email}"`,
    `"${c.phone}"`,
    `"${c.dateJoined}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}
