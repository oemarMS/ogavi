import TemplateVideo from '../../components/TemplateVideo';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from '@/components/useColorScheme';

const Template8: React.FC = () => {
  const colorScheme = useColorScheme();

  return (
    <>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <TemplateVideo 
        aspectRatio={3/4} // atau rasio yang Anda inginkan
        title="Template Video" 
        needsPermission={true}
    />
    </>
  );
};

export default Template8;