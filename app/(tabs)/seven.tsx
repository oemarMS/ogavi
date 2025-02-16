import TemplateImgQuad from '../../components/TemplateImgQuad';

const Template4: React.FC = () => {
  return (
    <TemplateImgQuad 
      aspectRatio={4/3} // atau rasio yang Anda inginkan
      title="Template Quad Caption" 
      needsPermission={true}
    />
  );
};

export default Template4;