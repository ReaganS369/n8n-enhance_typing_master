import React from 'react';
import {
  Utensils,
  ShoppingBag,
  Plane,
  Tag,
  Receipt,
  Film,
  HeartPulse,
  GraduationCap,
  MoreHorizontal,
  LucideProps,
} from 'lucide-react';
import { CategoryId } from '../../types/expense';
import { CATEGORIES } from '../../data/categories';

interface CategoryIconProps extends LucideProps {
  categoryId: CategoryId;
  size?: number;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  categoryId,
  size = 18,
  className = '',
  ...props
}) => {
  const iconProps = { size, className, ...props };

  switch (categoryId) {
    case 'food':
      return <Utensils {...iconProps} />;
    case 'groceries':
      return <ShoppingBag {...iconProps} />;
    case 'travel':
      return <Plane {...iconProps} />;
    case 'shopping':
      return <Tag {...iconProps} />;
    case 'bills':
      return <Receipt {...iconProps} />;
    case 'entertainment':
      return <Film {...iconProps} />;
    case 'health':
      return <HeartPulse {...iconProps} />;
    case 'education':
      return <GraduationCap {...iconProps} />;
    case 'other':
    default:
      return <MoreHorizontal {...iconProps} />;
  }
};

export const CategoryBadge: React.FC<{ categoryId: CategoryId; size?: 'sm' | 'md' }> = ({
  categoryId,
  size = 'md',
}) => {
  const category = CATEGORIES[categoryId] || CATEGORIES.other;
  const isSm = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${category.bgColor} ${
        isSm ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      }`}
    >
      <CategoryIcon categoryId={categoryId} size={isSm ? 12 : 14} />
      <span>{category.name}</span>
    </span>
  );
};
