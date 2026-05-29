import React, { useState, useEffect } from 'react';
import { getFalsePositives, deleteFalsePositive, clearFalsePositives } from '@shared/lib/storage';
import type { FalsePositiveRule } from '@shared/types/ingredients';
import Button from '@shared/components/Button';
import Card from '@shared/components/Card';

export function FalsePositiveRules(): React.ReactElement {
  const [rules, setRules] = useState<FalsePositiveRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      const data = await getFalsePositives();
      setRules(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteFalsePositive(id);
    await loadRules();
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all ignore rules?')) {
      await clearFalsePositives();
      await loadRules();
    }
  };

  if (loading) {
    return <div className="text-slate-500">Loading rules...</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">Ignored Matches / False Positives</h3>
          {rules.length > 0 && (
            <Button variant="danger" size="sm" onClick={handleClearAll}>
              Clear All Rules
            </Button>
          )}
        </div>

        {rules.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No false positive rules defined yet. You can ignore specific matches directly from the popup matching list.
          </p>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {rules.map((rule) => (
              <div key={rule.id} className="py-3.5 flex items-center justify-between gap-4">
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white">{rule.term}</span>
                  {rule.domain && (
                    <span className="ml-2 text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full">
                      Only on {rule.domain}
                    </span>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(rule.id)}>
                  Delete Rule
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
