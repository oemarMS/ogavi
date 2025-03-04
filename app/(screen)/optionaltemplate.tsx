import OptionalTemplate from "../components/OptionalTemplate";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "@/app/components/useColorScheme";

const OptionalTemplateScreen: React.FC = () => {
    const colorScheme = useColorScheme();

  return (
    <>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <OptionalTemplate />
    </>
  );
};

export default OptionalTemplateScreen;