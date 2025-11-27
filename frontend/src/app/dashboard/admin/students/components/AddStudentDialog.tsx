"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AddStudentDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <Input placeholder="Full Name" />
          <Input placeholder="Class" />
          <Input placeholder="Student ID" />
        </div>

        <DialogFooter>
          <Button className="bg-primary hover:bg-primary/80 text-white">
            Save Student
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
