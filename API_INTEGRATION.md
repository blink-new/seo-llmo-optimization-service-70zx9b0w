# CMS API Integration Guide

## Overview

The SEO & LLMO Optimization Service provides a comprehensive API for CMS integration, allowing you to automatically receive and apply content optimizations to your website.

## Features

### 1. Content Changes API
- **Endpoint**: `GET /api/cms-api/content-changes`
- **Purpose**: Retrieve pending content optimizations for your website
- **Authentication**: API Key required in `X-API-Key` header

#### Parameters:
- `website_url` (optional): Filter changes for specific website
- `status` (optional): Filter by status (`pending`, `applied`, `testing`, `rejected`)
- `limit` (optional): Maximum number of results (default: 50)

#### Response Format:
```json
{
  "success": true,
  "data": [
    {
      "id": "change_001",
      "website_url": "https://example.com",
      "page_url": "https://example.com/about",
      "change_type": "seo",
      "priority": "high",
      "title": "Optimize Meta Description",
      "description": "Current meta description is too short",
      "original_content": "About our company.",
      "optimized_content": "Discover how our innovative solutions...",
      "expected_impact": "+25% CTR improvement",
      "status": "pending",
      "created_at": "2024-01-20T10:30:00Z"
    }
  ],
  "total": 1
}
```

### 2. Apply Changes API
- **Endpoint**: `POST /api/cms-api/content-changes/apply`
- **Purpose**: Mark content changes as applied or start A/B testing

#### Request Body:
```json
{
  "change_id": "change_001",
  "confirm_apply": true
}
```

#### Response:
```json
{
  "success": true,
  "change_id": "change_001",
  "status": "applied",
  "applied_at": "2024-01-20T10:35:00Z",
  "message": "Content change applied successfully"
}
```

### 3. Monitoring Status API
- **Endpoint**: `GET /api/cms-api/monitoring-status`
- **Purpose**: Check if recommendations were implemented and their impact

#### Parameters:
- `website_url` (optional): Filter monitoring data for specific website

#### Response:
```json
{
  "success": true,
  "data": [
    {
      "website_url": "https://example.com",
      "page_url": "https://example.com/about",
      "content_updated": true,
      "recommendations_applied": false,
      "traffic_impact": {
        "organic_traffic_change": "+12%",
        "click_through_rate": "+8%",
        "average_position": "improved by 2.3 positions"
      },
      "citation_impact": {
        "llm_citations": "+3 new citations",
        "authority_score": "+15%",
        "factual_accuracy": "98%"
      },
      "last_checked_at": "2024-01-20T10:30:00Z"
    }
  ]
}
```

### 4. Webhook Integration
- **Endpoint**: `POST /api/cms-api/webhook`
- **Purpose**: Receive real-time notifications when optimizations are ready

#### Webhook Payload:
```json
{
  "event": "content_optimization_ready",
  "website_url": "https://example.com",
  "changes": [
    {
      "page_url": "https://example.com/about",
      "type": "seo",
      "priority": "high",
      "title": "Optimize Meta Description",
      "original_content": "About our company.",
      "optimized_content": "Discover how our...",
      "expected_impact": "+25% CTR improvement"
    }
  ],
  "timestamp": "2024-01-20T10:30:00Z"
}
```

## Daily Monitoring

### Automatic Checks
The system performs daily checks to:
1. **Content Change Detection**: Monitor if your website content has been updated
2. **Recommendation Tracking**: Check if our optimization suggestions were implemented
3. **Impact Analysis**: Measure traffic and LLM citation improvements
4. **Performance Reporting**: Generate impact reports for applied changes

### Manual Monitoring
- **Endpoint**: `POST /api/daily-monitor/check-website`
- **Purpose**: Trigger immediate monitoring check for specific website

#### Request:
```json
{
  "website_url": "https://example.com",
  "user_id": "your-user-id"
}
```

## Authentication

### API Key Generation
1. Navigate to the CMS Integration section in your dashboard
2. Fill in your website details and CMS type
3. Click "Generate API Key"
4. Copy and securely store the generated key

### Using API Keys
Include your API key in all requests:
```bash
curl -H "X-API-Key: your-api-key-here" \
     "https://your-domain.com/api/cms-api/content-changes"
```

## Integration Examples

### WordPress Plugin Integration
```php
<?php
// WordPress plugin example
function fetch_seo_optimizations() {
    $api_key = get_option('seo_llmo_api_key');
    $website_url = get_site_url();
    
    $response = wp_remote_get(
        "https://your-domain.com/api/cms-api/content-changes?website_url=" . urlencode($website_url),
        array(
            'headers' => array(
                'X-API-Key' => $api_key
            )
        )
    );
    
    if (!is_wp_error($response)) {
        $data = json_decode(wp_remote_retrieve_body($response), true);
        return $data['data'];
    }
    
    return false;
}
```

### Custom CMS Integration
```javascript
// JavaScript example for custom CMS
async function getContentOptimizations() {
    const apiKey = 'your-api-key';
    const websiteUrl = 'https://example.com';
    
    try {
        const response = await fetch(
            `https://your-domain.com/api/cms-api/content-changes?website_url=${encodeURIComponent(websiteUrl)}`,
            {
                headers: {
                    'X-API-Key': apiKey
                }
            }
        );
        
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('Failed to fetch optimizations:', error);
        return [];
    }
}
```

## Best Practices

### 1. Security
- Store API keys securely (environment variables, encrypted storage)
- Use HTTPS for all API calls
- Rotate API keys regularly
- Implement rate limiting on your end

### 2. Error Handling
- Always check response status codes
- Implement retry logic for failed requests
- Log errors for debugging
- Provide fallback behavior

### 3. Performance
- Cache API responses when appropriate
- Use webhooks instead of polling when possible
- Implement request timeouts
- Monitor API usage and limits

### 4. Content Application
- Review optimizations before applying automatically
- Test changes in staging environment first
- Keep backups of original content
- Monitor performance after applying changes

## Support

For technical support or questions about the API integration:
- Email: support@your-domain.com
- Documentation: https://your-domain.com/docs
- Status Page: https://status.your-domain.com

## Rate Limits

- **Content Changes API**: 100 requests per hour
- **Monitoring API**: 50 requests per hour
- **Apply Changes API**: 20 requests per hour
- **Webhook**: No limit (incoming only)

## Changelog

### v1.0.0 (2024-01-20)
- Initial API release
- Content changes endpoint
- Monitoring status endpoint
- Webhook support
- Daily monitoring system