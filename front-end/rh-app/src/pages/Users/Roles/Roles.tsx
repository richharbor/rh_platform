"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, Plus, MoreVertical, UserPlus, Settings } from "lucide-react"
import { useState, useEffect } from "react"
import { getCurrentUser, getAllRoles, assignRoleToUser } from "@/services/Role/roleServices"

interface Role {
  id: number
  name: string
  description: string
}

interface User {
  id: number
  email: string
  currentRole: Role
  assignedRoles: Role[]
}

export default function Roles() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [allRoles, setAllRoles] = useState<Role[]>([])
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [userResponse, rolesResponse] = await Promise.all([getCurrentUser(), getAllRoles()])

      setCurrentUser({
        id: userResponse.id,
        email: userResponse.email,
        currentRole: userResponse.currentRole,
        assignedRoles: userResponse.allRoles || [userResponse.currentRole],
      })
      setAllRoles(rolesResponse.roles)
    } catch (error) {
      console.error("Failed to load data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAssignRole = async () => {
    if (!currentUser || !selectedRole) return

    try {
      await assignRoleToUser(currentUser.id, { roleId: Number.parseInt(selectedRole) })
      await loadData() // Reload data
      setIsAddRoleOpen(false)
      setSelectedRole("")
    } catch (error) {
      console.error("Failed to assign role:", error)
    }
  }

  const getRoleColor = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case "superadmin":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "broker":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "investor":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getAvailableRoles = () => {
    if (!currentUser) return []
    const assignedRoleIds = currentUser.assignedRoles.map((role) => role.id)
    return allRoles.filter((role) => !assignedRoleIds.includes(role.id))
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4.5rem)] w-full items-center justify-center">
        <div className="text-muted-foreground">Loading roles...</div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-4.5rem)] w-full overflow-hidden rounded-lg">
      <div className="flex flex-1 flex-col w-full">
        <div className="flex items-center justify-between border-b-2 h-[60px] px-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Role Management</h2>
          </div>
          <Dialog open={isAddRoleOpen} onOpenChange={setIsAddRoleOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Assign Role
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign New Role</DialogTitle>
                <DialogDescription>
                  Assign a new role to yourself. You can switch between assigned roles anytime.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="role">Select Role</Label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a role to assign" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableRoles().map((role) => (
                        <SelectItem key={role.id} value={role.id.toString()}>
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            <div>
                              <div className="font-medium">{role.name}</div>
                              <div className="text-xs text-muted-foreground">{role.description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddRoleOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAssignRole} disabled={!selectedRole}>
                  Assign Role
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <ScrollArea className="flex-1 h-0">
          <div className="p-6 space-y-6">
            {/* Current User Section */}
            {currentUser && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    Your Profile
                  </CardTitle>
                  <CardDescription>Manage your roles and permissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.email}`} />
                        <AvatarFallback>{currentUser.email.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <p className="font-medium">{currentUser.email}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Current Role:</span>
                          <Badge className={getRoleColor(currentUser.currentRole.name)}>
                            {currentUser.currentRole.name}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Settings className="h-4 w-4 mr-2" />
                          Profile Settings
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Assigned Roles Section */}
            {currentUser && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Assigned Roles</CardTitle>
                  <CardDescription>
                    All roles currently assigned to you ({currentUser.assignedRoles.length} total)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {currentUser.assignedRoles.map((role) => (
                      <div
                        key={role.id}
                        className={`flex items-center justify-between p-4 border rounded-lg ${
                          role.id === currentUser.currentRole.id ? "bg-muted/50 border-primary" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-md bg-muted">
                            <Shield className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{role.name}</span>
                              <Badge className={getRoleColor(role.name)}>{role.name}</Badge>
                              {role.id === currentUser.currentRole.id && (
                                <Badge variant="outline" className="text-xs">
                                  Active
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{role.description}</p>
                          </div>
                        </div>
                        {role.id !== currentUser.currentRole.id && (
                          <Button variant="outline" size="sm">
                            Switch To
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Available Roles Section */}
            <Card>
              <CardHeader>
                <CardTitle>Available Roles</CardTitle>
                <CardDescription>All roles in the system ({allRoles.length} total)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {allRoles.map((role) => {
                    const isAssigned = currentUser?.assignedRoles.some((r) => r.id === role.id)
                    return (
                      <div
                        key={role.id}
                        className={`flex items-center justify-between p-4 border rounded-lg ${
                          isAssigned ? "bg-muted/30" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-md bg-muted">
                            <Shield className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{role.name}</span>
                              <Badge className={getRoleColor(role.name)}>{role.name}</Badge>
                              {isAssigned && (
                                <Badge variant="secondary" className="text-xs">
                                  Assigned
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{role.description}</p>
                          </div>
                        </div>
                        {!isAssigned && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedRole(role.id.toString())
                              setIsAddRoleOpen(true)
                            }}
                          >
                            Assign
                          </Button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
