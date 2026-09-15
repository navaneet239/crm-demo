// BACKEND: replace this implementation with a real API/database call. Signature stays the same.

import {
  clone,
  initialCustomFields,
  initialEmailTemplate,
  initialPipelineStages,
} from '../data/mockData';
import {
  BrokerageSettings,
  CustomFieldDefinition,
  EmailTemplate,
  PipelineStage,
} from '../types';

function delay(ms?: number): Promise<void> {
  const duration = ms ?? Math.floor(200 + Math.random() * 200);
  return new Promise((resolve) => setTimeout(resolve, duration));
}

// In-memory persistent store for settings
let pipelineStagesStore: PipelineStage[] = clone(initialPipelineStages);
let customFieldsStore: CustomFieldDefinition[] = clone(initialCustomFields);
let emailTemplateStore: EmailTemplate = clone(initialEmailTemplate);

export async function getSettings(): Promise<BrokerageSettings> {
  await delay();
  return {
    pipelineStages: clone(pipelineStagesStore),
    customFields: clone(customFieldsStore),
    emailTemplate: clone(emailTemplateStore),
  };
}

export async function getPipelineStages(): Promise<PipelineStage[]> {
  await delay();
  return clone(pipelineStagesStore);
}

export async function updatePipelineStage(
  stageId: string,
  newName: string
): Promise<PipelineStage[]> {
  await delay();

  const stage = pipelineStagesStore.find((s) => s.id === stageId);
  if (stage) {
    stage.name = newName.trim();
  }
  return clone(pipelineStagesStore);
}

export async function getCustomFields(): Promise<CustomFieldDefinition[]> {
  await delay();
  return clone(customFieldsStore);
}

export async function addCustomField(
  fieldData: Omit<CustomFieldDefinition, 'id'>
): Promise<CustomFieldDefinition[]> {
  await delay();

  const id = `cf-${fieldData.label.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString(36)}`;
  const newField: CustomFieldDefinition = {
    ...fieldData,
    id,
  };

  customFieldsStore.push(newField);
  return clone(customFieldsStore);
}

export async function removeCustomField(
  fieldId: string
): Promise<CustomFieldDefinition[]> {
  await delay();

  customFieldsStore = customFieldsStore.filter((f) => f.id !== fieldId);
  return clone(customFieldsStore);
}

export async function getEmailTemplate(): Promise<EmailTemplate> {
  await delay();
  return clone(emailTemplateStore);
}

export async function updateEmailTemplate(
  updates: Partial<EmailTemplate>
): Promise<EmailTemplate> {
  await delay();

  emailTemplateStore = {
    ...emailTemplateStore,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  return clone(emailTemplateStore);
}
