import { SOURCES, useDialog } from "@/contexts/DialogContext";
import { SourceKeys } from "@/types/DialogContext";
import classNames from "classnames";

const HELPER_TEXT = [
  "* Click person's name for more details",
  "* Move mouse left & right and scroll to view all of the tree",
];

const HelperText = ({ topPosition }: { topPosition: string }) => {
  const { openDialog } = useDialog();
  return (
    <div className={classNames("relative left-2/5", topPosition)}>
      {HELPER_TEXT.map((txt) => (
        <p key={txt} className="text-sm font-bold">
          {txt}
        </p>
      ))}
      <button
        className="text-sm cursor-pointer"
        onClick={() => {
          openDialog(null, {
            key: SourceKeys.EDIT_NODE,
            component: SOURCES[SourceKeys.EDIT_NODE],
          });
        }}
      >
        *{" "}
        <span className="underline cursor-pointer">
          Click to add new member
        </span>
      </button>
    </div>
  );
};

export default HelperText;
