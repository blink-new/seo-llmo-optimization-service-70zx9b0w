import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

interface ContentChange {
  id: string;
  websiteUrl: string;
  pageUrl: string;
  changeType: 'seo' | 'llmo' | 'content';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  originalContent: string;
  optimizedContent: string;
  expectedImpact: string;
  status: 'pending' | 'applied' | 'testing' | 'rejected';
  createdAt: string;
  appliedAt?: string;
}

interface MonitoringResult {
  websiteUrl: string;
  pageUrl: string;
  lastChecked: string;
  contentChanged: boolean;
  recommendationsImplemented: boolean;
  changesDetected: string[];
  nextCheckDate: string;
}

serve(async (req) => {
  // Handle CORS for frontend calls
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
      },
    });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname;
    
    // Extract API key from headers
    const apiKey = req.headers.get('X-API-Key') || req.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key required' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Route handling
    if (path === '/content-changes' && req.method === 'GET') {
      return await getContentChanges(req, apiKey);
    } else if (path === '/content-changes' && req.method === 'POST') {
      return await createContentChange(req, apiKey);
    } else if (path === '/monitoring-status' && req.method === 'GET') {
      return await getMonitoringStatus(req, apiKey);
    } else if (path === '/export-changes' && req.method === 'GET') {
      return await exportChanges(req, apiKey);
    } else if (path === '/webhook' && req.method === 'POST') {
      return await handleWebhook(req, apiKey);
    } else {
      return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
});

async function getContentChanges(req: Request, apiKey: string): Promise<Response> {
  const url = new URL(req.url);
  const websiteUrl = url.searchParams.get('website_url');
  const status = url.searchParams.get('status');
  const format = url.searchParams.get('format') || 'json';
  
  // Mock data for demonstration - in production, this would query the database
  const mockChanges: ContentChange[] = [
    {
      id: 'change_001',
      websiteUrl: websiteUrl || 'https://example.com',
      pageUrl: 'https://example.com/about',
      changeType: 'seo',
      priority: 'high',
      title: 'Optimize Meta Description',
      description: 'Current meta description is too short and not compelling',
      originalContent: 'About us page',
      optimizedContent: 'Learn about our company\'s mission, values, and the expert team dedicated to delivering innovative solutions for your business needs.',
      expectedImpact: '+25% CTR improvement',
      status: 'pending',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'change_002',
      websiteUrl: websiteUrl || 'https://example.com',
      pageUrl: 'https://example.com/services',
      changeType: 'llmo',
      priority: 'medium',
      title: 'Add FAQ Section',
      description: 'Add structured FAQ content to improve LLM citation potential',
      originalContent: 'Our services include web development and design.',
      optimizedContent: 'What services do we offer?\n\nWe provide comprehensive web development and design services, including:\n• Custom website development\n• Responsive design\n• E-commerce solutions\n• SEO optimization\n\nHow long does a typical project take?\n\nMost projects are completed within 4-8 weeks, depending on complexity and requirements.',
      expectedImpact: '+40% LLM citation potential',
      status: 'applied',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      appliedAt: new Date().toISOString(),
    }
  ];

  // Filter by status if provided
  let filteredChanges = mockChanges;
  if (status) {
    filteredChanges = mockChanges.filter(change => change.status === status);
  }

  // Return in requested format
  if (format === 'csv') {
    const csv = convertToCSV(filteredChanges);
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="content-changes.csv"',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } else if (format === 'xml') {
    const xml = convertToXML(filteredChanges);
    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  return new Response(JSON.stringify({
    success: true,
    data: filteredChanges,
    total: filteredChanges.length,
    timestamp: new Date().toISOString()
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

async function createContentChange(req: Request, apiKey: string): Promise<Response> {
  const body = await req.json();
  
  // Validate required fields
  const requiredFields = ['websiteUrl', 'pageUrl', 'changeType', 'title', 'originalContent', 'optimizedContent'];
  for (const field of requiredFields) {
    if (!body[field]) {
      return new Response(JSON.stringify({ error: `Missing required field: ${field}` }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  }

  const newChange: ContentChange = {
    id: `change_${Date.now()}`,
    websiteUrl: body.websiteUrl,
    pageUrl: body.pageUrl,
    changeType: body.changeType,
    priority: body.priority || 'medium',
    title: body.title,
    description: body.description || '',
    originalContent: body.originalContent,
    optimizedContent: body.optimizedContent,
    expectedImpact: body.expectedImpact || 'Improvement expected',
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  // In production, save to database here
  console.log('Created new content change:', newChange);

  return new Response(JSON.stringify({
    success: true,
    data: newChange,
    message: 'Content change created successfully'
  }), {
    status: 201,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

async function getMonitoringStatus(req: Request, apiKey: string): Promise<Response> {
  const url = new URL(req.url);
  const websiteUrl = url.searchParams.get('website_url');
  
  // Mock monitoring data
  const mockMonitoring: MonitoringResult[] = [
    {
      websiteUrl: websiteUrl || 'https://example.com',
      pageUrl: 'https://example.com/about',
      lastChecked: new Date().toISOString(),
      contentChanged: false,
      recommendationsImplemented: true,
      changesDetected: [],
      nextCheckDate: new Date(Date.now() + 86400000).toISOString(),
    },
    {
      websiteUrl: websiteUrl || 'https://example.com',
      pageUrl: 'https://example.com/services',
      lastChecked: new Date(Date.now() - 3600000).toISOString(),
      contentChanged: true,
      recommendationsImplemented: false,
      changesDetected: ['Meta description updated', 'New content section added'],
      nextCheckDate: new Date(Date.now() + 82800000).toISOString(),
    }
  ];

  return new Response(JSON.stringify({
    success: true,
    data: mockMonitoring,
    summary: {
      totalPages: mockMonitoring.length,
      pagesWithChanges: mockMonitoring.filter(m => m.contentChanged).length,
      recommendationsImplemented: mockMonitoring.filter(m => m.recommendationsImplemented).length,
    },
    timestamp: new Date().toISOString()
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

async function exportChanges(req: Request, apiKey: string): Promise<Response> {
  const url = new URL(req.url);
  const format = url.searchParams.get('format') || 'json';
  const websiteUrl = url.searchParams.get('website_url');
  
  // Get content changes (reuse the logic)
  const mockChanges: ContentChange[] = [
    {
      id: 'change_001',
      websiteUrl: websiteUrl || 'https://example.com',
      pageUrl: 'https://example.com/about',
      changeType: 'seo',
      priority: 'high',
      title: 'Optimize Meta Description',
      description: 'Current meta description is too short and not compelling',
      originalContent: 'About us page',
      optimizedContent: 'Learn about our company\'s mission, values, and the expert team dedicated to delivering innovative solutions for your business needs.',
      expectedImpact: '+25% CTR improvement',
      status: 'pending',
      createdAt: new Date().toISOString(),
    }
  ];

  if (format === 'wordpress') {
    // WordPress-specific format
    const wpFormat = {
      posts: mockChanges.map(change => ({
        post_title: change.title,
        post_content: change.optimizedContent,
        post_excerpt: change.description,
        meta_description: change.changeType === 'seo' ? change.optimizedContent : '',
        custom_fields: {
          seo_optimization_type: change.changeType,
          optimization_priority: change.priority,
          expected_impact: change.expectedImpact,
          original_content: change.originalContent,
        }
      }))
    };
    
    return new Response(JSON.stringify(wpFormat), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="wordpress-import.json"',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } else if (format === 'drupal') {
    // Drupal-specific format
    const drupalFormat = {
      nodes: mockChanges.map(change => ({
        type: 'page',
        title: change.title,
        body: {
          value: change.optimizedContent,
          format: 'full_html'
        },
        field_meta_description: change.changeType === 'seo' ? change.optimizedContent : '',
        field_optimization_data: {
          type: change.changeType,
          priority: change.priority,
          impact: change.expectedImpact,
        }
      }))
    };
    
    return new Response(JSON.stringify(drupalFormat), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="drupal-import.json"',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  // Default JSON format
  return new Response(JSON.stringify({
    success: true,
    data: mockChanges,
    export_format: format,
    timestamp: new Date().toISOString()
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="content-changes-export.json"',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

async function handleWebhook(req: Request, apiKey: string): Promise<Response> {
  const body = await req.json();
  
  // Handle webhook notifications from CMS systems
  console.log('Webhook received:', body);
  
  // Process the webhook data
  const response = {
    success: true,
    message: 'Webhook processed successfully',
    received_at: new Date().toISOString(),
    data: body
  };

  return new Response(JSON.stringify(response), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

function convertToCSV(changes: ContentChange[]): string {
  const headers = ['ID', 'Website URL', 'Page URL', 'Type', 'Priority', 'Title', 'Description', 'Original Content', 'Optimized Content', 'Expected Impact', 'Status', 'Created At'];
  
  const rows = changes.map(change => [
    change.id,
    change.websiteUrl,
    change.pageUrl,
    change.changeType,
    change.priority,
    change.title,
    change.description,
    change.originalContent.replace(/"/g, '""'),
    change.optimizedContent.replace(/"/g, '""'),
    change.expectedImpact,
    change.status,
    change.createdAt
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');

  return csvContent;
}

function convertToXML(changes: ContentChange[]): string {
  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<content_changes>
${changes.map(change => `
  <change>
    <id>${change.id}</id>
    <website_url>${change.websiteUrl}</website_url>
    <page_url>${change.pageUrl}</page_url>
    <type>${change.changeType}</type>
    <priority>${change.priority}</priority>
    <title><![CDATA[${change.title}]]></title>
    <description><![CDATA[${change.description}]]></description>
    <original_content><![CDATA[${change.originalContent}]]></original_content>
    <optimized_content><![CDATA[${change.optimizedContent}]]></optimized_content>
    <expected_impact>${change.expectedImpact}</expected_impact>
    <status>${change.status}</status>
    <created_at>${change.createdAt}</created_at>
  </change>`).join('')}
</content_changes>`;

  return xmlContent;
}