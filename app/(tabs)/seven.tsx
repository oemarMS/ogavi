import TemplateImgQuad from '../../components/TemplateImgQuad';

const Template7: React.FC = () => {
  return (
    <TemplateImgQuad 
      aspectRatio={16/9} // atau rasio yang Anda inginkan
      title="Template Quad Caption" 
      needsPermission={true}
    />
  );
};

export default Template7;