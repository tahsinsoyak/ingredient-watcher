import type { IngredientCategory } from '../types/ingredients';

export interface CategoryMeta {
  id: IngredientCategory;
  label: string;
  icon: string;
  color: string;
  darkColor: string;
  description: string;
}

export const CATEGORIES: CategoryMeta[] = [
  {
    id: 'food',
    label: 'Food',
    icon: '🍎',
    color: '#F59E0B',
    darkColor: '#FBBF24',
    description: 'Food ingredients and additives',
  },
  {
    id: 'allergen',
    label: 'Allergens',
    icon: '⚠️',
    color: '#EF4444',
    darkColor: '#F87171',
    description: 'Common food and environmental allergens',
  },
  {
    id: 'cosmetics',
    label: 'Cosmetics',
    icon: '💄',
    color: '#EC4899',
    darkColor: '#F472B6',
    description: 'Skincare and cosmetic ingredients',
  },
  {
    id: 'cleaning',
    label: 'Cleaning',
    icon: '🧴',
    color: '#2563EB',
    darkColor: '#60A5FA',
    description: 'Cleaning and household product chemicals',
  },
  {
    id: 'vegan',
    label: 'Vegan',
    icon: '🌱',
    color: '#16A34A',
    darkColor: '#22C55E',
    description: 'Animal-derived ingredients',
  },
  {
    id: 'sensitive_skin',
    label: 'Sensitive Skin',
    icon: '🧬',
    color: '#8B5CF6',
    darkColor: '#A78BFA',
    description: 'Irritants for sensitive skin',
  },
  {
    id: 'custom',
    label: 'Custom',
    icon: '✏️',
    color: '#64748B',
    darkColor: '#94A3B8',
    description: 'Your custom terms',
  },
];

export const CATEGORY_MAP = new Map(CATEGORIES.map((c) => [c.id, c]));

export function getCategoryMeta(id: IngredientCategory): CategoryMeta {
  return CATEGORY_MAP.get(id) ?? CATEGORIES[CATEGORIES.length - 1];
}
