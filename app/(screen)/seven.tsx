import TemplateImgQuad from '../components/TemplateImgQuad';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from '@/app/components/useColorScheme';

const Template7: React.FC = () => {
  const colorScheme = useColorScheme();

  return (
    <>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <TemplateImgQuad 
        aspectRatio={16/9} // atau rasio yang Anda inginkan
        title="Template Quad Caption" 
        needsPermission={true}
    />
    </>
  );
};

export default Template7;