import React, { useState, useMemo, useCallback } from 'react';
import { useWatchlistStore } from '@shared/store/useWatchlistStore';
import type { IngredientCategory, MatchSeverity } from '@shared/types/ingredients';
import { CATEGORIES, getCategoryMeta } from '@shared/constants/categories';
import { sanitizeTerm, validateTerm } from '@shared/lib/sanitize';
import { useStrings } from '@shared/lib/i18n';
import { InboxIcon, PlusIcon, TrashIcon } from '@shared/components/Icons';
import Switch from '@shared/components/Switch';

// ─── Types ───────────────────────────────────────────────────────
type SortOption = 'name' | 'category' | 'date';

interface TermFormData {
  label: string;
  aliases: string;
  category: IngredientCategory;
  severity: MatchSeverity;
  notes: string;
  enabled: boolean;
}

const EMPTY_FORM: TermFormData = {
  label: '',
  aliases: '',
  category: 'custom',
  severity: 'warning',
  notes: '',
  enabled: true,
};

const SEVERITY_OPTIONS: { value: MatchSeverity; label: string; color: string; darkColor: string }[] = [
  { value: 'info', label: 'Info', color: 'bg-green-100 text-green-700', darkColor: 'dark:bg-green-900/30 dark:text-green-400' },
  { value: 'notice', label: 'Notice', color: 'bg-blue-100 text-blue-700', darkColor: 'dark:bg-blue-900/30 dark:text-blue-400' },
  { value: 'warning', label: 'Warning', color: 'bg-amber-100 text-amber-700', darkColor: 'dark:bg-amber-900/30 dark:text-amber-400' },
];

// ─── Term Form ───────────────────────────────────────────────────
function TermForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  initial: TermFormData;
  onSubmit: (data: TermFormData) => void;
  onCancel: () => void;
  submitLabel: string;
}): React.ReactElement {
  const [form, setForm] = useState<TermFormData>(initial);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sanitized = sanitizeTerm(form.label);
    const validation = validateTerm(sanitized);
    if (!validation.valid) {
      setError(validation.error ?? 'Invalid term');
      return;
    }
    setError(null);
    onSubmit({ ...form, label: sanitized });
  };

  const inputClass =
    'w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow';

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-slide-in">
      {error && (
        <div className="px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </div>
      )}

      {/* Label */}
      <div>
        <label htmlFor="term-label" className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
          Label <span className="text-red-500">*</span>
        </label>
        <input
          id="term-label"
          type="text"
          value={form.label}
          onChange={(e) => setForm({ ...form, label: e.target.value })}
          placeholder="e.g. Paraben"
          className={inputClass}
          required
          autoFocus
        />
      </div>

      {/* Aliases */}
      <div>
        <label htmlFor="term-aliases" className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
          Aliases <span className="text-slate-400 dark:text-slate-500 font-normal">(comma-separated)</span>
        </label>
        <textarea
          id="term-aliases"
          value={form.aliases}
          onChange={(e) => setForm({ ...form, aliases: e.target.value })}
          placeholder="methylparaben, propylparaben, butylparaben"
          rows={2}
          className={inputClass + ' resize-none'}
        />
      </div>

      {/* Category + Severity row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="term-category" className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
            Category
          </label>
          <select
            id="term-category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value as IngredientCategory })}
            className={inputClass}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="term-severity" className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
            Severity
          </label>
          <select
            id="term-severity"
            value={form.severity}
            onChange={(e) => setForm({ ...form, severity: e.target.value as MatchSeverity })}
            className={inputClass}
          >
            {SEVERITY_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="term-notes" className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
          Notes <span className="text-slate-400 dark:text-slate-500 font-normal">(optional)</span>
        </label>
        <textarea
          id="term-notes"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="Personal notes about this ingredient..."
          rows={2}
          className={inputClass + ' resize-none'}
        />
      </div>

      {/* Enabled toggle */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-700 dark:text-slate-300">Enabled</span>
        <Switch
          checked={form.enabled}
          onChange={(val) => setForm({ ...form, enabled: val })}
          label="Enable term"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold
            shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2
            dark:focus:ring-offset-slate-900"
        >
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-sm font-medium
            text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ─── Main WatchlistEditor ────────────────────────────────────────
export function WatchlistEditor(): React.ReactElement {
  const strings = useStrings();
  const { terms, loading, addTerm, updateTerm, deleteTerm, toggleTerm } = useWatchlistStore();
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filter & sort
  const filteredTerms = useMemo(() => {
    let result = terms;

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.label.toLowerCase().includes(q) ||
          t.aliases.some((a) => a.toLowerCase().includes(q)) ||
          t.category.toLowerCase().includes(q)
      );
    }

    // Sort
    return [...result].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.label.localeCompare(b.label);
        case 'category':
          return a.category.localeCompare(b.category) || a.label.localeCompare(b.label);
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });
  }, [terms, search, sortBy]);

  // Selection helpers
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(filteredTerms.map((t) => t.id)));
  }, [filteredTerms]);

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const handleAdd = async (data: TermFormData) => {
    const aliases = data.aliases
      .split(',')
      .map((a) => sanitizeTerm(a))
      .filter(Boolean);

    await addTerm({
      label: data.label,
      aliases,
      category: data.category,
      severity: data.severity,
      notes: data.notes || undefined,
      enabled: data.enabled,
    });
    setShowAddForm(false);
  };

  const handleUpdate = async (id: string, data: TermFormData) => {
    const aliases = data.aliases
      .split(',')
      .map((a) => sanitizeTerm(a))
      .filter(Boolean);

    await updateTerm(id, {
      label: data.label,
      aliases,
      category: data.category,
      severity: data.severity,
      notes: data.notes || undefined,
      enabled: data.enabled,
    });
    setEditingId(null);
  };

  const handleBulkDelete = async () => {
    for (const id of selectedIds) {
      await deleteTerm(id);
    }
    setSelectedIds(new Set());
  };

  const handleBulkEnable = async (enabled: boolean) => {
    for (const id of selectedIds) {
      await updateTerm(id, { enabled });
    }
    setSelectedIds(new Set());
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-shimmer" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Toolbar ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search terms, aliases, categories…"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600
              bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white
              placeholder-slate-400 dark:placeholder-slate-500
              focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
            aria-label="Search watchlist terms"
          />
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600
            bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-300
            focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow"
          aria-label="Sort terms"
        >
          <option value="name">Sort by name</option>
          <option value="category">Sort by category</option>
          <option value="date">Sort by date</option>
        </select>

        {/* Select All */}
        {filteredTerms.length > 0 && (
          <button
            onClick={selectedIds.size === filteredTerms.length ? deselectAll : selectAll}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200
              dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium transition-colors"
          >
            {selectedIds.size === filteredTerms.length ? 'Deselect All' : 'Select All'}
          </button>
        )}

        {/* Add button */}
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditingId(null);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700
            text-white text-sm font-semibold shadow-sm transition-colors
            focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
        >
          <PlusIcon className="w-4 h-4" />
          {strings.options.addTerm}
        </button>
      </div>

      {/* ── Add Form ──────────────────────────────────────────── */}
      {showAddForm && (
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-dark shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Add new term</h3>
          <TermForm
            initial={EMPTY_FORM}
            onSubmit={(data) => void handleAdd(data)}
            onCancel={() => setShowAddForm(false)}
            submitLabel="Add term"
          />
        </div>
      )}

      {/* ── Bulk Actions ──────────────────────────────────────── */}
      {selectedIds.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 rounded-xl bg-brand-50 dark:bg-brand-900/20
          border border-brand-200 dark:border-brand-800/40 animate-slide-in">
          <span className="text-sm font-medium text-brand-700 dark:text-brand-400">
            {selectedIds.size} selected
          </span>
          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => void handleBulkEnable(true)}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600
                text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Enable all
            </button>
            <button
              onClick={() => void handleBulkEnable(false)}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600
                text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Disable all
            </button>
            <button
              onClick={() => void handleBulkDelete()}
              className="px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600
                text-xs font-medium text-white transition-colors"
            >
              Delete selected
            </button>
            <button
              onClick={deselectAll}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 dark:text-slate-400
                hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* ── Term List ─────────────────────────────────────────── */}
      {filteredTerms.length === 0 ? (
        <div className="py-16 text-center">
          <InboxIcon className="w-10 h-10 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {terms.length === 0
              ? 'No terms in your watchlist yet. Add your first term or import a preset pack.'
              : 'No terms match your search.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTerms.map((term) => {
            const cat = getCategoryMeta(term.category);
            const sev = SEVERITY_OPTIONS.find((s) => s.value === term.severity);
            const isEditing = editingId === term.id;
            const isSelected = selectedIds.has(term.id);
            const isDeleting = deleteConfirmId === term.id;

            return (
              <div
                key={term.id}
                className={`
                  rounded-2xl border transition-all duration-200
                  ${
                    isSelected
                      ? 'border-brand-300 dark:border-brand-700 bg-brand-50/50 dark:bg-brand-900/10'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-dark'
                  }
                  ${!term.enabled ? 'opacity-60' : ''}
                `}
              >
                {/* Term Row */}
                <div className="flex items-center gap-3 px-4 py-3">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(term.id)}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-600
                      text-brand-600 focus:ring-brand-500 dark:bg-slate-800 cursor-pointer"
                    aria-label={`Select ${term.label}`}
                  />

                  {/* Term info */}
                  <button
                    onClick={() => setEditingId(isEditing ? null : term.id)}
                    className="flex-1 flex items-center gap-3 text-left min-w-0"
                    aria-expanded={isEditing}
                    aria-label={`${isEditing ? 'Collapse' : 'Expand'} ${term.label}`}
                  >
                    <span className="text-lg" role="img" aria-hidden="true">
                      {cat.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {term.label}
                        </span>
                        <span
                          className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold"
                          style={{
                            backgroundColor: cat.color + '18',
                            color: cat.color,
                          }}
                        >
                          {cat.label}
                        </span>
                        {sev && (
                          <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold ${sev.color} ${sev.darkColor}`}>
                            {sev.label}
                          </span>
                        )}
                      </div>
                      {term.aliases.length > 0 && (
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                          {term.aliases.length} alias{term.aliases.length !== 1 ? 'es' : ''}: {term.aliases.slice(0, 3).join(', ')}
                          {term.aliases.length > 3 && ` +${term.aliases.length - 3}`}
                        </p>
                      )}
                    </div>
                  </button>

                  {/* Toggle + Delete */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Switch
                      checked={term.enabled}
                      onChange={() => void toggleTerm(term.id)}
                      label={`Toggle ${term.label}`}
                    />
                    <button
                      onClick={() => setDeleteConfirmId(isDeleting ? null : term.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50
                        dark:hover:bg-red-900/20 transition-colors"
                      aria-label={`Delete ${term.label}`}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Delete Confirmation */}
                {isDeleting && (
                  <div className="px-4 pb-3 animate-slide-in">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-800/40">
                      <span className="text-sm text-red-600 dark:text-red-400 flex-1">
                        Delete &ldquo;{term.label}&rdquo;?
                      </span>
                      <button
                        onClick={async () => {
                          await deleteTerm(term.id);
                          setDeleteConfirmId(null);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-semibold transition-colors"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-800/40 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Edit Form */}
                {isEditing && (
                  <div className="px-4 pb-4 border-t border-slate-100 dark:border-slate-700/60 pt-4">
                    <TermForm
                      initial={{
                        label: term.label,
                        aliases: term.aliases.join(', '),
                        category: term.category,
                        severity: term.severity,
                        notes: term.notes ?? '',
                        enabled: term.enabled,
                      }}
                      onSubmit={(data) => void handleUpdate(term.id, data)}
                      onCancel={() => setEditingId(null)}
                      submitLabel="Save changes"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Stats ─────────────────────────────────────────────── */}
      {terms.length > 0 && (
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700/60 flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400">
          <span>{terms.length} total term{terms.length !== 1 ? 's' : ''}</span>
          <span>{terms.filter((t) => t.enabled).length} enabled</span>
          <span>{terms.filter((t) => !t.enabled).length} disabled</span>
        </div>
      )}
    </div>
  );
}
