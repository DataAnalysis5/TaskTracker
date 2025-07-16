"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Users, ArrowLeft, Loader2, CheckCircle, AlertCircle, Edit } from "lucide-react"
import Link from "next/link"

const departments = [
  "Sales Support",
  "HR",
  "Training Department",
  "Dispatch Diamond",
  "Dispatch Franchise",
  "Dispatch Gold",
  "SNMCC",
  "Accounts",
  "Marketing",
  "IT",
  "E-COM",
  "PD / Merchandiser",
  "Visual Merchandiser FRN",
  "PR / CSR",
  "RARE",
  "Data Analyst",
  "Photography",
]

export default function AdminUsersPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState([])
  const [supervisors, setSupervisors] = useState([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })
  const [editingUser, setEditingUser] = useState(null)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    department: "",
    phone: "",
    location: "",
    reportingTo: "",
    employeeId: "",
  })

  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    role: "",
    department: "",
    phone: "",
    location: "",
    reportingTo: "",
    employeeId: "",
  })

  useEffect(() => {
    if (session?.user?.role !== "admin") {
      router.push("/")
      return
    }
    fetchUsers()
    fetchSupervisors()
  }, [session, router])

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/employees")
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSupervisors = async () => {
    try {
      const response = await fetch("/api/employees")
      const data = await response.json()
      const supervisorList = data.filter((emp: any) => emp.role === "hod" || emp.role === "admin")
      setSupervisors(supervisorList)
    } catch (error) {
      console.error("Error fetching supervisors:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage({ type: "", text: "" })

    try {
      const response = await fetch("/api/users/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          joinDate: new Date(),
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setMessage({ type: "success", text: `User created successfully! Employee ID: ${result.employeeId}` })
        setFormData({
          name: "",
          email: "",
          password: "",
          role: "",
          department: "",
          phone: "",
          location: "",
          reportingTo: "",
          employeeId: "",
        })
        fetchUsers()
        setTimeout(() => setIsDialogOpen(false), 2000)
      } else {
        setMessage({ type: "error", text: result.error || "Failed to create user" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Something went wrong. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage({ type: "", text: "" })

    try {
      const response = await fetch(`/api/users/${editingUser._id}/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      })

      const result = await response.json()

      if (response.ok) {
        setMessage({ type: "success", text: "User updated successfully!" })
        fetchUsers()
        setTimeout(() => setIsEditDialogOpen(false), 2000)
      } else {
        setMessage({ type: "error", text: result.error || "Failed to update user" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Something went wrong. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditDialog = (user: any) => {
    setEditingUser(user)
    setEditFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      phone: user.phone || "",
      location: user.location || "",
      reportingTo: user.reportingTo || "",
      employeeId: user.employeeId,
    })
    setIsEditDialogOpen(true)
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge variant="destructive">Admin</Badge>
      case "hod":
        return <Badge className="bg-blue-100 text-blue-800">Supervisor</Badge>
      case "employee":
        return <Badge variant="secondary">Employee</Badge>
      default:
        return <Badge variant="outline">{role}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
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
              <span className="text-gray-600">User Management</span>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create User
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New User</DialogTitle>
                  <DialogDescription>Add a new employee or supervisor to the system</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="employeeId">Employee ID</Label>
                      <Input
                        id="employeeId"
                        type="number"
                        value={formData.employeeId}
                        onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                        placeholder="e.g., 1001"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employee">Employee</SelectItem>
                        <SelectItem value="hod">HOD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="department">Department</Label>
                      <Select
                        value={formData.department}
                        onValueChange={(value) => setFormData({ ...formData, department: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept} value={dept}>
                              {dept}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="City, State"
                    />
                  </div>
                  {formData.role === "employee" && (
                    <div>
                      <Label htmlFor="reportingTo">Reporting HOD / Supervisor</Label>
                      <Select
                        value={formData.reportingTo}
                        onValueChange={(value) => setFormData({ ...formData, reportingTo: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select supervisor" />
                        </SelectTrigger>
                        <SelectContent>
                          {supervisors.map((supervisor: any) => (
                            <SelectItem key={supervisor.employeeId} value={supervisor.employeeId}>
                              {supervisor.name} - {supervisor.department} ({supervisor.role.toUpperCase()})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {message.text && (
                    <Alert variant={message.type === "error" ? "destructive" : "default"}>
                      {message.type === "success" ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <AlertCircle className="h-4 w-4" />
                      )}
                      <AlertDescription>{message.text}</AlertDescription>
                    </Alert>
                  )}
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create User
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              User Management
            </CardTitle>
            <CardDescription>Manage employees and supervisors in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map((user: any) => (
                <Card key={user._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src="/placeholder.svg?height=48&width=48" />
                        <AvatarFallback>
                          {user.name
                            ?.split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold">{user.name}</h3>
                        <p className="text-sm text-muted-foreground">{user.employeeId}</p>
                      </div>
                      {getRoleBadge(user.role)}
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Email:</span> {user.email}
                      </div>
                      <div>
                        <span className="font-medium">Department:</span> {user.department}
                      </div>
                      {user.phone && (
                        <div>
                          <span className="font-medium">Phone:</span> {user.phone}
                        </div>
                      )}
                      {user.location && (
                        <div>
                          <span className="font-medium">Location:</span> {user.location}
                        </div>
                      )}
                      {user.reportingTo && (
                        <div>
                          <span className="font-medium">Reports To:</span>{" "}
                          {users.find((u: any) => u.employeeId === user.reportingTo)?.name || user.reportingTo}
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Joined:</span>{" "}
                        {new Date(user.joinDate || user.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="mt-4">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(user)} className="w-full">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit User
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editName">Full Name</Label>
                <Input
                  id="editName"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="editEmployeeId">Employee ID</Label>
                <Input
                  id="editEmployeeId"
                  type="number"
                  value={editFormData.employeeId}
                  onChange={(e) => setEditFormData({ ...editFormData, employeeId: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="editEmail">Email</Label>
              <Input
                id="editEmail"
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="editRole">Role</Label>
              <Select
                value={editFormData.role}
                onValueChange={(value) => setEditFormData({ ...editFormData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="hod">HOD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editDepartment">Department</Label>
                <Select
                  value={editFormData.department}
                  onValueChange={(value) => setEditFormData({ ...editFormData, department: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="editPhone">Phone</Label>
                <Input
                  id="editPhone"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="editLocation">Location</Label>
              <Input
                id="editLocation"
                value={editFormData.location}
                onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                placeholder="City, State"
              />
            </div>
            {editFormData.role === "employee" && (
              <div>
                <Label htmlFor="editReportingTo">Reporting HOD / Supervisor</Label>
                <Select
                  value={editFormData.reportingTo}
                  onValueChange={(value) => setEditFormData({ ...editFormData, reportingTo: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select supervisor" />
                  </SelectTrigger>
                  <SelectContent>
                    {supervisors.map((supervisor: any) => (
                      <SelectItem key={supervisor.employeeId} value={supervisor.employeeId}>
                        {supervisor.name} - {supervisor.department} ({supervisor.role.toUpperCase()})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {message.text && (
              <Alert variant={message.type === "error" ? "destructive" : "default"}>
                {message.type === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            )}
            <div className="flex space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update User
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
