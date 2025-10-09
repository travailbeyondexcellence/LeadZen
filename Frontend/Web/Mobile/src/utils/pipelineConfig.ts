export interface PipelineStage {
  id: string;
  title: string;
  color: string;
  description: string;
  dbValue: string; // Value stored in database
}

export const PIPELINE_STAGES: PipelineStage[] = [
  {
    id: 'follow_up',
    title: 'Follow up',
    color: '#F59E0B', // Amber
    description: 'New leads requiring outreach',
    dbValue: 'follow_up'
  },
  {
    id: 'warm_leads',
    title: 'Warm Leads', 
    color: '#10B981', // Emerald
    description: 'Engaged prospects showing interest',
    dbValue: 'contacted'
  },
  {
    id: 'quote',
    title: 'Quote',
    color: '#3B82F6', // Blue
    description: 'Qualified leads receiving proposals',
    dbValue: 'qualified'
  },
  {
    id: 'closed_deal',
    title: 'Closed Deal',
    color: '#8B5CF6', // Purple
    description: 'Successfully converted customers',
    dbValue: 'closed_won'
  },
  {
    id: 'not_relevant',
    title: 'Not Relevant',
    color: '#6B7280', // Gray
    description: 'Unqualified or uninterested prospects',
    dbValue: 'closed_lost'
  }
];

// Map database status values to pipeline stages
export const statusToPipelineStage = (status: string): string => {
  const mappings: Record<string, string> = {
    'new': 'follow_up',
    'follow_up': 'follow_up',
    'contacted': 'warm_leads',
    'warm': 'warm_leads',
    'qualified': 'quote',
    'proposal': 'quote',
    'negotiation': 'quote',
    'closed_won': 'closed_deal',
    'closed': 'closed_deal',
    'closed_lost': 'not_relevant',
    'not_interested': 'not_relevant',
    'unqualified': 'not_relevant'
  };
  
  return mappings[status.toLowerCase()] || 'follow_up';
};

// Map pipeline stage to database status
export const pipelineStageToStatus = (stageId: string): string => {
  const stage = PIPELINE_STAGES.find(s => s.id === stageId);
  return stage?.dbValue || 'follow_up';
};