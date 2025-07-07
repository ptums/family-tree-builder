import { useDialog } from "@/contexts/DialogContext";
import { Dialog, DialogPanel } from "@headlessui/react";

const ProfileDialog = () => {
  const { selectedSource, setSelectedSource, isOpen, closeDialog } =
    useDialog();

  return (
    <Dialog
      open={isOpen}
      onClose={() => closeDialog()}
      className="relative z-50"
    >
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <DialogPanel className="w-full max-w-3xl space-y-4 border bg-white p-12">
          {selectedSource?.component && <selectedSource.component />}
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default ProfileDialog;
