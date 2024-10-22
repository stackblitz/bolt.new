import { Dialog, DialogTitle, DialogDescription, DialogRoot } from '~/components/ui/Dialog';
import { Login } from '~/components/auth/Login';

interface LoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginDialog({ isOpen, onClose }: LoginDialogProps) {
  return (
    <DialogRoot open={isOpen}>
      <Dialog onBackdrop={onClose} onClose={onClose}>
        <DialogTitle>登录</DialogTitle>
        <DialogDescription>
          <Login />
        </DialogDescription>
      </Dialog>
    </DialogRoot>
  );
}
