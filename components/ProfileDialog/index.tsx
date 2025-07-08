import { useDialog } from "@/contexts/DialogContext";
import { Dialog, Transition, TransitionChild } from "@headlessui/react";
import { Fragment } from "react";

const ProfileDialog = () => {
  const { selectedSource, isOpen, closeDialog } = useDialog();

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed z-50 inset-0 overflow-y-auto"
        onClose={closeDialog}
      >
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <span
            className="hidden sm:inline-block sm:align-middle sm:h-screen"
            aria-hidden="true"
          >
            &#8203;
          </span>
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle max-w-full sm:max-w-5xl sm:w-full sm:p-6">
              {selectedSource?.component && <selectedSource.component />}
            </div>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ProfileDialog;
