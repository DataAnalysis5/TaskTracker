"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { BarChart3, TrendingUp, TrendingDown, Users, Target, Star, Calendar, Download, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

const goalProgress = [
  { category: "Technical Skills", progress: 85, target: 90 },
  { category: "Leadership", progress: 72, target: 80 },
  { category: "Communication", progress: 88, target: 85 },
  { category: "Innovation", progress: 65, target: 75 },
  { category: "Collaboration", progress: 92, target: 90 },
]

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState({
    avgPerformance: 0,
    reviewsCompleted: 0,
    goalAchievement: 0,
    employeeSatisfaction: 0,
    departmentPerformance: [],
    topPerformers: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const [employeesRes, reviewsRes, goalsRes] = await Promise.all([
          fetch("/api/employees"),
          fetch("/api/reviews"),
          fetch("/api/goals"),
        ])

        const employees = await employeesRes.json()
        const reviews = await reviewsRes.json()
        const goals = await goalsRes.json()

        // Calculate analytics
        const completedReviews = reviews.filter((review: any) => review.status === "completed" && review.score)
        const avgPerformance =
          completedReviews.length > 0
            ? completedReviews.reduce((sum: number, review: any) => sum + review.score, 0) / completedReviews.length
            : 0

        const totalEmployees = employees.filter((emp: any) => emp.role === "employee").length
        const reviewsCompleted = totalEmployees > 0 ? (completedReviews.length / totalEmployees) * 100 : 0

        const completedGoals = goals.filter((goal: any) => goal.status === "completed").length
        const goalAchievement = goals.length > 0 ? (completedGoals / goals.length) * 100 : 0

        // Calculate department performance
        const departments = [...new Set(employees.map((emp: any) => emp.department))]
        const departmentPerformance = departments.map((dept) => {
          const deptEmployees = employees.filter((emp: any) => emp.department === dept && emp.role === "employee")
          const deptReviews = reviews.filter(
            (review: any) =>
              deptEmployees.some((emp: any) => emp.employeeId === review.employeeId) &&
              review.status === "completed" &&
              review.score,
          )
          const avgScore =
            deptReviews.length > 0
              ? deptReviews.reduce((sum: number, review: any) => sum + review.score, 0) / deptReviews.length
              : 0

          return {
            department: dept,
            avgScore: Math.round(avgScore * 10) / 10,
            employees: deptEmployees.length,
            trend: avgScore >= 4.0 ? "up" : avgScore >= 3.5 ? "stable" : "down",
          }
        })

        // Get top performers
        const topPerformers = completedReviews
          .sort((a: any, b: any) => b.score - a.score)
          .slice(0, 5)
          .map((review: any) => {
            const employee = employees.find((emp: any) => emp.employeeId === review.employeeId)
            return {
              name: review.employeeName || employee?.name || "Unknown",
              role: review.employeeRole || employee?.role || "Employee",
              score: review.score,
              department: employee?.department || "Unknown",
            }
          })

        setAnalyticsData({
          avgPerformance: Math.round(avgPerformance * 10) / 10,
          reviewsCompleted: Math.round(reviewsCompleted),
          goalAchievement: Math.round(goalAchievement),
          employeeSatisfaction: Math.round(avgPerformance * 0.8 * 10) / 10, // Estimated based on performance
          departmentPerformance,
          topPerformers,
        })
      } catch (error) {
        console.error("Error fetching analytics data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalyticsData()
  }, [])

  const handleExportReport = () => {
    // Prepare CSV data
    const csvData = []

    // Add headers
    csvData.push([
      "Report Type",
      "Generated At",
      "Period",
      "Avg Performance",
      "Reviews Completed %",
      "Goal Achievement %",
      "Employee Satisfaction",
    ])

    // Add summary data
    csvData.push([
      "Performance Analytics Summary",
      new Date().toISOString(),
      "Q4 2025",
      analyticsData.avgPerformance,
      analyticsData.reviewsCompleted,
      analyticsData.goalAchievement,
      analyticsData.employeeSatisfaction,
    ])

    // Add empty row
    csvData.push([])

    // Add department performance headers
    csvData.push(["Department Performance"])
    csvData.push(["Department", "Average Score", "Employees", "Trend"])

    // Add department data
    analyticsData.departmentPerformance.forEach((dept) => {
      csvData.push([dept.department, dept.avgScore, dept.employees, dept.trend])
    })

    // Add empty row
    csvData.push([])

    // Add top performers headers
    csvData.push(["Top Performers"])
    csvData.push(["Rank", "Name", "Role", "Score", "Department"])

    // Add top performers data
    analyticsData.topPerformers.forEach((performer, index) => {
      csvData.push([index + 1, performer.name, performer.role, performer.score, performer.department])
    })

    // Add empty row
    csvData.push([])

    // Add goal progress headers
    csvData.push(["Goal Progress"])
    csvData.push(["Category", "Current Progress %", "Target %"])

    // Add goal progress data
    goalProgress.forEach((goal) => {
      csvData.push([goal.category, goal.progress, goal.target])
    })

    // Convert to CSV string
    const csvContent = csvData.map((row) => row.map((field) => `"${field}"`).join(",")).join("\n")

    // Create and download CSV file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `PMS_Analytics_Report_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-gray-700 flex items-center">
                <ArrowLeft className="w-5 h-5 mr-2" />
                PMS Dashboard
              </Link>
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-gray-600">Analytics</span>
            </div>
            <div className="flex items-center space-x-4">
              <Select defaultValue="q4-2025">
                <SelectTrigger className="w-40">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="q4-2025">Q4 2025</SelectItem>
                  <SelectItem value="q3-2025">Q3 2025</SelectItem>
                  <SelectItem value="q2-2025">Q2 2025</SelectItem>
                  <SelectItem value="q1-2025">Q1 2025</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={handleExportReport}>
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Performance</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.avgPerformance}</div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="w-3 h-3 mr-1" />
                Based on completed reviews
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reviews Completed</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.reviewsCompleted}%</div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="w-3 h-3 mr-1" />
                Of total employees
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Goal Achievement</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.goalAchievement}%</div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="w-3 h-3 mr-1" />
                Goals completed
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Employee Satisfaction</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.employeeSatisfaction}</div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="w-3 h-3 mr-1" />
                Estimated from performance
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Department Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Department Performance</CardTitle>
              <CardDescription>Average performance scores by department</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.departmentPerformance.map((dept, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="font-medium">{dept.department}</p>
                        <p className="text-sm text-muted-foreground">{dept.employees} employees</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className="font-medium">{dept.avgScore}</p>
                        <div className="flex items-center">
                          {dept.trend === "up" && <TrendingUp className="w-3 h-3 text-green-500" />}
                          {dept.trend === "down" && <TrendingDown className="w-3 h-3 text-red-500" />}
                          {dept.trend === "stable" && <div className="w-3 h-3 bg-gray-400 rounded-full"></div>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Performers */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
              <CardDescription>Highest rated employees this quarter</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.topPerformers.map((performer, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{performer.name}</p>
                        <p className="text-sm text-muted-foreground">{performer.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                        <span className="font-medium">{performer.score}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {performer.department}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Goal Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Organizational Goal Progress</CardTitle>
            <CardDescription>Progress towards company-wide performance objectives</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {goalProgress.map((goal, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{goal.category}</span>
                    <span className="text-sm text-muted-foreground">
                      {goal.progress}% / {goal.target}%
                    </span>
                  </div>
                  <Progress value={goal.progress} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Current: {goal.progress}%</span>
                    <span>Target: {goal.target}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
