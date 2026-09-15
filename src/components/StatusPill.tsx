import React from 'react';

type PillVariant = 'primary' | 'success' | 'warning' | 'danger' | 'neutral';

interface StatusPillProps {
  label: string;
  variant?: PillVariant;
  className?: string;
  id?: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({
  label,
  variant = 'neutral',
  className = '',
  id,
}) => {
  const variantStyles: Record<
    PillVariant,
    { bg: string; text: string; dot: string }
  > = {
    primary: {
      bg: 'bg-[#E7EEF7]',
      text: 'text-[#004080]',
      dot: 'bg-[#004080]',
    },
    success: {
      bg: 'bg-[#ECFDF3]',
      text: 'text-[#067647]',
      dot: 'bg-[#067647]',
    },
    warning: {
      bg: 'bg-[#FFFAEB]',
      text: 'text-[#B54708]',
      dot: 'bg-[#B54708]',
    },
    danger: {
      bg: 'bg-[#FEF3F2]',
      text: 'text-[#B42318]',
      dot: 'bg-[#B42318]',
    },
    neutral: {
      bg: 'bg-[#F0F4F9]',
      text: 'text-[#5C6880]',
      dot: 'bg-[#5C6880]',
    },
  };

  const style = variantStyles[variant];

  return (
    <span
      id={id}
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider ${style.bg} ${style.text} ${className}`}
      style={{ whiteSpace: 'nowrap' }}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`} />
      <span>{label}</span>
    </span>
  );
};

export function getCategoryVariant(category: string): PillVariant {
  switch (category) {
    case 'Investor':
      return 'primary';
    case 'Buyer':
      return 'success';
    case 'Seller':
      return 'warning';
    case 'Landlord':
      return 'primary';
    case 'Tenant':
      return 'neutral';
    default:
      return 'neutral';
  }
}

export function getDealStatusVariant(status: string): PillVariant {
  switch (status) {
    case 'Won':
      return 'success';
    case 'Active':
      return 'primary';
    case 'Under Offer':
      return 'warning';
    case 'On Hold':
      return 'neutral';
    case 'Lost':
      return 'danger';
    default:
      return 'neutral';
  }
}

export function getStageVariant(stageId: string): PillVariant {
  switch (stageId) {
    case 'closed':
      return 'success';
    case 'agreement':
    case 'negotiation':
      return 'primary';
    case 'offer-made':
      return 'warning';
    default:
      return 'neutral';
  }
}
