import { LazyTextArea } from "~/lazy";
import SettingItem from "../SettingItem";

interface BiliCookieProps {
  cookie?: string;
  onChange?: (cookie: string) => void;
}

const BiliCookie = (props: BiliCookieProps) => {
  return (
    <SettingItem label="B 站 Cookie" orientation="vertical">
      <LazyTextArea
        placeholder="不看 B 站直播无需配置此项"
        rows={15}
        value={props.cookie}
        onChange={props.onChange}
      />
    </SettingItem>
  );
};

export default BiliCookie;
