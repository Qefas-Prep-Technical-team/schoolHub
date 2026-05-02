"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Department, CreateDepartmentDTO, UpdateDepartmentDTO } from "../services/departmentService"

const schema = yup.object().shape({
  name: yup.string().required("Name is required").min(2, "Name is too short"),
  code: yup.string().required("Code is required").uppercase().min(2, "Code is too short"),
  description: yup.string().optional(),
})

interface DepartmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => Promise<void>
  department?: Department | null
  schoolId: string | null
}

export default function DepartmentModal({
  isOpen,
  onClose,
  onSave,
  department,
  schoolId,
}: DepartmentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
    },
  })

  useEffect(() => {
    if (department) {
      reset({
        name: department.name,
        code: department.code,
        description: department.description || "",
      })
    } else {
      reset({
        name: "",
        code: "",
        description: "",
      })
    }
  }, [department, reset, isOpen])

  const onSubmit = async (data: any) => {
    if (!schoolId && !department) {
      console.error("School ID is missing")
      return
    }

    setIsSubmitting(true)
    try {
      if (department) {
        const updateData: UpdateDepartmentDTO = {
          name: data.name,
          code: data.code,
          description: data.description,
        }
        await onSave(updateData)
      } else {
        const createData: CreateDepartmentDTO = {
          name: data.name,
          code: data.code,
          description: data.description,
          schoolId: schoolId!,
          scope: "SCHOOL",
        }
        await onSave(createData)
      }
      onClose()
    } catch (error) {
      console.error("Failed to save department:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{department ? "Edit Department" : "Add New Department"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Department Name</Label>
            <Input
              id="name"
              placeholder="e.g. Science"
              {...register("name")}
              className={errors.name ? "border-destructive text-destructive" : ""}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">Department Code</Label>
            <Input
              id="code"
              placeholder="e.g. SCI"
              {...register("code")}
              className={errors.code ? "border-destructive text-destructive" : ""}
            />
            {errors.code && <p className="text-xs text-destructive">{errors.code.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Brief description of the department"
              rows={3}
              {...register("description")}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : department ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

