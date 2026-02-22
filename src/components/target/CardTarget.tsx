import { useState } from 'react';
import { Input } from '../ui/input';
import { cn } from '@/lib/utils';
import { CreditCard } from 'lucide-react';
import { 
  SiVisa, 
  SiMastercard, 
  SiAmericanexpress 
} from 'react-icons/si';
import { FaCcDiscover, FaCcDinersClub, FaCcJcb } from 'react-icons/fa';

type CardType = 'visa' | 'mastercard' | 'amex' | 'discover' | 'diners' | 'jcb' | 'unknown';

interface CardPattern {
  type: CardType;
  pattern: RegExp;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const cardPatterns: CardPattern[] = [
  {
    type: 'visa',
    pattern: /^4/,
    icon: SiVisa,
    color: 'text-[#1A1F71]'
  },
  {
    type: 'mastercard',
    pattern: /^(5[1-5]|2[2-7])/,
    icon: SiMastercard,
    color: 'text-[#EB001B]'
  },
  {
    type: 'amex',
    pattern: /^3[47]/,
    icon: SiAmericanexpress,
    color: 'text-[#006FCF]'
  },
  {
    type: 'discover',
    pattern: /^(6011|65|64[4-9])/,
    icon: FaCcDiscover,
    color: 'text-[#FF6000]'
  },
  {
    type: 'diners',
    pattern: /^3[068]/,
    icon: FaCcDinersClub,
    color: 'text-[#0079BE]'
  },
  {
    type: 'jcb',
    pattern: /^35/,
    icon: FaCcJcb,
    color: 'text-[#0E4C96]'
  }
];

interface CardInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  onCardTypeChange?: (type: CardType) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string;
}

export function CardInput({ onCardTypeChange, onChange, value = '', className, ...props }: CardInputProps) {
  const [cardType, setCardType] = useState<CardType>('unknown');

  const detectCardType = (number: string): CardType => {
    const cleanNumber = number.replace(/\s+/g, '');
    
    for (const pattern of cardPatterns) {
      if (pattern.pattern.test(cleanNumber)) {
        return pattern.type;
      }
    }
    
    return 'unknown';
  };

  const formatCardNumber = (inputValue: string, currentType: CardType) => {
    const v = inputValue.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const parts = [];

    // American Express usa formato 4-6-5
    if (currentType === 'amex') {
      if (v.length > 0) parts.push(v.substring(0, 4));
      if (v.length > 4) parts.push(v.substring(4, 10));
      if (v.length > 10) parts.push(v.substring(10, 15));
    } else {
      // Otras tarjetas usan formato 4-4-4-4
      for (let i = 0; i < v.length && i < 16; i += 4) {
        parts.push(v.substring(i, i + 4));
      }
    }

    return parts.filter(Boolean).join(' ');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Detectar tipo de tarjeta primero
    const type = detectCardType(inputValue);
    setCardType(type);
    
    if (onCardTypeChange) {
      onCardTypeChange(type);
    }

    // Formatear el número
    const formatted = formatCardNumber(inputValue, type);
    
    // Crear nuevo evento con valor formateado
    const newEvent = {
      ...e,
      target: {
        ...e.target,
        value: formatted
      }
    } as React.ChangeEvent<HTMLInputElement>;

    // Llamar al onChange del padre con el valor formateado
    if (onChange) {
      onChange(newEvent);
    }
  };

  const currentPattern = cardPatterns.find(p => p.type === cardType);
  const CardIcon = currentPattern?.icon || CreditCard;
  const iconColor = currentPattern?.color || 'text-muted-foreground';

  const maxLength = cardType === 'amex' ? 17 : 19;

  return (
    <div className="relative">
      <Input
        {...props}
        type="text"
        inputMode="numeric"
        value={value}
        onChange={handleChange}
        maxLength={maxLength}
        className={cn('pr-12', className)}
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <CardIcon 
          className={cn(
            'h-6 w-6 transition-all duration-300',
            cardType === 'unknown' ? 'opacity-40' : 'opacity-100',
            iconColor
          )} 
        />
      </div>
    </div>
  );
}

// Componente auxiliar para mostrar las tarjetas aceptadas (solo visuales pequeños)
export function AcceptedCards() {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span>Aceptamos:</span>
      <div className="flex items-center gap-1.5 opacity-60">
        <SiVisa className="h-4 w-4" />
        <SiMastercard className="h-4 w-4" />
        <SiAmericanexpress className="h-4 w-4" />
        <FaCcDiscover className="h-4 w-4" />
        <FaCcDinersClub className="h-4 w-4" />
        <FaCcJcb className="h-4 w-4" />
      </div>
    </div>
  );
}