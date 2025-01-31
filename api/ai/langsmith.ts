import { Request, Response } from 'express';
import { langsmithClient, LANGSMITH_PROJECT, ENABLE_TRACING } from '../config/langsmith';

export default async function langsmithHandler(req: Request, res: Response) {
  try {
    const { operation } = req.body;

    if (!operation) {
      return res.status(400).json({
        error: 'Operation is required',
        code: 'INVALID_REQUEST'
      });
    }

    switch (operation) {
      case 'getProject':
        const project = await langsmithClient.readProject({
          projectName: LANGSMITH_PROJECT
        });
        return res.json({ project });

      case 'trace':
        if (!ENABLE_TRACING) {
          return res.json({ success: false, message: 'Tracing is disabled' });
        }
        const { runName, runInput } = req.body;
        const run = await langsmithClient.createRun({
          name: runName,
          inputs: runInput,
          run_type: "chain",
          project_name: LANGSMITH_PROJECT
        });
        return res.json({ run });

      case 'updateRun':
        if (!ENABLE_TRACING) {
          return res.json({ success: false, message: 'Tracing is disabled' });
        }
        const { runId, update } = req.body;
        const updatedRun = await langsmithClient.updateRun(runId, update);
        return res.json({ run: updatedRun });

      default:
        return res.status(400).json({
          error: 'Invalid operation',
          code: 'INVALID_OPERATION'
        });
    }
  } catch (error) {
    console.error('LangSmith API Error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
      code: 'LANGSMITH_ERROR'
    });
  }
} 
