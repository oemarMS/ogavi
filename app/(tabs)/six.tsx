import TemplateImgDual from '../../components/TemplateImgDual';

const Template4: React.FC = () => {
  return (
    <TemplateImgDual 
      aspectRatio={4/3} // atau rasio yang Anda inginkan
      title="Template Dual Caption" 
      needsPermission={true}
    />
  );
};

export default Template4;