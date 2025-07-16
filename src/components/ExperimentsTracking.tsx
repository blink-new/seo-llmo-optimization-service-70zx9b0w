import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Target, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Pause,
  Play,
  RotateCcw,
  CheckCircle,
  Clock,
  AlertTriangle,
  BarChart3,
  Calendar,
  Users,
  MousePointer,
  Zap,
  Search,
  FileText
} from 'lucide-react'
import blink from '@/blink/client'

interface Experiment {
  id: string
  name: string
  page: string
  type: 'content' | 'meta' | 'structure' | 'design'
  status: 'running' | 'completed' | 'paused' | 'draft'
  startDate: string
  endDate?: string
  duration: number // days
  trafficSplit: number // percentage for variant
  metrics: {
    visitors: number
    conversions: number
    conversionRate: number
    change: number
    significance: number
    confidence: number
    llmCitations: number
    llmCitationChange: number
  }
  control: {
    name: string
    description: string
    content: string
  }
  variant: {
    name: string
    description: string
    content: string
  }
  hypothesis: string
  results?: {
    winner: 'control' | 'variant' | 'inconclusive'
    recommendation: 'keep' | 'revert' | 'continue'
    impact: string
    llmImpact: string
  }
}

export default function ExperimentsTracking() {
  const [experiments, setExperiments] = useState<Experiment[]>([])
  const [isCreatingExperiment, setIsCreatingExperiment] = useState(false)
  const [newExperiment, setNewExperiment] = useState({
    name: '',
    page: '',
    type: 'content' as const,
    hypothesis: '',
    controlContent: '',
    variantContent: '',
    duration: 14
  })

  // Load experiments from storage or API
  useEffect(() => {
    loadExperiments()
  }, [])

  const loadExperiments = async () => {
    try {
      // Load from localStorage
      const storedExperiments = localStorage.getItem('seo-experiments')
      if (storedExperiments) {
        setExperiments(JSON.parse(storedExperiments))
      }
    } catch (error) {
      console.error('Failed to load experiments:', error)
      setExperiments([])
    }
  }

  const createExperiment = async () => {
    if (!newExperiment.name || !newExperiment.page || !newExperiment.hypothesis) {
      alert('Please fill in all required fields')
      return
    }

    setIsCreatingExperiment(true)
    try {
      // Analyze the control content for baseline metrics
      const controlAnalysis = await analyzeContentForLLMO(newExperiment.controlContent, newExperiment.page)
      const variantAnalysis = await analyzeContentForLLMO(newExperiment.variantContent, newExperiment.page)

      const experiment: Experiment = {
        id: Date.now().toString(),
        name: newExperiment.name,
        page: newExperiment.page,
        type: newExperiment.type,
        status: 'running',
        startDate: new Date().toISOString().split('T')[0],
        duration: newExperiment.duration,
        trafficSplit: 50,
        metrics: {
          visitors: 0,
          conversions: 0,
          conversionRate: 0,
          change: 0,
          significance: 0,
          confidence: 0,
          llmCitations: 0,
          llmCitationChange: 0
        },
        control: {
          name: 'Original Content',
          description: 'Current page content',
          content: newExperiment.controlContent
        },
        variant: {
          name: 'Optimized Content',
          description: 'AI-optimized content for better LLMO performance',
          content: newExperiment.variantContent
        },
        hypothesis: newExperiment.hypothesis
      }

      setExperiments(prev => [experiment, ...prev])
      
      // Reset form
      setNewExperiment({
        name: '',
        page: '',
        type: 'content',
        hypothesis: '',
        controlContent: '',
        variantContent: '',
        duration: 14
      })

      // Start tracking the experiment
      await startExperimentTracking(experiment.id)
    } catch (error) {
      console.error('Failed to create experiment:', error)
      alert('Failed to create experiment. Please try again.')
    } finally {
      setIsCreatingExperiment(false)
    }
  }

  const analyzeContentForLLMO = async (content: string, page: string) => {
    try {
      const { text } = await blink.ai.generateText({
        prompt: `Analyze this content for Large Language Model Optimization (LLMO) potential:

Content: ${content}
Page: ${page}

Evaluate:
1. How likely is this content to be cited by AI assistants?
2. What is the factual authority score (0-100)?
3. How well-structured is it for AI comprehension?
4. What's the estimated citation potential score (0-100)?

Respond in JSON format:
{
  "citationPotential": number,
  "factualAuthority": number,
  "structureScore": number,
  "estimatedCitations": number
}`,
        maxTokens: 200,
        model: 'gpt-4o-mini'
      })

      try {
        return JSON.parse(text)
      } catch {
        return {
          citationPotential: 50,
          factualAuthority: 60,
          structureScore: 55,
          estimatedCitations: 10
        }
      }
    } catch (error) {
      console.error('LLMO analysis failed:', error)
      return {
        citationPotential: 0,
        factualAuthority: 0,
        structureScore: 0,
        estimatedCitations: 0
      }
    }
  }

  const startExperimentTracking = async (experimentId: string) => {
    // In a real app, this would set up tracking for the experiment
    // For demo purposes, we'll simulate some initial metrics
    setTimeout(() => {
      setExperiments(prev => prev.map(exp => 
        exp.id === experimentId 
          ? {
              ...exp,
              metrics: {
                ...exp.metrics,
                visitors: Math.floor(Math.random() * 1000) + 500,
                conversions: Math.floor(Math.random() * 50) + 20,
                conversionRate: Math.random() * 5 + 2,
                change: (Math.random() - 0.5) * 30,
                significance: Math.random() * 100,
                confidence: Math.random() * 100,
                llmCitations: Math.floor(Math.random() * 20) + 5,
                llmCitationChange: (Math.random() - 0.5) * 50
              }
            }
          : exp
      ))
    }, 2000)
  }

  const pauseExperiment = (experimentId: string) => {
    setExperiments(prev => prev.map(exp => 
      exp.id === experimentId 
        ? { ...exp, status: 'paused' as const }
        : exp
    ))
  }

  const resumeExperiment = (experimentId: string) => {
    setExperiments(prev => prev.map(exp => 
      exp.id === experimentId 
        ? { ...exp, status: 'running' as const }
        : exp
    ))
  }

  const completeExperiment = async (experimentId: string) => {
    const experiment = experiments.find(e => e.id === experimentId)
    if (!experiment) return

    // Analyze results and determine winner
    const results = await analyzeExperimentResults(experiment)
    
    setExperiments(prev => prev.map(exp => 
      exp.id === experimentId 
        ? { 
            ...exp, 
            status: 'completed' as const,
            endDate: new Date().toISOString().split('T')[0],
            results
          }
        : exp
    ))
  }

  const analyzeExperimentResults = async (experiment: Experiment) => {
    try {
      const { text } = await blink.ai.generateText({
        prompt: `Analyze this A/B test experiment results and provide recommendations:

Experiment: ${experiment.name}
Hypothesis: ${experiment.hypothesis}

Metrics:
- Visitors: ${experiment.metrics.visitors}
- Conversion Rate Change: ${experiment.metrics.change.toFixed(1)}%
- Statistical Confidence: ${experiment.metrics.confidence.toFixed(1)}%
- LLM Citation Change: ${experiment.metrics.llmCitationChange.toFixed(1)}%

Control Content: ${experiment.control.content.substring(0, 500)}...
Variant Content: ${experiment.variant.content.substring(0, 500)}...

Determine:
1. Winner: "control", "variant", or "inconclusive"
2. Recommendation: "keep", "revert", or "continue"
3. Impact summary
4. LLM impact summary

Respond in JSON format:
{
  "winner": "variant",
  "recommendation": "keep",
  "impact": "25% improvement in conversions",
  "llmImpact": "40% increase in AI citations"
}`,
        maxTokens: 300,
        model: 'gpt-4o-mini'
      })

      try {
        return JSON.parse(text)
      } catch {
        return {
          winner: experiment.metrics.change > 0 ? 'variant' : 'control',
          recommendation: experiment.metrics.change > 5 ? 'keep' : 'revert',
          impact: `${Math.abs(experiment.metrics.change).toFixed(1)}% ${experiment.metrics.change > 0 ? 'improvement' : 'decline'}`,
          llmImpact: `${Math.abs(experiment.metrics.llmCitationChange).toFixed(1)}% ${experiment.metrics.llmCitationChange > 0 ? 'increase' : 'decrease'} in citations`
        }
      }
    } catch (error) {
      console.error('Results analysis failed:', error)
      return {
        winner: 'inconclusive' as const,
        recommendation: 'continue' as const,
        impact: 'Analysis incomplete',
        llmImpact: 'Citation impact unclear'
      }
    }
  }

  const generateVariantContent = async () => {
    if (!newExperiment.controlContent) {
      alert('Please enter control content first')
      return
    }

    try {
      const { text } = await blink.ai.generateText({
        prompt: `You are an expert in SEO and LLMO (Large Language Model Optimization). Optimize this content to improve both search rankings and AI assistant citations.

Original content: ${newExperiment.controlContent}

Page context: ${newExperiment.page}
Hypothesis: ${newExperiment.hypothesis}

Create an optimized version that:
1. Improves SEO with better keywords and structure
2. Enhances LLMO with clearer factual statements and better organization
3. Maintains the original meaning and tone
4. Makes it more likely to be cited by AI assistants

Return only the optimized content without explanations.`,
        maxTokens: 600,
        model: 'gpt-4o-mini'
      })

      setNewExperiment(prev => ({
        ...prev,
        variantContent: text.trim()
      }))
    } catch (error) {
      console.error('Content generation failed:', error)
      alert('Failed to generate optimized content. Please try again.')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Play className="h-4 w-4" />
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      case 'paused':
        return <Pause className="h-4 w-4" />
      case 'draft':
        return <Clock className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600'
    if (change < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4" />
    if (change < 0) return <TrendingDown className="h-4 w-4" />
    return null
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 95) return 'text-green-600'
    if (confidence >= 80) return 'text-yellow-600'
    return 'text-red-600'
  }

  const runningExperiments = experiments.filter(e => e.status === 'running')
  const completedExperiments = experiments.filter(e => e.status === 'completed')

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Tests</p>
                <p className="text-3xl font-bold text-green-600">{runningExperiments.length}</p>
              </div>
              <Target className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-blue-600">{completedExperiments.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Improvement</p>
                <p className="text-3xl font-bold text-purple-600">
                  {completedExperiments.length > 0 
                    ? `+${(completedExperiments.reduce((sum, e) => sum + Math.abs(e.metrics.change), 0) / completedExperiments.length).toFixed(1)}%`
                    : '0%'
                  }
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">LLM Citations</p>
                <p className="text-3xl font-bold text-orange-600">
                  {experiments.reduce((sum, e) => sum + e.metrics.llmCitations, 0)}
                </p>
              </div>
              <Search className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="active">Active Tests</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="create">Create New</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="active" className="space-y-6">
          {runningExperiments.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600">No active experiments</p>
                <p className="text-sm text-gray-500">Create a new A/B test to optimize your content</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {runningExperiments.map((experiment) => (
                <Card key={experiment.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CardTitle className="text-lg">{experiment.name}</CardTitle>
                        <Badge className={getStatusColor(experiment.status)}>
                          {getStatusIcon(experiment.status)}
                          <span className="ml-1">{experiment.status}</span>
                        </Badge>
                        <Badge variant="outline">{experiment.page}</Badge>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => pauseExperiment(experiment.id)}>
                          <Pause className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => completeExperiment(experiment.id)}>
                          <CheckCircle className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription>
                      {experiment.hypothesis}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Progress */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Test Progress</span>
                        <span>{Math.min(100, Math.round((new Date().getTime() - new Date(experiment.startDate).getTime()) / (1000 * 60 * 60 * 24 * experiment.duration) * 100))}%</span>
                      </div>
                      <Progress value={Math.min(100, Math.round((new Date().getTime() - new Date(experiment.startDate).getTime()) / (1000 * 60 * 60 * 24 * experiment.duration) * 100))} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">
                        Started {new Date(experiment.startDate).toLocaleDateString()} • {experiment.duration} days duration
                      </p>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div className="text-center p-3 border rounded">
                        <Users className="h-5 w-5 mx-auto mb-1 text-gray-400" />
                        <p className="text-sm text-gray-600">Visitors</p>
                        <p className="text-lg font-bold">{experiment.metrics.visitors.toLocaleString()}</p>
                      </div>
                      <div className="text-center p-3 border rounded">
                        <MousePointer className="h-5 w-5 mx-auto mb-1 text-gray-400" />
                        <p className="text-sm text-gray-600">Conversions</p>
                        <p className="text-lg font-bold">{experiment.metrics.conversions}</p>
                      </div>
                      <div className="text-center p-3 border rounded">
                        <div className="flex items-center justify-center mb-1">
                          {getChangeIcon(experiment.metrics.change)}
                        </div>
                        <p className="text-sm text-gray-600">Change</p>
                        <p className={`text-lg font-bold ${getChangeColor(experiment.metrics.change)}`}>
                          {experiment.metrics.change > 0 ? '+' : ''}{experiment.metrics.change.toFixed(1)}%
                        </p>
                      </div>
                      <div className="text-center p-3 border rounded">
                        <Search className="h-5 w-5 mx-auto mb-1 text-gray-400" />
                        <p className="text-sm text-gray-600">LLM Citations</p>
                        <p className="text-lg font-bold">{experiment.metrics.llmCitations}</p>
                      </div>
                      <div className="text-center p-3 border rounded">
                        <BarChart3 className="h-5 w-5 mx-auto mb-1 text-gray-400" />
                        <p className="text-sm text-gray-600">Confidence</p>
                        <p className={`text-lg font-bold ${getConfidenceColor(experiment.metrics.confidence)}`}>
                          {experiment.metrics.confidence.toFixed(0)}%
                        </p>
                      </div>
                    </div>

                    {/* Variants */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded">
                        <h4 className="font-medium mb-2">Control (50%)</h4>
                        <p className="text-sm text-gray-600 mb-2">{experiment.control.name}</p>
                        <p className="text-xs text-gray-500">{experiment.control.description}</p>
                      </div>
                      <div className="p-4 border rounded">
                        <h4 className="font-medium mb-2">Variant (50%)</h4>
                        <p className="text-sm text-gray-600 mb-2">{experiment.variant.name}</p>
                        <p className="text-xs text-gray-500">{experiment.variant.description}</p>
                      </div>
                    </div>

                    {/* Significance Warning */}
                    {experiment.metrics.confidence < 95 && (
                      <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <p className="text-sm text-yellow-800">
                          Results not yet statistically significant. Continue test for reliable results.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-6">
          {completedExperiments.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600">No completed experiments</p>
                <p className="text-sm text-gray-500">Completed A/B tests will appear here with their results</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {completedExperiments.map((experiment) => (
                <Card key={experiment.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CardTitle className="text-lg">{experiment.name}</CardTitle>
                        <Badge className={getStatusColor(experiment.status)}>
                          {getStatusIcon(experiment.status)}
                          <span className="ml-1">{experiment.status}</span>
                        </Badge>
                        <Badge variant="outline">{experiment.page}</Badge>
                        {experiment.results && (
                          <Badge className={
                            experiment.results.winner === 'variant' ? 'bg-green-100 text-green-800' :
                            experiment.results.winner === 'control' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }>
                            {experiment.results.winner === 'variant' ? 'Variant Won' :
                             experiment.results.winner === 'control' ? 'Control Won' :
                             'Inconclusive'}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardDescription>
                      Ran from {new Date(experiment.startDate).toLocaleDateString()} to {experiment.endDate ? new Date(experiment.endDate).toLocaleDateString() : 'ongoing'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 border rounded">
                        <p className="text-sm text-gray-600">Total Visitors</p>
                        <p className="text-lg font-bold">{experiment.metrics.visitors.toLocaleString()}</p>
                      </div>
                      <div className="text-center p-3 border rounded">
                        <p className="text-sm text-gray-600">Conversions</p>
                        <p className="text-lg font-bold">{experiment.metrics.conversions}</p>
                      </div>
                      <div className="text-center p-3 border rounded">
                        <p className="text-sm text-gray-600">Improvement</p>
                        <p className={`text-lg font-bold ${getChangeColor(experiment.metrics.change)}`}>
                          {experiment.metrics.change > 0 ? '+' : ''}{experiment.metrics.change.toFixed(1)}%
                        </p>
                      </div>
                      <div className="text-center p-3 border rounded">
                        <p className="text-sm text-gray-600">LLM Citations</p>
                        <p className="text-lg font-bold">{experiment.metrics.llmCitations}</p>
                      </div>
                    </div>

                    {experiment.results && (
                      <div className="p-4 bg-gray-50 rounded">
                        <h4 className="font-medium mb-2">Results & Recommendation</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Action:</strong> {experiment.results.recommendation.charAt(0).toUpperCase() + experiment.results.recommendation.slice(1)} the changes
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>SEO Impact:</strong> {experiment.results.impact}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>LLMO Impact:</strong> {experiment.results.llmImpact}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New A/B Test Experiment</CardTitle>
              <CardDescription>
                Test content optimizations to improve SEO and LLM citation performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Experiment Name</label>
                  <Input
                    placeholder="e.g., Homepage Hero Optimization"
                    value={newExperiment.name}
                    onChange={(e) => setNewExperiment(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Page URL</label>
                  <Input
                    placeholder="e.g., https://example.com/about"
                    value={newExperiment.page}
                    onChange={(e) => setNewExperiment(prev => ({ ...prev, page: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Hypothesis</label>
                <Textarea
                  placeholder="Describe what you expect to improve and why..."
                  value={newExperiment.hypothesis}
                  onChange={(e) => setNewExperiment(prev => ({ ...prev, hypothesis: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Control Content (Current)</label>
                <Textarea
                  placeholder="Paste the current content that you want to test against..."
                  value={newExperiment.controlContent}
                  onChange={(e) => setNewExperiment(prev => ({ ...prev, controlContent: e.target.value }))}
                  rows={4}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Variant Content (Optimized)</label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateVariantContent}
                    disabled={!newExperiment.controlContent}
                  >
                    <Zap className="h-4 w-4 mr-1" />
                    AI Generate
                  </Button>
                </div>
                <Textarea
                  placeholder="Enter or generate optimized content for testing..."
                  value={newExperiment.variantContent}
                  onChange={(e) => setNewExperiment(prev => ({ ...prev, variantContent: e.target.value }))}
                  rows={4}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Test Duration (days)</label>
                  <Input
                    type="number"
                    min="7"
                    max="30"
                    value={newExperiment.duration}
                    onChange={(e) => setNewExperiment(prev => ({ ...prev, duration: parseInt(e.target.value) || 14 }))}
                    className="w-24 mt-1"
                  />
                </div>
                <Button
                  onClick={createExperiment}
                  disabled={isCreatingExperiment || !newExperiment.name || !newExperiment.page}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isCreatingExperiment ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Start Experiment
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}