import TemplateImgDual from '../../components/TemplateImgDual';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from '@/components/useColorScheme';

const Template6: React.FC = () => {
  const colorScheme = useColorScheme();
  
  return (
    <>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    <TemplateImgDual 
      aspectRatio={4/3} // atau rasio yang Anda inginkan
      title="Template Dual Caption 2" 
      needsPermission={true}
    />
    </>
  );
};

export default Template6;