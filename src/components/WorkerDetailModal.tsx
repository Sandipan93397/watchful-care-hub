import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WorkerDetailModalProps {
  workerId: string;
  onClose: () => void;
}

const WorkerDetailModal: React.FC<WorkerDetailModalProps> = ({ workerId, onClose }) => {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="industrial-card border-border max-w-2xl">
        <DialogHeader>
          <DialogTitle>Worker Details</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-muted-foreground">Worker ID: {workerId}</p>
          <p className="text-muted-foreground mt-2">Detailed health charts and reports will appear here.</p>
        </div>
        <Button variant="outline" onClick={onClose}>Close</Button>
      </DialogContent>
    </Dialog>
  );
};

export default WorkerDetailModal;
