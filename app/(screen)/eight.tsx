import TemplateVideo from "../components/TemplateVideo";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "@/app/components/useColorScheme";

const Template8: React.FC = () => {
  const colorScheme = useColorScheme();

  return (
    <>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <TemplateVideo
        title="Template Video"
        needsPermission={true}
      />
    </>
  );
};

export default Template8;
