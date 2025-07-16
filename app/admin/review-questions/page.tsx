"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Trash2, ArrowLeft, Save, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"

interface ReviewCriteria {
  id: string
  label: string
  description: string
}

export default function ReviewQuestionsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [criteria, setCriteria] = useState<ReviewCriteria[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })

  useEffect(() => {
    if (session?.user?.role !== "admin") {
      router.push("/")
      return
    }
    fetchCriteria()
  }, [session, router])

  const fetchCriteria = async () => {
    try {
      const response = await fetch("/api/review-questions")
      const data = await response.json()
      setCriteria(data)
    } catch (error) {
      console.error("Error fetching criteria:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage({ type: "", text: "" })

    try {
      const response = await fetch("/api/review-questions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ criteria }),
      })

      const result = await response.json()

      if (response.ok) {
        setMessage({ type: "success", text: "Review questions updated successfully!" })
      } else {
        setMessage({ type: "error", text: result.error || "Failed to update questions" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Something went wrong. Please try again." })
    } finally {
      setSaving(false)
    }
  }

  const addCriteria = () => {
    const newId = `custom_${Date.now()}`
    setCriteria([
      ...criteria,
      {
        id: newId,
        label: "",
        description: "",
      },
    ])
  }

  const updateCriteria = (index: number, field: keyof ReviewCriteria, value: string) => {
    const updated = [...criteria]
    updated[index] = { ...updated[index], [field]: value }
    setCriteria(updated)
  }

  const removeCriteria = (index: number) => {
    setCriteria(criteria.filter((_, i) => i !== index))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading review questions...</p>
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
                Admin Panel
              </Link>
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-gray-600">Review Questions</span>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={addCriteria}>
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Review Questions Management</CardTitle>
            <CardDescription>
              Customize the performance review criteria and questions used for employee evaluations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {message.text && (
              <Alert variant={message.type === "error" ? "destructive" : "default"}>
                {message.type === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              {criteria.map((criterion, index) => (
                <Card key={criterion.id} className="p-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 space-y-4">
                        <div>
                          <Label htmlFor={`label-${index}`}>Question Title</Label>
                          <Input
                            id={`label-${index}`}
                            value={criterion.label}
                            onChange={(e) => updateCriteria(index, "label", e.target.value)}
                            placeholder="e.g., Technical Skills"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`description-${index}`}>Description</Label>
                          <Textarea
                            id={`description-${index}`}
                            value={criterion.description}
                            onChange={(e) => updateCriteria(index, "description", e.target.value)}
                            placeholder="e.g., Proficiency in job-related technical competencies"
                            rows={2}
                          />
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeCriteria(index)}
                        className="ml-4 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {criteria.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No review questions configured</p>
                <Button onClick={addCriteria}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Question
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
