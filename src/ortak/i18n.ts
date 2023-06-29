import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../i18n/en';
import tr from '../i18n/tr';

i18n
  .use(initReactI18next)
  .init({
    resources: {
        en: {
            translation: en
        },
        tr: {
            translation: tr
        }
    },
    fallbackLng: 'en',
    debug: true
  });


export default i18n;