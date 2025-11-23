import React from 'react';
import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <select
      aria-label="Language"
      onChange={changeLanguage}
      value={i18n.language || 'en'}
      className="px-2 py-1 rounded border bg-white text-sm"
    >
      <option value="en">English</option>
      <option value="hi">हिन्दी</option>
      <option value="mr">मराठी</option>
      <option value="pa">ਪੰਜਾਬੀ</option>
      <option value="ta">தமிழ்</option>
      <option value="te">తెలుగు</option>
      <option value="bn">বাংলা</option>
      <option value="gu">ગુજરાતી</option>
    </select>
  );
}