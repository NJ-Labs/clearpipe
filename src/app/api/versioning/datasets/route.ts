import { NextRequest, NextResponse } from 'next/server';
import { connectionsRepository, secretsRepository } from '@/lib/db/repositories';

interface ClearMLDataset {
  id: string;
  name: string;
  project: string;
  projectName?: string; // Human-readable project name
  version?: string;
  tags?: string[];
  createdAt?: string;
  fileCount?: number;
  totalSize?: number;
  status?: string;
}

interface ClearMLCredentials {
  apiHost: string;
  webHost: string;
  filesHost: string;
  accessKey: string;
  secretKey: string;
}

// Resolve a secret by ID
async function resolveSecret(secretId: string | undefined): Promise<string> {
  if (!secretId) return '';
  const secret = await secretsRepository.getById(secretId);
  return secret?.value || '';
}

// Get credentials from connection or direct credentials
async function getCredentials(
  connectionId?: string,
  directCredentials?: {
    clearmlApiHost?: string;
    clearmlWebHost?: string;
    clearmlFilesHost?: string;
    clearmlAccessKey?: string;
    clearmlSecretKey?: string;
  }
): Promise<ClearMLCredentials | null> {
  if (connectionId) {
    try {
      console.log('Fetching credentials for connection:', connectionId);
      
      const connection = await connectionsRepository.getById(connectionId);
      
      if (!connection) {
        console.error('Connection not found:', connectionId);
        return null;
      }
      
      console.log('Connection found:', { 
        id: connection.id, 
        name: connection.name,
        provider: connection.provider,
      });
      
      const config = JSON.parse(connection.config);
      console.log('Connection config:', {
        apiHost: config.apiHost,
        accessKeySecretId: config.accessKeySecretId,
        secretKeySecretId: config.secretKeySecretId,
      });
      
      // Resolve secrets directly
      const accessKey = await resolveSecret(config.accessKeySecretId);
      const secretKey = await resolveSecret(config.secretKeySecretId);
      
      console.log('Resolved secrets:', {
        hasAccessKey: !!accessKey,
        accessKeyLength: accessKey?.length,
        hasSecretKey: !!secretKey,
        secretKeyLength: secretKey?.length,
      });
      
      return {
        apiHost: config.apiHost || 'https://api.clear.ml',
        webHost: config.webHost || 'https://app.clear.ml',
        filesHost: config.filesHost || 'https://files.clear.ml',
        accessKey,
        secretKey,
      };
    } catch (error) {
      console.error('Error fetching connection credentials:', error);
      return null;
    }
  }
  
  if (directCredentials) {
    return {
      apiHost: directCredentials.clearmlApiHost || 'https://api.clear.ml',
      webHost: directCredentials.clearmlWebHost || 'https://app.clear.ml',
      filesHost: directCredentials.clearmlFilesHost || 'https://files.clear.ml',
      accessKey: directCredentials.clearmlAccessKey || '',
      secretKey: directCredentials.clearmlSecretKey || '',
    };
  }
  
  return null;
}

// Call ClearML API with proper token-based authentication
async function callClearMLApi(
  credentials: ClearMLCredentials,
  endpoint: string,
  method: 'GET' | 'POST' = 'POST',
  body?: Record<string, unknown>
): Promise<any> {
  const url = `${credentials.apiHost}/${endpoint}`;
  
  // Debug logging
  console.log('ClearML API Call:', {
    url,
    apiHost: credentials.apiHost,
    hasAccessKey: !!credentials.accessKey,
    accessKeyLength: credentials.accessKey?.length,
    hasSecretKey: !!credentials.secretKey,
    secretKeyLength: credentials.secretKey?.length,
  });
  
  // ClearML API authentication requires two steps:
  // 1. Call auth.login with Basic Auth to get a token
  // 2. Use Bearer token for subsequent API calls
  const basicAuth = Buffer.from(`${credentials.accessKey}:${credentials.secretKey}`).toString('base64');
  
  console.log('Authenticating with ClearML (auth.login)...');
  
  // Step 1: Get auth token
  const authResponse = await fetch(`${credentials.apiHost}/auth.login`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${basicAuth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  });
  
  if (!authResponse.ok) {
    const errorText = await authResponse.text();
    console.error('ClearML auth error:', authResponse.status, errorText);
    throw new Error(`ClearML auth error: ${authResponse.status} - ${errorText}`);
  }
  
  const authData = await authResponse.json();
  const token = authData.data?.token;
  
  if (!token) {
    console.error('ClearML auth response missing token:', JSON.stringify(authData));
    throw new Error('Failed to get authentication token from ClearML');
  }
  
  console.log('ClearML auth successful, making API call to:', endpoint);
  
  // Step 2: Make the actual API call with Bearer token
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
  
  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('ClearML API error:', response.status, errorText);
    throw new Error(`ClearML API error: ${response.status} - ${errorText}`);
  }
  
  return response.json();
}

// List datasets from ClearML
// ClearML stores datasets as tasks with system_tags: ["dataset"]
// Returns only the latest version per dataset (grouped by project and name)
async function listDatasets(credentials: ClearMLCredentials): Promise<ClearMLDataset[]> {
  try {
    // ClearML datasets are stored as tasks with the "dataset" system tag
    const result = await callClearMLApi(credentials, 'tasks.get_all', 'POST', {
      system_tags: ['dataset'],
      only_fields: [
        'id', 
        'name', 
        'project', 
        'tags', 
        'system_tags',
        'created', 
        'status',
        'runtime.ds_file_count', 
        'runtime.ds_total_size',
        'runtime.version',
        'hyperparams.properties.version'
      ],
      page: 0,
      page_size: 500, // Fetch more to ensure we get all versions for grouping
    });
    
    if (!result.data?.tasks) {
      return [];
    }
    
    // Also fetch project names to replace project IDs
    const projectIds = [...new Set(result.data.tasks.map((task: any) => task.project).filter(Boolean))];
    let projectNameMap: Record<string, string> = {};
    
    if (projectIds.length > 0) {
      try {
        const projectsResult = await callClearMLApi(credentials, 'projects.get_all', 'POST', {
          id: projectIds,
          only_fields: ['id', 'name'],
        });
        if (projectsResult.data?.projects) {
          projectNameMap = projectsResult.data.projects.reduce((acc: Record<string, string>, p: any) => {
            acc[p.id] = p.name;
            return acc;
          }, {});
        }
      } catch (err) {
        console.warn('Failed to fetch project names, using IDs instead:', err);
      }
    }
    
    // Map all tasks to our format
    const allDatasets = result.data.tasks.map((task: any) => ({
      id: task.id,
      name: task.name,
      project: task.project || 'Unknown',
      projectName: projectNameMap[task.project] || task.project || 'Unknown',
      version: task.hyperparams?.properties?.version?.value || task.runtime?.version || '',
      tags: task.tags || [],
      createdAt: task.created,
      fileCount: task.runtime?.ds_file_count,
      totalSize: task.runtime?.ds_total_size,
      status: task.status,
    }));
    
    // Group by project + name and keep only the latest version
    const datasetMap = new Map<string, ClearMLDataset>();
    
    for (const dataset of allDatasets) {
      const key = `${dataset.project}::${dataset.name}`;
      const existing = datasetMap.get(key);
      
      if (!existing) {
        datasetMap.set(key, dataset);
      } else {
        // Compare by createdAt to keep the latest version
        const existingDate = existing.createdAt ? new Date(existing.createdAt).getTime() : 0;
        const currentDate = dataset.createdAt ? new Date(dataset.createdAt).getTime() : 0;
        
        if (currentDate > existingDate) {
          datasetMap.set(key, dataset);
        }
      }
    }
    
    // Return deduplicated datasets, sorted by project name then dataset name
    return Array.from(datasetMap.values()).sort((a, b) => {
      const projectCompare = ((a as any).projectName || a.project).localeCompare((b as any).projectName || b.project);
      if (projectCompare !== 0) return projectCompare;
      return a.name.localeCompare(b.name);
    });
  } catch (error) {
    console.error('Error listing ClearML datasets:', error);
    throw error;
  }
}

// POST /api/versioning/datasets - List or manage ClearML datasets
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, connectionId, credentials: directCredentials } = body;
    
    // Get credentials
    const credentials = await getCredentials(connectionId, directCredentials);
    
    if (!credentials) {
      return NextResponse.json(
        { error: 'No credentials provided. Configure a ClearML connection or provide credentials.' },
        { status: 400 }
      );
    }
    
    if (!credentials.accessKey || !credentials.secretKey) {
      return NextResponse.json(
        { error: 'ClearML access key and secret key are required.' },
        { status: 400 }
      );
    }
    
    switch (action) {
      case 'list': {
        const datasets = await listDatasets(credentials);
        return NextResponse.json({ datasets });
      }
      
      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in versioning/datasets API:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
