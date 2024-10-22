import { useState } from 'react';
import { Dialog, DialogTitle, DialogDescription } from '~/components/ui/Dialog';
import { Login } from '~/components/auth/Login';

interface LoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginDialog({ isOpen, onClose }: LoginDialogProps) {
  return (
    <Dialog onClose={onClose}>
      {isOpen && (
        <>
          <DialogTitle>登录</DialogTitle>
          <DialogDescription>
            <Login />
          </DialogDescription>
        </>
      )}
    </Dialog>
  );
}
