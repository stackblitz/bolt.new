import { useState } from 'react';
import { Dialog, DialogTitle, DialogDescription } from '~/components/ui/Dialog';
import { Register } from '~/components/auth/Register';

interface RegisterDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RegisterDialog({ isOpen, onClose }: RegisterDialogProps) {
  return (
    <Dialog onClose={onClose}>
      {isOpen && (
        <>
          <DialogTitle>注册</DialogTitle>
          <DialogDescription>
            <Register />
          </DialogDescription>
        </>
      )}
    </Dialog>
  );
}
