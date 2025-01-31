// Project name for tracing
export const LANGSMITH_PROJECT = import.meta.env.VITE_LANGSMITH_PROJECT || 'fastdesk-ai-notes'

// Enable tracing in development/staging environments
export const ENABLE_TRACING = import.meta.env.VITE_ENABLE_LANGSMITH_TRACING === 'true'

// LangSmith API client
export const langsmithClient = {
  async getProject() {
    const response = await fetch('/api/ai/langsmith', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operation: 'getProject'
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to get LangSmith project');
    }
    
    return response.json();
  },

  async createRun({ name, inputs }: { name: string; inputs: Record<string, any> }) {
    if (!ENABLE_TRACING) {
      return { success: false, message: 'Tracing is disabled' };
    }

    const response = await fetch('/api/ai/langsmith', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operation: 'trace',
        runName: name,
        runInput: inputs,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create LangSmith run');
    }
    
    return response.json();
  },

  async updateRun(runId: string, update: Record<string, any>) {
    if (!ENABLE_TRACING) {
      return { success: false, message: 'Tracing is disabled' };
    }

    const response = await fetch('/api/ai/langsmith', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operation: 'updateRun',
        runId,
        update,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update LangSmith run');
    }
    
    return response.json();
  }
}; 