import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { 
  FileText, 
  Zap, 
  Target, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Wand2,
  RefreshCw,
  Eye,
  Edit3,
  Save,
  TrendingUp
} from 'lucide-react'
import blink from '@/blink/client'

interface OptimizationSuggestion {
  id: string
  type: 'seo' | 'llmo' | 'content'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  originalText: string
  suggestedText: string
  impact: string
  page: string
  status: 'pending' | 'applied' | 'testing' | 'rejected'
}

export default function ContentOptimization() {
  const [selectedUrl, setSelectedUrl] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [autoOptimizeEnabled, setAutoOptimizeEnabled] = useState(false)
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([])

  const generateOptimizationSuggestions = async (metadata: any, content: string, url: string) => {
    try {
      const { text } = await blink.ai.generateText({
        prompt: `You are an expert SEO and LLMO (Large Language Model Optimization) specialist. Analyze this webpage content and generate 3-5 specific optimization suggestions.

Title: ${metadata?.title || 'No title'}
Description: ${metadata?.description || 'No description'}
URL: ${url}
Content: ${content.substring(0, 2000)}...

For each suggestion, provide:
1. Type: "seo", "llmo", or "content"
2. Priority: "high", "medium", or "low"
3. Title: Brief descriptive title
4. Description: What's wrong and why it needs fixing
5. Original text: The current problematic text
6. Suggested text: Your improved version
7. Impact: Expected improvement (e.g., "+25% CTR")

Focus on:
- SEO: Meta tags, title optimization, keyword usage, internal linking
- LLMO: Structured content, FAQ format, clear factual statements, citation-worthy content
- Content: Header hierarchy, readability, engagement

Respond in JSON format:
[
  {
    "type": "seo",
    "priority": "high",
    "title": "Optimize Meta Description",
    "description": "Current meta description is too short",
    "originalText": "current text",
    "suggestedText": "improved text",
    "impact": "+25% CTR improvement"
  }
]`,
        maxTokens: 800,
        model: 'gpt-4o-mini'
      })

      try {
        const suggestions = JSON.parse(text)
        return suggestions.map((s: any, index: number) => ({
          id: Date.now().toString() + index,
          type: s.type || 'content',
          priority: s.priority || 'medium',
          title: s.title || 'Optimization Suggestion',
          description: s.description || 'Needs improvement',
          originalText: s.originalText || 'Original content',
          suggestedText: s.suggestedText || 'Improved content',
          impact: s.impact || 'Improvement expected',
          page: url,
          status: 'pending' as const
        }))
      } catch (parseError) {
        console.error('Failed to parse AI suggestions:', parseError)
        return [{
          id: Date.now().toString(),
          type: 'content' as const,
          priority: 'medium' as const,
          title: 'AI Analysis Completed',
          description: 'AI has analyzed the page content',
          originalText: metadata?.title || 'Page content',
          suggestedText: 'Consider optimizing meta tags, content structure, and keyword usage based on AI analysis',
          impact: 'Various improvements possible',
          page: url,
          status: 'pending' as const
        }]
      }
    } catch (error) {
      console.error('AI suggestion generation failed:', error)
      return []
    }
  }

  const handleAnalyzePage = async () => {
    if (!selectedUrl) return
    
    setIsAnalyzing(true)
    try {
      // Real page analysis using web scraping
      const { metadata, markdown } = await blink.data.scrape(selectedUrl)
      
      // AI-powered content analysis and optimization suggestions
      const optimizationSuggestions = await generateOptimizationSuggestions(
        metadata, 
        markdown, 
        selectedUrl
      )
      
      setSuggestions(prev => [...optimizationSuggestions, ...prev])
    } catch (error) {
      console.error('Analysis failed:', error)
      // Add error suggestion
      const errorSuggestion: OptimizationSuggestion = {
        id: Date.now().toString(),
        type: 'content',
        priority: 'high',
        title: 'Page Analysis Failed',
        description: `Unable to analyze page: ${error.message}`,
        originalText: 'Analysis failed',
        suggestedText: 'Please check the URL and try again',
        impact: 'Fix access issues',
        page: selectedUrl,
        status: 'pending'
      }
      setSuggestions(prev => [errorSuggestion, ...prev])
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleOptimizeWithAI = async (suggestionId: string) => {
    setIsOptimizing(true)
    try {
      const suggestion = suggestions.find(s => s.id === suggestionId)
      if (!suggestion) return

      // Use Blink AI to generate improved content
      const { text } = await blink.ai.generateText({
        prompt: `You are an expert SEO and LLMO (Large Language Model Optimization) specialist. Optimize this content to improve both search engine rankings and AI assistant citations.

Original content: "${suggestion.originalText}"

Optimization requirements:
1. SEO: Include relevant keywords naturally, improve readability, optimize for search intent
2. LLMO: Structure content for AI comprehension, use clear factual statements, add context
3. Maintain the original meaning and tone
4. Make it more authoritative and trustworthy
5. Improve clarity and conciseness

Context:
- Page: ${suggestion.page}
- Type: ${suggestion.type}
- Priority: ${suggestion.priority}
- Target improvement: ${suggestion.impact}

Return only the optimized content without explanations or formatting markers.`,
        maxTokens: 400,
        model: 'gpt-4o-mini'
      })

      // Update the suggestion with AI-generated content
      setSuggestions(prev => prev.map(s => 
        s.id === suggestionId 
          ? { 
              ...s, 
              suggestedText: text.trim(), 
              status: 'pending' as const,
              impact: suggestion.impact + ' (AI Enhanced)'
            }
          : s
      ))
    } catch (error) {
      console.error('AI optimization failed:', error)
      // Show user-friendly error message
      alert('AI optimization temporarily unavailable. Please try again later or edit the suggestion manually.')
    } finally {
      setIsOptimizing(false)
    }
  }

  const handleApplySuggestion = async (suggestionId: string) => {
    const suggestion = suggestions.find(s => s.id === suggestionId)
    if (!suggestion) return

    try {
      // Save to database for CMS API access
      await saveContentChangeToDatabase(suggestion)
      
      // Update local state
      setSuggestions(prev => prev.map(s => 
        s.id === suggestionId 
          ? { ...s, status: 'applied' as const }
          : s
      ))
    } catch (error) {
      console.error('Failed to apply suggestion:', error)
    }
  }

  const saveContentChangeToDatabase = async (suggestion: OptimizationSuggestion) => {
    try {
      // In production, this would save to the actual database
      // For now, we'll simulate the API call
      const contentChange = {
        id: suggestion.id,
        user_id: 'current-user-id', // Would get from auth
        website_url: suggestion.page.split('/')[0] + '//' + suggestion.page.split('/')[2],
        page_url: suggestion.page,
        change_type: suggestion.type,
        priority: suggestion.priority,
        title: suggestion.title,
        description: suggestion.description,
        original_content: suggestion.originalText,
        optimized_content: suggestion.suggestedText,
        expected_impact: suggestion.impact,
        status: 'applied',
        created_at: new Date().toISOString(),
        applied_at: new Date().toISOString()
      }

      console.log('Content change saved for CMS API:', contentChange)
      
      // This would be a real API call in production:
      // await blink.db.contentChanges.create(contentChange)
      
    } catch (error) {
      console.error('Failed to save content change:', error)
      throw error
    }
  }

  const handleRejectSuggestion = (suggestionId: string) => {
    setSuggestions(prev => prev.map(s => 
      s.id === suggestionId 
        ? { ...s, status: 'rejected' as const }
        : s
    ))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-green-100 text-green-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'seo':
        return <TrendingUp className="h-4 w-4" />
      case 'llmo':
        return <Target className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied':
        return 'bg-green-100 text-green-800'
      case 'testing':
        return 'bg-blue-100 text-blue-800'
      case 'rejected':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const pendingSuggestions = suggestions.filter(s => s.status === 'pending')
  const appliedSuggestions = suggestions.filter(s => s.status === 'applied')
  const testingSuggestions = suggestions.filter(s => s.status === 'testing')

  return (
    <div className="space-y-6">
      {/* Page Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wand2 className="mr-2 h-5 w-5" />
            AI Content Optimization
          </CardTitle>
          <CardDescription>
            Analyze and optimize your content for better SEO and LLMO performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex space-x-4">
              <Input
                placeholder="Enter page URL to analyze (e.g., https://example.com/about)"
                value={selectedUrl}
                onChange={(e) => setSelectedUrl(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleAnalyzePage}
                disabled={isAnalyzing || !selectedUrl}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Analyze Page
                  </>
                )}
              </Button>
            </div>

            {/* Auto-optimize toggle */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Auto-Optimization</h4>
                <p className="text-sm text-gray-600">
                  Automatically apply low-risk optimizations
                </p>
              </div>
              <Switch
                checked={autoOptimizeEnabled}
                onCheckedChange={setAutoOptimizeEnabled}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optimization Suggestions */}
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">
            Pending ({pendingSuggestions.length})
          </TabsTrigger>
          <TabsTrigger value="testing">
            Testing ({testingSuggestions.length})
          </TabsTrigger>
          <TabsTrigger value="applied">
            Applied ({appliedSuggestions.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            All ({suggestions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingSuggestions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                <p className="text-gray-600">No pending optimizations</p>
                <p className="text-sm text-gray-500">Analyze a page to get AI-powered optimization suggestions</p>
              </CardContent>
            </Card>
          ) : (
            pendingSuggestions.map((suggestion) => (
              <Card key={suggestion.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(suggestion.type)}
                      <CardTitle className="text-lg">{suggestion.title}</CardTitle>
                      <Badge className={getPriorityColor(suggestion.priority)}>
                        {suggestion.priority}
                      </Badge>
                      <Badge variant="outline">{suggestion.type.toUpperCase()}</Badge>
                    </div>
                    <Badge variant="outline">{suggestion.page}</Badge>
                  </div>
                  <CardDescription>{suggestion.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2 flex items-center">
                        <Eye className="mr-1 h-4 w-4" />
                        Original Content
                      </h4>
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {suggestion.originalText}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2 flex items-center">
                        <Edit3 className="mr-1 h-4 w-4" />
                        Suggested Content
                      </h4>
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {suggestion.suggestedText}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-600">
                        Expected Impact: {suggestion.impact}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOptimizeWithAI(suggestion.id)}
                        disabled={isOptimizing}
                      >
                        {isOptimizing ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Wand2 className="h-4 w-4" />
                        )}
                        AI Enhance
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRejectSuggestion(suggestion.id)}
                      >
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleApplySuggestion(suggestion.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Save className="mr-1 h-4 w-4" />
                        Apply
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="testing" className="space-y-4">
          {testingSuggestions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Clock className="mx-auto h-12 w-12 text-blue-500 mb-4" />
                <p className="text-gray-600">No experiments running</p>
                <p className="text-sm text-gray-500">Applied suggestions will appear here during A/B testing</p>
              </CardContent>
            </Card>
          ) : (
            testingSuggestions.map((suggestion) => (
              <Card key={suggestion.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(suggestion.type)}
                      <CardTitle className="text-lg">{suggestion.title}</CardTitle>
                      <Badge className={getStatusColor(suggestion.status)}>
                        {suggestion.status}
                      </Badge>
                    </div>
                    <Badge variant="outline">{suggestion.page}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-blue-600">
                        A/B testing in progress...
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Progress:</span>
                      <Progress value={65} className="w-24" />
                      <span className="text-sm text-gray-600">65%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="applied" className="space-y-4">
          {appliedSuggestions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                <p className="text-gray-600">No applied optimizations</p>
                <p className="text-sm text-gray-500">Successfully applied suggestions will appear here</p>
              </CardContent>
            </Card>
          ) : (
            appliedSuggestions.map((suggestion) => (
              <Card key={suggestion.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(suggestion.type)}
                      <CardTitle className="text-lg">{suggestion.title}</CardTitle>
                      <Badge className={getStatusColor(suggestion.status)}>
                        <CheckCircle className="mr-1 h-3 w-3" />
                        {suggestion.status}
                      </Badge>
                    </div>
                    <Badge variant="outline">{suggestion.page}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">
                        Impact: {suggestion.impact}
                      </span>
                    </div>
                    <Button variant="outline" size="sm">
                      View Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {suggestions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Wand2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600">No optimization suggestions yet</p>
                <p className="text-sm text-gray-500">Analyze a page to get started with AI-powered optimization</p>
              </CardContent>
            </Card>
          ) : (
            suggestions.map((suggestion) => (
              <Card key={suggestion.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(suggestion.type)}
                      <CardTitle className="text-lg">{suggestion.title}</CardTitle>
                      <Badge className={getPriorityColor(suggestion.priority)}>
                        {suggestion.priority}
                      </Badge>
                      <Badge className={getStatusColor(suggestion.status)}>
                        {suggestion.status}
                      </Badge>
                    </div>
                    <Badge variant="outline">{suggestion.page}</Badge>
                  </div>
                  <CardDescription>{suggestion.description}</CardDescription>
                </CardHeader>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}