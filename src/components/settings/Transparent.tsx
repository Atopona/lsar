import { AiOutlineCheck, AiOutlineClose } from "solid-icons/ai";
import { LazyLabel, LazySpace, LazySwitch } from "~/lazy";

interface TransparentProps {
  enabled: boolean;
  onSwitch: (enabled: boolean) => void;
}

const Transparent = (props: TransparentProps) => {
  return (
    <LazySpace gap={16} justify="between">
      <LazyLabel>窗口透明</LazyLabel>

      <LazySwitch
        checked={props.enabled}
        setChecked={props.onSwitch}
        size="small"
        checkedChild={<AiOutlineCheck />}
        uncheckedChild={<AiOutlineClose />}
      />
    </LazySpace>
  );
};

export default Transparent;
