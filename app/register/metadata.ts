import { Metadata } from 'next';
import { capitalizeTheFirstLetter } from '@/utils';
import { APPNAME } from '@/config';
 
export const metadata: Metadata = {
  title: {
    template: `%s | ${capitalizeTheFirstLetter(APPNAME)}`,
    default: `Register | ${capitalizeTheFirstLetter(APPNAME)}`,
  },
  description: 'Realtime test proctoring',
//   metadataBase: new URL('https://next-learn-dashboard.vercel.sh'),
};