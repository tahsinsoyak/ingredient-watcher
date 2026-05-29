import React, { useState } from 'react';
import { useWatchlistStore } from '@shared/store/useWatchlistStore';
import type { IngredientCategory } from '@shared/types/ingredients';
import Button from '@shared/components/Button';
import Input from '@shared/components/Input';
import { CATEGORIES } from '@shared/constants/categories';

export function QuickAddTerm(): React.ReactElement {
  const addTerm = useWatchlistStore((s) => s.addTerm);
  const [label, setLabel] = useState('');
  const [category, setCategory] = useState<IngredientCategory>('custom');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;

    await addTerm({
      label: label.trim(),
      aliases: [],
      category,
      severity: 'warning',
      enabled: true,
      notes: 'Quick-added from popup',
    });

    setLabel('');
    setCategory('custom');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="flex-1">
        <Input
          placeholder="Add ingredient..."
          value={label}
          onChange={setLabel}
          className="[&_input]:py-1.5 [&_input]:text-xs [&_input]:rounded-lg"
        />
      </div>
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value as IngredientCategory)}
        className="px-2 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
      >
        {CATEGORIES.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.icon} {cat.label}
          </option>
        ))}
      </select>
      <Button type="submit" size="sm" variant="primary" disabled={!label.trim()} className="px-3">
        Add
      </Button>
    </form>
  );
}
