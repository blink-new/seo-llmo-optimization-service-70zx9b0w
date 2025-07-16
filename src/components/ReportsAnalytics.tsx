import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Download, 
  Calendar,
  Users,
  Search,
  Target,
  FileText,
  Globe,
  ArrowUp,
  ArrowDown,
  Minus,
  Eye,
  MousePointer,
  Clock,
  Zap
} from 'lucide-react'

interface MetricData {
  label: string
  value: number
  change: number
  trend: 'up' | 'down' | 'stable'
  period: string
}

interface TrafficData {
  date: string
  organic: number
  direct: number
  referral: number
  social: number
  total: number
}

interface KeywordPerformance {
  keyword: string
  position: number
  previousPosition: number
  volume: number
  clicks: number
  impressions: number
  ctr: number
}

export default function ReportsAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [selectedWebsite, setSelectedWebsite] = useState('all')

  // Mock data for demonstration
  const keyMetrics: MetricData[] = [
    {
      label: 'Organic Traffic',
      value: 12847,
      change: 18.5,
      trend: 'up',
      period: 'vs last month'
    },
    {
      label: 'Keyword Rankings',
      value: 156,
      change: 12.3,
      trend: 'up',
      period: 'top 10 positions'
    },
    {
      label: 'LLM Citations',
      value: 89,
      change: 34.2,
      trend: 'up',
      period: 'vs last month'
    },
    {
      label: 'Page Speed Score',
      value: 87,
      change: -2.1,
      trend: 'down',
      period: 'average across pages'
    },
    {
      label: 'Conversion Rate',
      value: 4.2,
      change: 8.7,
      trend: 'up',
      period: 'vs last month'
    },
    {
      label: 'Bounce Rate',
      value: 32.1,
      change: -5.4,
      trend: 'up',
      period: 'vs last month'
    }
  ]

  const trafficData: TrafficData[] = [
    { date: '2024-01-01', organic: 2340, direct: 890, referral: 456, social: 234, total: 3920 },
    { date: '2024-01-02', organic: 2567, direct: 923, referral: 478, social: 267, total: 4235 },
    { date: '2024-01-03', organic: 2789, direct: 856, referral: 523, social: 289, total: 4457 },
    { date: '2024-01-04', organic: 2456, direct: 934, referral: 445, social: 234, total: 4069 },
    { date: '2024-01-05', organic: 2890, direct: 1023, referral: 567, social: 345, total: 4825 },
    { date: '2024-01-06', organic: 3123, direct: 1156, referral: 623, social: 378, total: 5280 },
    { date: '2024-01-07', organic: 2967, direct: 1089, referral: 589, social: 356, total: 5001 }
  ]

  const keywordPerformance: KeywordPerformance[] = [
    {
      keyword: 'SEO optimization tools',
      position: 3,
      previousPosition: 5,
      volume: 8900,
      clicks: 234,
      impressions: 12400,
      ctr: 1.89
    },
    {
      keyword: 'website analysis software',
      position: 7,
      previousPosition: 12,
      volume: 5600,
      clicks: 156,
      impressions: 8900,
      ctr: 1.75
    },
    {
      keyword: 'LLMO optimization',
      position: 2,
      previousPosition: 2,
      volume: 3400,
      clicks: 189,
      impressions: 4200,
      ctr: 4.5
    },
    {
      keyword: 'competitor analysis tool',
      position: 8,
      previousPosition: 6,
      volume: 7200,
      clicks: 98,
      impressions: 9800,
      ctr: 1.0
    },
    {
      keyword: 'content optimization AI',
      position: 4,
      previousPosition: 8,
      volume: 4500,
      clicks: 167,
      impressions: 6700,
      ctr: 2.49
    }
  ]

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const getChangeColor = (change: number, inverse = false) => {
    const isPositive = inverse ? change < 0 : change > 0
    return isPositive ? 'text-green-600' : 'text-red-600'
  }

  const getPositionChange = (current: number, previous: number) => {
    const change = previous - current // Positive means improvement (lower position number)
    if (change > 0) return { icon: <ArrowUp className="h-3 w-3 text-green-500" />, color: 'text-green-600' }
    if (change < 0) return { icon: <ArrowDown className="h-3 w-3 text-red-500" />, color: 'text-red-600' }
    return { icon: <Minus className="h-3 w-3 text-gray-500" />, color: 'text-gray-600' }
  }

  const exportReport = () => {
    // In a real app, this would generate and download a PDF/Excel report
    alert('Report export functionality would be implemented here')
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Globe className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">All Websites</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">Last 30 days</span>
          </div>
        </div>

        <Button onClick={exportReport} className="bg-blue-600 hover:bg-blue-700">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="traffic">Traffic</TabsTrigger>
          <TabsTrigger value="keywords">Keywords</TabsTrigger>
          <TabsTrigger value="experiments">Experiments</TabsTrigger>
          <TabsTrigger value="competitors">Competitors</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {keyMetrics.map((metric, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                    {getTrendIcon(metric.trend)}
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <p className="text-3xl font-bold text-gray-900">
                      {metric.label.includes('Rate') ? `${metric.value}%` : metric.value.toLocaleString()}
                    </p>
                    <p className={`text-sm font-medium ${getChangeColor(metric.change, metric.label === 'Bounce Rate')}`}>
                      {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{metric.period}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Performance Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>SEO Performance Summary</CardTitle>
                <CardDescription>Key SEO metrics and improvements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Organic Traffic Growth</span>
                  </div>
                  <span className="text-green-600 font-bold">+18.5%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">Keywords in Top 10</span>
                  </div>
                  <span className="text-blue-600 font-bold">156</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Zap className="h-5 w-5 text-purple-600" />
                    <span className="font-medium">Page Speed Improvements</span>
                  </div>
                  <span className="text-purple-600 font-bold">12 pages</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>LLMO Performance Summary</CardTitle>
                <CardDescription>Large Language Model Optimization results</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span className="font-medium">LLM Citations</span>
                  </div>
                  <span className="text-green-600 font-bold">+34.2%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">Structured Content</span>
                  </div>
                  <span className="text-blue-600 font-bold">89%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Search className="h-5 w-5 text-orange-600" />
                    <span className="font-medium">FAQ Sections Added</span>
                  </div>
                  <span className="text-orange-600 font-bold">8 pages</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Optimizations */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Optimizations</CardTitle>
              <CardDescription>Latest improvements and their impact</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Meta Description Optimization</p>
                      <p className="text-sm text-gray-500">Homepage and 5 product pages</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">+25% CTR</p>
                    <p className="text-xs text-gray-500">2 days ago</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Target className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">FAQ Section Implementation</p>
                      <p className="text-sm text-gray-500">About and Services pages</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">+60% LLM Citations</p>
                    <p className="text-xs text-gray-500">5 days ago</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Zap className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">Internal Linking Structure</p>
                      <p className="text-sm text-gray-500">Blog and resource pages</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-purple-600">+15% Page Authority</p>
                    <p className="text-xs text-gray-500">1 week ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="traffic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Traffic Analytics</CardTitle>
              <CardDescription>Website traffic breakdown and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Traffic Sources */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-sm text-gray-600">Organic Search</p>
                    <p className="text-2xl font-bold text-green-600">58.2%</p>
                    <p className="text-xs text-green-600">+12.3% vs last month</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-sm text-gray-600">Direct</p>
                    <p className="text-2xl font-bold text-blue-600">23.1%</p>
                    <p className="text-xs text-blue-600">+5.7% vs last month</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-sm text-gray-600">Referral</p>
                    <p className="text-2xl font-bold text-purple-600">12.4%</p>
                    <p className="text-xs text-purple-600">+8.9% vs last month</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-sm text-gray-600">Social</p>
                    <p className="text-2xl font-bold text-orange-600">6.3%</p>
                    <p className="text-xs text-orange-600">+15.2% vs last month</p>
                  </div>
                </div>

                {/* Traffic Chart Placeholder */}
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-600">Traffic trend chart would be displayed here</p>
                    <p className="text-sm text-gray-500">Interactive chart showing daily/weekly/monthly traffic patterns</p>
                  </div>
                </div>

                {/* Top Pages */}
                <div>
                  <h4 className="font-medium mb-4">Top Performing Pages</h4>
                  <div className="space-y-3">
                    {[
                      { page: '/', views: 12847, change: 18.5 },
                      { page: '/services', views: 8934, change: 12.3 },
                      { page: '/about', views: 6721, change: -2.1 },
                      { page: '/blog/seo-guide', views: 5432, change: 34.7 },
                      { page: '/contact', views: 3456, change: 8.9 }
                    ].map((page, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">{page.page}</p>
                          <p className="text-sm text-gray-500">{page.views.toLocaleString()} views</p>
                        </div>
                        <div className={`text-right ${getChangeColor(page.change)}`}>
                          <p className="font-medium">{page.change > 0 ? '+' : ''}{page.change}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keywords" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Keyword Performance</CardTitle>
              <CardDescription>Track your keyword rankings and performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {keywordPerformance.map((keyword, index) => {
                  const positionChange = getPositionChange(keyword.position, keyword.previousPosition)
                  return (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium">{keyword.keyword}</h4>
                          <Badge variant="outline">Vol: {keyword.volume.toLocaleString()}</Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>{keyword.clicks} clicks</span>
                          <span>{keyword.impressions.toLocaleString()} impressions</span>
                          <span>{keyword.ctr}% CTR</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Position</p>
                          <div className="flex items-center space-x-1">
                            <p className="text-lg font-bold">#{keyword.position}</p>
                            {positionChange.icon}
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Change</p>
                          <p className={`font-medium ${positionChange.color}`}>
                            {keyword.previousPosition - keyword.position > 0 ? '+' : ''}
                            {keyword.previousPosition - keyword.position}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="experiments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Experiment Results</CardTitle>
              <CardDescription>A/B test performance and statistical significance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-sm text-gray-600">Active Tests</p>
                    <p className="text-2xl font-bold text-blue-600">3</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-sm text-gray-600">Completed Tests</p>
                    <p className="text-2xl font-bold text-green-600">12</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-sm text-gray-600">Success Rate</p>
                    <p className="text-2xl font-bold text-purple-600">75%</p>
                  </div>
                </div>

                <div className="text-center py-8">
                  <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600">Detailed experiment analytics would be displayed here</p>
                  <p className="text-sm text-gray-500">Statistical significance, confidence intervals, and conversion funnels</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="competitors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Competitive Analysis</CardTitle>
              <CardDescription>Compare your performance against competitors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-sm text-gray-600">Competitors Tracked</p>
                    <p className="text-2xl font-bold text-blue-600">8</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-sm text-gray-600">Keyword Gaps Found</p>
                    <p className="text-2xl font-bold text-red-600">23</p>
                  </div>
                </div>

                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600">Competitive analysis charts would be displayed here</p>
                  <p className="text-sm text-gray-500">Market share, keyword overlap, and opportunity analysis</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}