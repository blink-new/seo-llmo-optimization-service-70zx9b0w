import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Settings, 
  Key, 
  Webhook, 
  Download, 
  Upload,
  CheckCircle,
  AlertCircle,
  Clock,
  ExternalLink,
  Copy,
  RefreshCw,
  Monitor,
  TrendingUp,
  Target,
  Globe,
  Code,
  Zap
} from 'lucide-react'
import blink from '@/blink/client'

interface APIToken {
  id: string
  name: string
  website_url: string
  cms_type: string
  created_at: string
  last_used_at?: string
  is_active: boolean
}

interface ContentChange {
  id: string
  website_url: string
  page_url: string
  change_type: 'seo' | 'llmo' | 'content'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  original_content: string
  optimized_content: string
  expected_impact: string
  status: 'pending' | 'applied' | 'testing' | 'rejected'
  created_at: string
}

interface MonitoringStatus {
  website_url: string
  page_url: string
  content_updated: boolean
  recommendations_applied: boolean
  traffic_impact?: any
  citation_impact?: any
  last_checked_at: string
}

export default function CMSIntegration() {
  const [apiTokens, setApiTokens] = useState<APIToken[]>([])
  const [contentChanges, setContentChanges] = useState<ContentChange[]>([])
  const [monitoringStatus, setMonitoringStatus] = useState<MonitoringStatus[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [newTokenName, setNewTokenName] = useState('')
  const [newWebsiteUrl, setNewWebsiteUrl] = useState('')
  const [newCMSType, setNewCMSType] = useState('')
  const [webhookUrl, setWebhookUrl] = useState('')
  const [dailyMonitoringEnabled, setDailyMonitoringEnabled] = useState(true)
  const [generatedApiKey, setGeneratedApiKey] = useState('')

  useEffect(() => {
    loadAPITokens()
    loadContentChanges()
    loadMonitoringStatus()
  }, [])

  const loadAPITokens = async () => {
    // Mock data - in production, load from database
    const mockTokens: APIToken[] = [
      {
        id: 'token_001',
        name: 'WordPress Site API',
        website_url: 'https://example.com',
        cms_type: 'wordpress',
        created_at: new Date().toISOString(),
        last_used_at: new Date(Date.now() - 86400000).toISOString(),
        is_active: true
      }
    ]
    setApiTokens(mockTokens)
  }

  const loadContentChanges = async () => {
    try {
      // Mock API call - in production, call the CMS API function
      const mockChanges: ContentChange[] = [
        {
          id: 'change_001',
          website_url: 'https://example.com',
          page_url: 'https://example.com/about',
          change_type: 'seo',
          priority: 'high',
          title: 'Optimize Meta Description',
          description: 'Current meta description is too short and not compelling',
          original_content: 'About our company.',
          optimized_content: 'Discover how our innovative solutions help businesses grow faster with cutting-edge technology and expert support.',
          expected_impact: '+25% CTR improvement',
          status: 'pending',
          created_at: new Date().toISOString(),
        },
        {
          id: 'change_002',
          website_url: 'https://example.com',
          page_url: 'https://example.com/services',
          change_type: 'llmo',
          priority: 'medium',
          title: 'Add FAQ Structure',
          description: 'Content lacks question-answer format that LLMs prefer for citations',
          original_content: 'We offer various services including consulting and development.',
          optimized_content: 'What services do we offer?\n\nWe provide comprehensive consulting and development services including:\n• Strategic planning and analysis\n• Custom software development\n• Technical consulting and support',
          expected_impact: '+40% LLM citation potential',
          status: 'pending',
          created_at: new Date(Date.now() - 86400000).toISOString(),
        }
      ]
      setContentChanges(mockChanges)
    } catch (error) {
      console.error('Failed to load content changes:', error)
    }
  }

  const loadMonitoringStatus = async () => {
    try {
      // Mock monitoring data
      const mockMonitoring: MonitoringStatus[] = [
        {
          website_url: 'https://example.com',
          page_url: 'https://example.com/about',
          content_updated: true,
          recommendations_applied: false,
          traffic_impact: {
            organic_traffic_change: '+12%',
            click_through_rate: '+8%',
            average_position: 'improved by 2.3 positions'
          },
          citation_impact: {
            llm_citations: '+3 new citations',
            authority_score: '+15%',
            factual_accuracy: '98%'
          },
          last_checked_at: new Date().toISOString()
        }
      ]
      setMonitoringStatus(mockMonitoring)
    } catch (error) {
      console.error('Failed to load monitoring status:', error)
    }
  }

  const generateAPIKey = async () => {
    setIsLoading(true)
    try {
      // Generate a secure API key
      const apiKey = 'seo_' + Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
      
      setGeneratedApiKey(apiKey)
      
      // In production, save to database
      const newToken: APIToken = {
        id: Date.now().toString(),
        name: newTokenName,
        website_url: newWebsiteUrl,
        cms_type: newCMSType,
        created_at: new Date().toISOString(),
        is_active: true
      }
      
      setApiTokens(prev => [newToken, ...prev])
      setNewTokenName('')
      setNewWebsiteUrl('')
      setNewCMSType('')
    } catch (error) {
      console.error('Failed to generate API key:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // Show toast notification
  }

  const runManualCheck = async (websiteUrl: string) => {
    setIsLoading(true)
    try {
      // Call the daily monitoring function for specific website
      const response = await fetch('/api/daily-monitor/check-website', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ website_url: websiteUrl })
      })
      
      if (response.ok) {
        await loadMonitoringStatus()
      }
    } catch (error) {
      console.error('Manual check failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const exportContentChanges = () => {
    const dataStr = JSON.stringify(contentChanges, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `content-changes-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-green-100 text-green-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'seo': return <TrendingUp className="h-4 w-4" />
      case 'llmo': return <Target className="h-4 w-4" />
      default: return <Globe className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* API Integration Setup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Key className="mr-2 h-5 w-5" />
            CMS API Integration
          </CardTitle>
          <CardDescription>
            Connect your CMS to automatically receive and apply content optimizations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="setup" className="space-y-4">
            <TabsList>
              <TabsTrigger value="setup">Setup</TabsTrigger>
              <TabsTrigger value="tokens">API Tokens</TabsTrigger>
              <TabsTrigger value="webhook">Webhooks</TabsTrigger>
            </TabsList>

            <TabsContent value="setup" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="token-name">API Token Name</Label>
                    <Input
                      id="token-name"
                      placeholder="e.g., WordPress Main Site"
                      value={newTokenName}
                      onChange={(e) => setNewTokenName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="website-url">Website URL</Label>
                    <Input
                      id="website-url"
                      placeholder="https://example.com"
                      value={newWebsiteUrl}
                      onChange={(e) => setNewWebsiteUrl(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cms-type">CMS Type</Label>
                    <Select value={newCMSType} onValueChange={setNewCMSType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select CMS type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="wordpress">WordPress</SelectItem>
                        <SelectItem value="drupal">Drupal</SelectItem>
                        <SelectItem value="joomla">Joomla</SelectItem>
                        <SelectItem value="custom">Custom CMS</SelectItem>
                        <SelectItem value="static">Static Site</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    onClick={generateAPIKey}
                    disabled={isLoading || !newTokenName || !newWebsiteUrl}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Key className="mr-2 h-4 w-4" />
                        Generate API Key
                      </>
                    )}
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium mb-2">API Endpoints</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <code className="bg-white px-2 py-1 rounded text-xs">
                          GET /api/cms-api/content-changes
                        </code>
                        <p className="text-gray-600 mt-1">Get pending content optimizations</p>
                      </div>
                      <div>
                        <code className="bg-white px-2 py-1 rounded text-xs">
                          POST /api/cms-api/content-changes/apply
                        </code>
                        <p className="text-gray-600 mt-1">Apply content changes</p>
                      </div>
                      <div>
                        <code className="bg-white px-2 py-1 rounded text-xs">
                          GET /api/cms-api/monitoring-status
                        </code>
                        <p className="text-gray-600 mt-1">Get monitoring status</p>
                      </div>
                    </div>
                  </div>

                  {generatedApiKey && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-medium mb-2 flex items-center">
                        <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                        API Key Generated
                      </h4>
                      <div className="flex items-center space-x-2">
                        <code className="bg-white px-2 py-1 rounded text-xs flex-1 truncate">
                          {generatedApiKey}
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(generatedApiKey)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-green-700 mt-2">
                        Save this key securely. You won't be able to see it again.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tokens" className="space-y-4">
              {apiTokens.length === 0 ? (
                <div className="text-center py-8">
                  <Key className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600">No API tokens created yet</p>
                  <p className="text-sm text-gray-500">Create your first API token to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {apiTokens.map((token) => (
                    <Card key={token.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{token.name}</h4>
                            <p className="text-sm text-gray-600">{token.website_url}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge variant="outline">{token.cms_type}</Badge>
                              <Badge className={token.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                {token.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">
                              Created: {new Date(token.created_at).toLocaleDateString()}
                            </p>
                            {token.last_used_at && (
                              <p className="text-sm text-gray-600">
                                Last used: {new Date(token.last_used_at).toLocaleDateString()}
                              </p>
                            )}
                            <Button variant="outline" size="sm" className="mt-2">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="webhook" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="webhook-url">Webhook URL</Label>
                  <Input
                    id="webhook-url"
                    placeholder="https://your-cms.com/webhook/seo-updates"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    We'll send POST requests to this URL when content changes are ready
                  </p>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Daily Monitoring</h4>
                    <p className="text-sm text-gray-600">
                      Automatically check if recommendations were applied
                    </p>
                  </div>
                  <Switch
                    checked={dailyMonitoringEnabled}
                    onCheckedChange={setDailyMonitoringEnabled}
                  />
                </div>

                <div className="p-4 bg-gray-50 border rounded-lg">
                  <h4 className="font-medium mb-2">Webhook Payload Example</h4>
                  <pre className="text-xs bg-white p-3 rounded border overflow-x-auto">
{`{
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
}`}
                  </pre>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Content Changes API */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Download className="mr-2 h-5 w-5" />
                Available Content Changes
              </CardTitle>
              <CardDescription>
                Content optimizations ready for your CMS integration
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={exportContentChanges}>
                <Download className="mr-2 h-4 w-4" />
                Export JSON
              </Button>
              <Button variant="outline" onClick={loadContentChanges}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {contentChanges.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <p className="text-gray-600">No pending content changes</p>
              <p className="text-sm text-gray-500">Run website analysis to generate optimizations</p>
            </div>
          ) : (
            <div className="space-y-4">
              {contentChanges.map((change) => (
                <Card key={change.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {getTypeIcon(change.change_type)}
                          <h4 className="font-medium">{change.title}</h4>
                          <Badge className={getPriorityColor(change.priority)}>
                            {change.priority}
                          </Badge>
                          <Badge variant="outline">{change.change_type.toUpperCase()}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{change.description}</p>
                        <p className="text-sm text-blue-600 mb-2">
                          <ExternalLink className="inline h-3 w-3 mr-1" />
                          {change.page_url}
                        </p>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-3">
                          <div>
                            <h5 className="text-xs font-medium text-gray-500 mb-1">ORIGINAL</h5>
                            <div className="p-2 bg-red-50 border border-red-200 rounded text-sm">
                              {change.original_content}
                            </div>
                          </div>
                          <div>
                            <h5 className="text-xs font-medium text-gray-500 mb-1">OPTIMIZED</h5>
                            <div className="p-2 bg-green-50 border border-green-200 rounded text-sm">
                              {change.optimized_content}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4 text-right">
                        <Badge className="bg-blue-100 text-blue-800 mb-2">
                          {change.expected_impact}
                        </Badge>
                        <p className="text-xs text-gray-500">
                          {new Date(change.created_at).toLocaleDateString()}
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2"
                          onClick={() => copyToClipboard(JSON.stringify(change, null, 2))}
                        >
                          <Code className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Daily Monitoring Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Monitor className="mr-2 h-5 w-5" />
                Daily Monitoring Status
              </CardTitle>
              <CardDescription>
                Track whether your website implemented our recommendations
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              onClick={() => runManualCheck('https://example.com')}
              disabled={isLoading}
            >
              {isLoading ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Zap className="mr-2 h-4 w-4" />
              )}
              Run Check
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {monitoringStatus.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600">No monitoring data yet</p>
              <p className="text-sm text-gray-500">Daily checks will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {monitoringStatus.map((status, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Globe className="h-4 w-4" />
                          <h4 className="font-medium">{status.page_url}</h4>
                          <Badge className={status.content_updated ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}>
                            {status.content_updated ? 'Content Updated' : 'No Changes'}
                          </Badge>
                          <Badge className={status.recommendations_applied ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {status.recommendations_applied ? 'Recommendations Applied' : 'Pending'}
                          </Badge>
                        </div>
                        
                        {status.traffic_impact && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                            <div>
                              <h5 className="text-sm font-medium mb-2">Traffic Impact</h5>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span>Organic Traffic:</span>
                                  <span className="font-medium text-green-600">
                                    {status.traffic_impact.organic_traffic_change}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>CTR:</span>
                                  <span className="font-medium text-green-600">
                                    {status.traffic_impact.click_through_rate}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Position:</span>
                                  <span className="font-medium text-green-600">
                                    {status.traffic_impact.average_position}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {status.citation_impact && (
                              <div>
                                <h5 className="text-sm font-medium mb-2">LLM Citation Impact</h5>
                                <div className="space-y-1 text-sm">
                                  <div className="flex justify-between">
                                    <span>New Citations:</span>
                                    <span className="font-medium text-blue-600">
                                      {status.citation_impact.llm_citations}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Authority Score:</span>
                                    <span className="font-medium text-blue-600">
                                      {status.citation_impact.authority_score}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Accuracy:</span>
                                    <span className="font-medium text-blue-600">
                                      {status.citation_impact.factual_accuracy}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          Last checked: {new Date(status.last_checked_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}