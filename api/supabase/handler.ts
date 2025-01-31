import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { Database } from '@/types/database';

type Tables = Database['public']['Tables'];
type TableNames = keyof Tables;

interface ApiQuery {
  filter?: Record<string, any>;
  order?: {
    column: string;
    ascending?: boolean;
  };
  limit?: number;
  offset?: number;
  columns?: string;
}

interface ApiRequest {
  operation: 'select' | 'insert' | 'update' | 'delete';
  table: TableNames;
  query?: ApiQuery;
  data?: any;
}

export default async function supabaseHandler(req: Request, res: Response) {
  try {
    const { operation, table, query = {}, data } = req.body as ApiRequest;

    if (!operation || !table) {
      return res.status(400).json({
        error: 'Operation and table are required',
        code: 'INVALID_REQUEST'
      });
    }

    // Get the user's session from the request headers
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        error: 'Authorization header is required',
        code: 'UNAUTHORIZED'
      });
    }

    // Verify the session with Supabase
    const { data: session, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return res.status(401).json({
        error: 'Invalid session',
        code: 'UNAUTHORIZED'
      });
    }

    const { filter, order, limit, offset, columns = '*' } = query;
    let result;

    switch (operation) {
      case 'select': {
        let selectBuilder = supabase.from(table).select(columns);

        // Apply filters if provided
        if (filter) {
          Object.entries(filter).forEach(([column, value]) => {
            if (value && typeof value === 'object') {
              if ('in' in value && Array.isArray(value.in)) {
                selectBuilder = selectBuilder.in(column, value.in);
              } else if ('not_in' in value && Array.isArray(value.not_in)) {
                selectBuilder = selectBuilder.not(column, 'in', value.not_in);
              } else if ('gte' in value) {
                selectBuilder = selectBuilder.gte(column, value.gte);
              } else if ('lte' in value) {
                selectBuilder = selectBuilder.lte(column, value.lte);
              } else if ('gt' in value) {
                selectBuilder = selectBuilder.gt(column, value.gt);
              } else if ('lt' in value) {
                selectBuilder = selectBuilder.lt(column, value.lt);
              } else if ('like' in value) {
                selectBuilder = selectBuilder.like(column, value.like);
              } else if ('ilike' in value) {
                selectBuilder = selectBuilder.ilike(column, value.ilike);
              } else if ('is' in value) {
                selectBuilder = selectBuilder.is(column, value.is);
              }
            } else {
              selectBuilder = selectBuilder.eq(column, value);
            }
          });
        }

        // Apply ordering if provided
        if (order) {
          const { column, ascending = true } = order;
          selectBuilder = selectBuilder.order(column, { ascending });
        }

        // Apply pagination if provided
        if (limit) selectBuilder = selectBuilder.limit(limit);
        if (offset) selectBuilder = selectBuilder.range(offset, offset + (limit || 20) - 1);

        const { data: selectResult, error: selectError } = await selectBuilder;
        if (selectError) throw selectError;
        result = selectResult;
        break;
      }

      case 'insert': {
        const { data: insertResult, error: insertError } = await supabase
          .from(table)
          .insert(data)
          .select();
        if (insertError) throw insertError;
        result = insertResult;
        break;
      }

      case 'update': {
        let updateBuilder = supabase.from(table).update(data);
        if (filter) {
          Object.entries(filter).forEach(([column, value]) => {
            updateBuilder = updateBuilder.eq(column, value);
          });
        }
        const { data: updateResult, error: updateError } = await updateBuilder.select();
        if (updateError) throw updateError;
        result = updateResult;
        break;
      }

      case 'delete': {
        let deleteBuilder = supabase.from(table).delete();
        if (filter) {
          Object.entries(filter).forEach(([column, value]) => {
            deleteBuilder = deleteBuilder.eq(column, value);
          });
        }
        const { data: deleteResult, error: deleteError } = await deleteBuilder.select();
        if (deleteError) throw deleteError;
        result = deleteResult;
        break;
      }

      default:
        return res.status(400).json({
          error: 'Invalid operation',
          code: 'INVALID_OPERATION'
        });
    }

    return res.json({ data: result });

  } catch (error) {
    console.error('Supabase API Error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
      code: 'SUPABASE_ERROR'
    });
  }
} 