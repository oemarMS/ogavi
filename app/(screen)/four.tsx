import TemplateDual from '../../components/TemplateDual';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from '@/components/useColorScheme';

const Template4: React.FC = () => {
  const colorScheme = useColorScheme();
  
  return (
    <>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <TemplateDual 
        aspectRatio={3/4}
        title="Template Dual" 
        needsPermission={true}
      />
    </>
  );
};

export default Template4;
