import React, { useState } from 'react';
import { Profile, Package, Lead } from '../../../types';
import { SettingsCategoryDrafts, SettingsCategoryKey } from '../types/settings.types';
import { settingsService } from '../services/settings.service';
import {
  DEFAULT_INCOME_CATEGORIES,
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_PROJECT_TYPES,
  DEFAULT_EVENT_TYPES,
  DEFAULT_PACKAGE_CATEGORIES,
  DEFAULT_LEAD_SOURCES,
} from '../../../constants';

export function useCategorySettings(
  profile: Profile,
  setProfile: React.Dispatch<React.SetStateAction<Profile>>,
  packages: Package[],
  setPackages: React.Dispatch<React.SetStateAction<Package[]>>,
  leads: Lead[],
) {
  const [incomeCategoryInput, setIncomeCategoryInput] = useState('');
  const [editingIncomeCategory, setEditingIncomeCategory] = useState<string | null>(null);

  const [expenseCategoryInput, setExpenseCategoryInput] = useState('');
  const [editingExpenseCategory, setEditingExpenseCategory] = useState<string | null>(null);

  const [projectTypeInput, setProjectTypeInput] = useState('');
  const [editingProjectType, setEditingProjectType] = useState<string | null>(null);

  const [eventTypeInput, setEventTypeInput] = useState('');
  const [editingEventType, setEditingEventType] = useState<string | null>(null);

  const [packageCategoryInput, setPackageCategoryInput] = useState('');
  const [editingPackageCategory, setEditingPackageCategory] = useState<string | null>(null);

  const [leadSourceInput, setLeadSourceInput] = useState('');
  const [editingLeadSource, setEditingLeadSource] = useState<string | null>(null);

  const [categoryDrafts, setCategoryDrafts] = useState<SettingsCategoryDrafts>({});
  const [categorySavingKey, setCategorySavingKey] = useState<SettingsCategoryKey | null>(null);
  const [packageCategoryRenames, setPackageCategoryRenames] = useState<Record<string, string>>({});

  const getPersistedCategoryValues = (key: SettingsCategoryKey): string[] => {
    const profileValues = profile[key] ?? [];
    if (key !== 'packageCategories') return profileValues;
    return Array.from(new Set([...profileValues, ...packages.map(pkg => pkg.category).filter(Boolean)]));
  };

  const getCategoryValues = (key: SettingsCategoryKey): string[] => {
    return categoryDrafts[key] ?? getPersistedCategoryValues(key);
  };

  const stageCategoryValues = (key: SettingsCategoryKey, values: string[]) => {
    const persistedValues = getPersistedCategoryValues(key);
    const isUnchanged =
      values.length === persistedValues.length &&
      values.every((value, index) => value === persistedValues[index]);
    setCategoryDrafts(previous => {
      const next = { ...previous };
      if (isUnchanged) delete next[key];
      else next[key] = values;
      return next;
    });
  };

  const categoryHasChanges = (key: SettingsCategoryKey): boolean => {
    return categoryDrafts[key] !== undefined;
  };

  const saveCategoryChanges = async (key: SettingsCategoryKey) => {
    if (!profile.id || !categoryHasChanges(key)) return;
    const values = getCategoryValues(key);
    setCategorySavingKey(key);
    try {
      const { updatedProfile, updatedPackages } = await settingsService.saveCategoryChanges(
        profile.id,
        key,
        values,
        packageCategoryRenames,
        packages,
      );

      if (updatedPackages && updatedPackages.length > 0) {
        const updatedById = new Map(updatedPackages.map(pkg => [pkg.id, pkg]));
        setPackages(current => current.map(pkg => updatedById.get(pkg.id) ?? pkg));
      }

      setProfile(current => ({
        ...current,
        [key]: (updatedProfile[key] as string[] | undefined) ?? values,
      }));

      setCategoryDrafts(previous => {
        const next = { ...previous };
        delete next[key];
        return next;
      });

      if (key === 'packageCategories') {
        setPackageCategoryRenames({});
      }
    } catch (error: unknown) {
      console.error(`[useCategorySettings] Save ${key} failed:`, error);
      alert('Gagal menyimpan kategori: ' + ((error as Error)?.message || 'Coba lagi.'));
    } finally {
      setCategorySavingKey(null);
    }
  };

  const stageCategoryInput = (
    key: SettingsCategoryKey,
    input: string,
    editingValue: string | null,
    setInput: React.Dispatch<React.SetStateAction<string>>,
    setEditingValue: React.Dispatch<React.SetStateAction<string | null>>,
    duplicateMessage: string,
  ): boolean => {
    const value = input.trim();
    if (!value) return false;
    const current = getCategoryValues(key);
    if (editingValue !== null) {
      if (value !== editingValue && current.includes(value)) {
        alert(duplicateMessage);
        return false;
      }
      stageCategoryValues(
        key,
        current.map(item => (item === editingValue ? value : item)),
      );
      setEditingValue(null);
    } else {
      if (current.includes(value)) {
        alert(duplicateMessage);
        return false;
      }
      stageCategoryValues(key, [...current, value]);
    }
    setInput('');
    return true;
  };

  const stageCategoryDelete = (
    key: SettingsCategoryKey,
    value: string,
    isInUse: boolean,
    inUseMessage: string,
    confirmMessage: string,
  ) => {
    if (isInUse) {
      alert(inUseMessage);
      return;
    }
    if (window.confirm(confirmMessage)) {
      stageCategoryValues(key, getCategoryValues(key).filter(item => item !== value));
    }
  };

  const stageCategoryMove = (key: SettingsCategoryKey, value: string, direction: 'up' | 'down') => {
    const current = [...getCategoryValues(key)];
    const currentIndex = current.indexOf(value);
    if (currentIndex === -1) return;
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= current.length) return;
    [current[currentIndex], current[targetIndex]] = [current[targetIndex], current[currentIndex]];
    stageCategoryValues(key, current);
  };

  const stageSuggestedCategories = (key: SettingsCategoryKey, suggested: string[]) => {
    const current = getCategoryValues(key);
    const missing = suggested.filter(value => !current.includes(value));
    if (missing.length > 0) stageCategoryValues(key, [...current, ...missing]);
  };

  // Income
  const handleAddOrUpdateIncomeCategory = () => {
    stageCategoryInput('incomeCategories', incomeCategoryInput, editingIncomeCategory, setIncomeCategoryInput, setEditingIncomeCategory, 'Kategori ini sudah ada.');
  };
  const handleEditIncomeCategory = (cat: string) => { setEditingIncomeCategory(cat); setIncomeCategoryInput(cat); };
  const handleDeleteIncomeCategory = (cat: string) => stageCategoryDelete('incomeCategories', cat, false, '', `Yakin ingin menghapus kategori "${cat}"?`);

  // Expense
  const handleAddOrUpdateExpenseCategory = () => {
    stageCategoryInput('expenseCategories', expenseCategoryInput, editingExpenseCategory, setExpenseCategoryInput, setEditingExpenseCategory, 'Kategori ini sudah ada.');
  };
  const handleEditExpenseCategory = (cat: string) => { setEditingExpenseCategory(cat); setExpenseCategoryInput(cat); };
  const handleDeleteExpenseCategory = (cat: string) => stageCategoryDelete('expenseCategories', cat, false, '', `Yakin ingin menghapus kategori "${cat}"?`);

  // Project Types
  const handleAddOrUpdateProjectType = () => {
    stageCategoryInput('projectTypes', projectTypeInput, editingProjectType, setProjectTypeInput, setEditingProjectType, 'Jenis Acara Pernikahan ini sudah ada.');
  };
  const handleEditProjectType = (type: string) => { setEditingProjectType(type); setProjectTypeInput(type); };
  const handleDeleteProjectType = (type: string) => stageCategoryDelete('projectTypes', type, false, '', `Yakin ingin menghapus jenis Acara Pernikahan "${type}"?`);

  // Event Types
  const handleAddOrUpdateEventType = () => {
    stageCategoryInput('eventTypes', eventTypeInput, editingEventType, setEventTypeInput, setEditingEventType, 'Jenis Acara Pernikahan internal ini sudah ada.');
  };
  const handleEditEventType = (type: string) => { setEditingEventType(type); setEventTypeInput(type); };
  const handleDeleteEventType = (type: string) => stageCategoryDelete('eventTypes', type, false, '', `Yakin ingin menghapus jenis Acara Pernikahan internal "${type}"?`);

  // Package Categories
  const handleAddOrUpdatePackageCategory = () => {
    const previousName = editingPackageCategory;
    const nextName = packageCategoryInput.trim();
    const didStage = stageCategoryInput('packageCategories', packageCategoryInput, previousName, setPackageCategoryInput, setEditingPackageCategory, 'Kategori ini sudah ada.');
    if (!didStage || !previousName || previousName === nextName) return;
    setPackageCategoryRenames(current => {
      const sourceName = Object.entries(current).find(([, stagedName]) => stagedName === previousName)?.[0] ?? previousName;
      const next = { ...current };
      if (sourceName === nextName) delete next[sourceName];
      else next[sourceName] = nextName;
      return next;
    });
  };
  const handleEditPackageCategory = (cat: string) => { setEditingPackageCategory(cat); setPackageCategoryInput(cat); };
  const handleDeletePackageCategory = (category: string) => stageCategoryDelete(
    'packageCategories',
    category,
    packages.some(pkg => pkg.category === category),
    `Kategori "${category}" tidak dapat dihapus karena sedang digunakan oleh Package.`,
    `Yakin ingin menghapus kategori Package "${category}"?`,
  );

  // Lead Sources
  const handleAddOrUpdateLeadSource = () => {
    stageCategoryInput('leadSources', leadSourceInput, editingLeadSource, setLeadSourceInput, setEditingLeadSource, 'Sumber Calon Pengantin ini sudah ada.');
  };
  const handleEditLeadSource = (source: string) => { setEditingLeadSource(source); setLeadSourceInput(source); };
  const handleDeleteLeadSource = (source: string) => stageCategoryDelete(
    'leadSources',
    source,
    leads.some(lead => lead.contactChannel === source),
    `Sumber Calon Pengantin "${source}" tidak dapat dihapus karena sedang digunakan oleh Calon Pengantin.`,
    `Yakin ingin menghapus Sumber Calon Pengantin "${source}"?`,
  );

  // Suggested Defaults
  const handleAddSuggestedIncome = () => stageSuggestedCategories('incomeCategories', DEFAULT_INCOME_CATEGORIES);
  const handleAddSuggestedExpense = () => stageSuggestedCategories('expenseCategories', DEFAULT_EXPENSE_CATEGORIES);
  const handleAddSuggestedProjectTypes = () => stageSuggestedCategories('projectTypes', DEFAULT_PROJECT_TYPES);
  const handleAddSuggestedEventTypes = () => stageSuggestedCategories('eventTypes', DEFAULT_EVENT_TYPES);
  const handleAddSuggestedPackageCategories = () => stageSuggestedCategories('packageCategories', DEFAULT_PACKAGE_CATEGORIES);
  const handleAddSuggestedLeadSources = () => stageSuggestedCategories('leadSources', DEFAULT_LEAD_SOURCES);

  return {
    incomeCategoryInput, setIncomeCategoryInput, editingIncomeCategory, setEditingIncomeCategory,
    expenseCategoryInput, setExpenseCategoryInput, editingExpenseCategory, setEditingExpenseCategory,
    projectTypeInput, setProjectTypeInput, editingProjectType, setEditingProjectType,
    eventTypeInput, setEventTypeInput, editingEventType, setEditingEventType,
    packageCategoryInput, setPackageCategoryInput, editingPackageCategory, setEditingPackageCategory,
    leadSourceInput, setLeadSourceInput, editingLeadSource, setEditingLeadSource,
    categorySavingKey,
    getCategoryValues,
    categoryHasChanges,
    saveCategoryChanges,
    stageCategoryMove,
    handleAddOrUpdateIncomeCategory, handleEditIncomeCategory, handleDeleteIncomeCategory, handleAddSuggestedIncome,
    handleAddOrUpdateExpenseCategory, handleEditExpenseCategory, handleDeleteExpenseCategory, handleAddSuggestedExpense,
    handleAddOrUpdateProjectType, handleEditProjectType, handleDeleteProjectType, handleAddSuggestedProjectTypes,
    handleAddOrUpdateEventType, handleEditEventType, handleDeleteEventType, handleAddSuggestedEventTypes,
    handleAddOrUpdatePackageCategory, handleEditPackageCategory, handleDeletePackageCategory, handleAddSuggestedPackageCategories,
    handleAddOrUpdateLeadSource, handleEditLeadSource, handleDeleteLeadSource, handleAddSuggestedLeadSources,
  };
}
