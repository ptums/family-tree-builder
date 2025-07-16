import { useDialog } from "@/contexts/DialogContext";

const CloseDialog = () => {
  const { closeDialog } = useDialog();
  return (
    <button
      className="bg-red-600 rounded-full text-white py-1 px-4 cursor-pointer hover:bg-red-500"
      onClick={() => closeDialog()}
    >
      Close
    </button>
  );
};

export default CloseDialog;
