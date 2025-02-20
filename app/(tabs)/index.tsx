import TemplateBase from "../components/TemplateBase";

const Template1: React.FC = () => {
  return (
    <TemplateBase
      aspectRatio={4 / 3}
      title="Template 4:3"
      needsPermission={true}
    />
  );
};

export default Template1;
