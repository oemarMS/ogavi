import TemplateDualCaption from '../components/TemplateDualCaption';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from '@/app/components/useColorScheme';

const Template5: React.FC = () => {
  const colorScheme = useColorScheme();

  return (
    <>
    <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    <TemplateDualCaption 
      aspectRatio={3/4} // atau rasio yang Anda inginkan
      title="Template Dual Caption" 
      needsPermission={true}
    />
    </>
  );
};

export default Template5;