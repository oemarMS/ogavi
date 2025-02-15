import TemplateDualCaption from '../../components/TemplateDualCaption';

const Template4: React.FC = () => {
  return (
    <TemplateDualCaption 
      aspectRatio={3/4} // atau rasio yang Anda inginkan
      title="Template Dual Caption" 
      needsPermission={true}
    />
  );
};

export default Template4;