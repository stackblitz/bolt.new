import { Dialog, DialogTitle, DialogDescription, DialogRoot } from '~/components/ui/Dialog';
import { useAuth } from '~/hooks/useAuth';

interface ProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileDialog({ isOpen, onClose }: ProfileDialogProps) {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <DialogRoot open={isOpen}>
      <Dialog onBackdrop={onClose} onClose={onClose}>
        <DialogTitle>个人信息</DialogTitle>
        <DialogDescription>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-bolt-elements-textPrimary">
                昵称
              </label>
              <p className="mt-1 text-bolt-elements-textSecondary">{user.nickname}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-bolt-elements-textPrimary">
                手机号
              </label>
              <p className="mt-1 text-bolt-elements-textSecondary">{user.phone}</p>
            </div>
            {/* 可以根据需要添加更多用户信息 */}
          </div>
        </DialogDescription>
      </Dialog>
    </DialogRoot>
  );
}
