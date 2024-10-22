import { Dialog, DialogTitle, DialogDescription, DialogRoot } from '~/components/ui/Dialog';
import { Register } from '~/components/auth/Register';

interface RegisterDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RegisterDialog({ isOpen, onClose }: RegisterDialogProps) {
  return (
    <DialogRoot open={isOpen}>
      <Dialog onBackdrop={onClose} onClose={onClose}>
        <DialogTitle>注册</DialogTitle>
        <DialogDescription>
          <Register />
        </DialogDescription>
      </Dialog>
    </DialogRoot>
  );
}
