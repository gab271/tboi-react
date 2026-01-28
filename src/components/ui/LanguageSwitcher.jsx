import { useTranslation } from 'react-i18next';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from './DropdownMenu';
import { Button } from './Button';
import { FaCheck } from 'react-icons/fa';
import { cn } from '../../lib/utils';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'es', label: 'Español', flag: '🇪🇸' }
  ];

  const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2 px-3 text-muted hover:text-fg hover:bg-white/5 data-[state=open]:bg-white/5 transition-all duration-200 border border-transparent data-[state=open]:border-white/10 rounded-full"
        >
          <span className="text-lg leading-none filter drop-shadow-sm">{currentLang.flag}</span>
          <span className="font-medium text-xs uppercase tracking-wider hidden sm:inline-block opacity-80 group-hover:opacity-100">{currentLang.code}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px] bg-bg-1/95 backdrop-blur-xl border border-white/10 text-fg shadow-2xl animate-in zoom-in-95 slide-in-from-top-2 rounded-xl p-1.5">
        {languages.map((lang) => (
          <DropdownMenuItem 
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={cn(
              "flex items-center justify-between cursor-pointer py-2.5 px-3 rounded-lg transition-all duration-200",
              "hover:bg-white/10 focus:bg-white/10 focus:text-gold outline-none",
              i18n.language === lang.code ? "bg-white/5 text-gold font-medium ring-1 ring-white/5" : "text-muted-foreground hover:text-fg"
            )}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl leading-none">{lang.flag}</span>
              <span className="text-sm">{lang.label}</span>
            </div>
            {i18n.language === lang.code && (
              <FaCheck size={12} className="text-gold animate-in fade-in zoom-in" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
