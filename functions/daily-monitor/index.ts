import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

interface MonitoringTarget {
  id: string;
  userId: string;
  websiteUrl: string;
  pageUrl: string;
  lastContentHash: string;
  recommendations: ContentRecommendation[];
  checkFrequency: 'daily' | 'weekly' | 'monthly';
  lastChecked: string;
}

interface ContentRecommendation {
  id: string;
  type: 'seo' | 'llmo' | 'content';
  originalContent: string;
  recommendedContent: string;
  applied: boolean;
}

interface MonitoringResult {
  targetId: string;
  websiteUrl: string;
  pageUrl: string;
  contentChanged: boolean;
  recommendationsImplemented: boolean;
  newContentHash: string;
  changesDetected: string[];
  implementedRecommendations: string[];
  checkTimestamp: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname;

    if (path === '/monitor' && req.method === 'POST') {
      return await runDailyMonitoring(req);
    } else if (path === '/schedule' && req.method === 'POST') {
      return await scheduleMonitoring(req);
    } else if (path === '/status' && req.method === 'GET') {
      return await getMonitoringStatus(req);
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
    console.error('Monitoring Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
});

async function runDailyMonitoring(req: Request): Promise<Response> {
  console.log('Starting daily monitoring check...');
  
  // In production, this would fetch from database
  const mockTargets: MonitoringTarget[] = [
    {
      id: 'target_001',
      userId: 'user_123',
      websiteUrl: 'https://example.com',
      pageUrl: 'https://example.com/about',
      lastContentHash: 'abc123def456',
      recommendations: [
        {
          id: 'rec_001',
          type: 'seo',
          originalContent: 'About us page',
          recommendedContent: 'Learn about our company\'s mission, values, and expert team',
          applied: false
        }
      ],
      checkFrequency: 'daily',
      lastChecked: new Date(Date.now() - 86400000).toISOString()
    }
  ];

  const results: MonitoringResult[] = [];

  for (const target of mockTargets) {
    try {
      const result = await checkWebsiteChanges(target);
      results.push(result);
      
      // Send notification if recommendations were implemented
      if (result.recommendationsImplemented) {
        await sendImplementationNotification(target, result);
      }
      
      // Send alert if content changed without implementing recommendations
      if (result.contentChanged && !result.recommendationsImplemented) {
        await sendContentChangeAlert(target, result);
      }
      
    } catch (error) {
      console.error(`Failed to monitor ${target.pageUrl}:`, error);
      results.push({
        targetId: target.id,
        websiteUrl: target.websiteUrl,
        pageUrl: target.pageUrl,
        contentChanged: false,
        recommendationsImplemented: false,
        newContentHash: target.lastContentHash,
        changesDetected: [`Error: ${error.message}`],
        implementedRecommendations: [],
        checkTimestamp: new Date().toISOString()
      });
    }
  }

  // Schedule next monitoring run
  await scheduleNextRun();

  return new Response(JSON.stringify({
    success: true,
    message: 'Daily monitoring completed',
    results,
    summary: {
      totalChecked: results.length,
      contentChanges: results.filter(r => r.contentChanged).length,
      recommendationsImplemented: results.filter(r => r.recommendationsImplemented).length,
    },
    timestamp: new Date().toISOString()
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

async function checkWebsiteChanges(target: MonitoringTarget): Promise<MonitoringResult> {
  console.log(`Checking ${target.pageUrl}...`);
  
  try {
    // Mock scraping for demonstration - in production, use actual scraping
    const metadata = {
      title: 'Sample Page Title',
      description: 'Sample page description'
    };
    const markdown = 'Sample page content for monitoring demonstration';
    
    // Generate content hash
    const currentContentHash = await generateContentHash(metadata, markdown);
    
    // Check if content changed
    const contentChanged = currentContentHash !== target.lastContentHash;
    
    // Check if recommendations were implemented
    const implementedRecommendations: string[] = [];
    let recommendationsImplemented = false;
    
    if (contentChanged) {
      for (const recommendation of target.recommendations) {
        if (await isRecommendationImplemented(markdown, recommendation)) {
          implementedRecommendations.push(recommendation.id);
          recommendationsImplemented = true;
        }
      }
    }
    
    // Detect specific changes
    const changesDetected: string[] = [];
    if (contentChanged) {
      changesDetected.push('Content hash changed');
      
      // More specific change detection could be added here
      if (metadata?.title !== target.lastContentHash) {
        changesDetected.push('Title tag modified');
      }
      if (metadata?.description !== target.lastContentHash) {
        changesDetected.push('Meta description modified');
      }
    }

    return {
      targetId: target.id,
      websiteUrl: target.websiteUrl,
      pageUrl: target.pageUrl,
      contentChanged,
      recommendationsImplemented,
      newContentHash: currentContentHash,
      changesDetected,
      implementedRecommendations,
      checkTimestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error(`Error checking ${target.pageUrl}:`, error);
    throw error;
  }
}

async function generateContentHash(metadata: any, content: string): Promise<string> {
  const combinedContent = JSON.stringify(metadata) + content;
  const encoder = new TextEncoder();
  const data = encoder.encode(combinedContent);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function isRecommendationImplemented(content: string, recommendation: ContentRecommendation): Promise<boolean> {
  // Simple implementation - check if recommended content appears in the page
  const normalizedContent = content.toLowerCase().replace(/\s+/g, ' ');
  const normalizedRecommendation = recommendation.recommendedContent.toLowerCase().replace(/\s+/g, ' ');
  
  // Check for partial matches (at least 70% of the recommended content)
  const words = normalizedRecommendation.split(' ');
  const matchedWords = words.filter(word => normalizedContent.includes(word));
  const matchPercentage = matchedWords.length / words.length;
  
  return matchPercentage >= 0.7;
}

async function sendImplementationNotification(target: MonitoringTarget, result: MonitoringResult): Promise<void> {
  console.log(`✅ Recommendations implemented on ${target.pageUrl}`);
  
  // In production, this would send email/webhook notification
  const notification = {
    type: 'recommendation_implemented',
    websiteUrl: target.websiteUrl,
    pageUrl: target.pageUrl,
    implementedRecommendations: result.implementedRecommendations,
    timestamp: result.checkTimestamp,
    message: `Great news! Your SEO/LLMO recommendations have been implemented on ${target.pageUrl}`
  };
  
  // Mock notification sending
  console.log('Notification sent:', notification);
}

async function sendContentChangeAlert(target: MonitoringTarget, result: MonitoringResult): Promise<void> {
  console.log(`⚠️ Content changed without implementing recommendations on ${target.pageUrl}`);
  
  // In production, this would send email/webhook notification
  const alert = {
    type: 'content_change_alert',
    websiteUrl: target.websiteUrl,
    pageUrl: target.pageUrl,
    changesDetected: result.changesDetected,
    missedRecommendations: target.recommendations.filter(r => !r.applied).length,
    timestamp: result.checkTimestamp,
    message: `Content was updated on ${target.pageUrl} but SEO/LLMO recommendations were not implemented. Consider applying the pending optimizations.`
  };
  
  // Mock alert sending
  console.log('Alert sent:', alert);
}

async function scheduleNextRun(): Promise<void> {
  // In production, this would schedule the next monitoring run
  // For now, just log the next scheduled time
  const nextRun = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
  console.log(`Next monitoring run scheduled for: ${nextRun.toISOString()}`);
}

async function scheduleMonitoring(req: Request): Promise<Response> {
  const body = await req.json();
  
  const { websiteUrl, pageUrls, frequency = 'daily' } = body;
  
  if (!websiteUrl || !pageUrls || !Array.isArray(pageUrls)) {
    return new Response(JSON.stringify({ error: 'websiteUrl and pageUrls array are required' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  // Create monitoring targets
  const targets = pageUrls.map((pageUrl: string, index: number) => ({
    id: `target_${Date.now()}_${index}`,
    websiteUrl,
    pageUrl,
    frequency,
    createdAt: new Date().toISOString(),
    nextCheck: new Date(Date.now() + getFrequencyMs(frequency)).toISOString()
  }));

  return new Response(JSON.stringify({
    success: true,
    message: 'Monitoring scheduled successfully',
    targets,
    nextCheck: targets[0]?.nextCheck
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

async function getMonitoringStatus(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const websiteUrl = url.searchParams.get('website_url');
  
  // Mock status data
  const status = {
    totalTargets: 5,
    activeMonitoring: 5,
    lastCheck: new Date().toISOString(),
    nextCheck: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    recentActivity: [
      {
        pageUrl: 'https://example.com/about',
        action: 'Content changed',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        recommendationsImplemented: true
      },
      {
        pageUrl: 'https://example.com/services',
        action: 'Monitoring check completed',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        recommendationsImplemented: false
      }
    ]
  };

  return new Response(JSON.stringify({
    success: true,
    data: status,
    timestamp: new Date().toISOString()
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

function getFrequencyMs(frequency: string): number {
  switch (frequency) {
    case 'daily':
      return 24 * 60 * 60 * 1000;
    case 'weekly':
      return 7 * 24 * 60 * 60 * 1000;
    case 'monthly':
      return 30 * 24 * 60 * 60 * 1000;
    default:
      return 24 * 60 * 60 * 1000;
  }
}