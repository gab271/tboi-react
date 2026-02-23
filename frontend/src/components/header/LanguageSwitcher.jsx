import { useTranslation } from 'react-i18next';
import { FaGlobe } from 'react-icons/fa';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from '../ui/DropdownMenu';

const languages = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
];

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button 
          className="icon-btn"
          aria-label="Change language"
        >
          <FaGlobe className="w-[18px] h-[18px]" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="dropdown-content bg-bg-paper border-2 border-border min-w-[130px] shadow-lg p-1"
      >
        {languages.map((lang) => (
          <DropdownMenuItem 
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={`flex items-center gap-2 px-3 py-2 rounded cursor-pointer text-[13px] hover:bg-bg-paper-dark ${
              currentLang.code === lang.code ? 'text-accent-blood font-semibold' : 'text-text-secondary'
            }`}
          >
            <span>{lang.flag}</span>
            <span className="font-heading">{lang.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default LanguageSwitcher;
