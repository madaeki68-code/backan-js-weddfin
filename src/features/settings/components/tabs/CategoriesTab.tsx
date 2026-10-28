import React from 'react';
import CategoryManager from '../../../../pages/settings/components/CategoryManager';
import { useCategorySettings } from '../../hooks/useCategorySettings';
import {
  DEFAULT_INCOME_CATEGORIES,
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_PROJECT_TYPES,
  DEFAULT_EVENT_TYPES,
  DEFAULT_PACKAGE_CATEGORIES,
  DEFAULT_LEAD_SOURCES,
} from '../../../../constants';

export interface CategoriesTabProps {
  categoryHook: ReturnType<typeof useCategorySettings>;
}

export const CategoriesTab: React.FC<CategoriesTabProps> = ({ categoryHook }) => {
  const {
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
  } = categoryHook;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-4 md:gap-6 lg:gap-8">
      <CategoryManager
        title="Kategori Pemasukan"
        categories={getCategoryValues('incomeCategories')}
        inputValue={incomeCategoryInput}
        onInputChange={setIncomeCategoryInput}
        onAddOrUpdate={handleAddOrUpdateIncomeCategory}
        onEdit={handleEditIncomeCategory}
        onDelete={handleDeleteIncomeCategory}
        onMove={(value, direction) => stageCategoryMove('incomeCategories', value, direction)}
        editingValue={editingIncomeCategory}
        onCancelEdit={() => {
          setEditingIncomeCategory(null);
          setIncomeCategoryInput('');
        }}
        hasChanges={categoryHasChanges('incomeCategories')}
        isSaving={categorySavingKey === 'incomeCategories'}
        onSaveChanges={() => saveCategoryChanges('incomeCategories')}
        placeholder="e.g., DP Acara Pernikahan"
        suggestedDefaults={DEFAULT_INCOME_CATEGORIES}
        onAddSuggested={handleAddSuggestedIncome}
      />
      <CategoryManager
        title="Kategori Pengeluaran"
        categories={getCategoryValues('expenseCategories')}
        inputValue={expenseCategoryInput}
        onInputChange={setExpenseCategoryInput}
        onAddOrUpdate={handleAddOrUpdateExpenseCategory}
        onEdit={handleEditExpenseCategory}
        onDelete={handleDeleteExpenseCategory}
        onMove={(value, direction) => stageCategoryMove('expenseCategories', value, direction)}
        editingValue={editingExpenseCategory}
        onCancelEdit={() => {
          setEditingExpenseCategory(null);
          setExpenseCategoryInput('');
        }}
        hasChanges={categoryHasChanges('expenseCategories')}
        isSaving={categorySavingKey === 'expenseCategories'}
        onSaveChanges={() => saveCategoryChanges('expenseCategories')}
        placeholder="e.g., Gaji Tim / Vendor"
        suggestedDefaults={DEFAULT_EXPENSE_CATEGORIES}
        onAddSuggested={handleAddSuggestedExpense}
      />
      <CategoryManager
        title="Jenis Acara Pernikahan"
        categories={getCategoryValues('projectTypes')}
        inputValue={projectTypeInput}
        onInputChange={setProjectTypeInput}
        onAddOrUpdate={handleAddOrUpdateProjectType}
        onEdit={handleEditProjectType}
        onDelete={handleDeleteProjectType}
        onMove={(value, direction) => stageCategoryMove('projectTypes', value, direction)}
        editingValue={editingProjectType}
        onCancelEdit={() => {
          setEditingProjectType(null);
          setProjectTypeInput('');
        }}
        hasChanges={categoryHasChanges('projectTypes')}
        isSaving={categorySavingKey === 'projectTypes'}
        onSaveChanges={() => saveCategoryChanges('projectTypes')}
        placeholder="e.g., Pernikahan"
        suggestedDefaults={DEFAULT_PROJECT_TYPES}
        onAddSuggested={handleAddSuggestedProjectTypes}
      />
      <CategoryManager
        title="Jenis Acara Pernikahan Internal"
        categories={getCategoryValues('eventTypes')}
        inputValue={eventTypeInput}
        onInputChange={setEventTypeInput}
        onAddOrUpdate={handleAddOrUpdateEventType}
        onEdit={handleEditEventType}
        onDelete={handleDeleteEventType}
        onMove={(value, direction) => stageCategoryMove('eventTypes', value, direction)}
        editingValue={editingEventType}
        onCancelEdit={() => {
          setEditingEventType(null);
          setEventTypeInput('');
        }}
        hasChanges={categoryHasChanges('eventTypes')}
        isSaving={categorySavingKey === 'eventTypes'}
        onSaveChanges={() => saveCategoryChanges('eventTypes')}
        placeholder="e.g., Meeting Pengantin"
        suggestedDefaults={DEFAULT_EVENT_TYPES}
        onAddSuggested={handleAddSuggestedEventTypes}
      />
      <CategoryManager
        title="Kategori Package"
        categories={getCategoryValues('packageCategories')}
        inputValue={packageCategoryInput}
        onInputChange={setPackageCategoryInput}
        onAddOrUpdate={handleAddOrUpdatePackageCategory}
        onEdit={handleEditPackageCategory}
        onDelete={handleDeletePackageCategory}
        onMove={(value, direction) => stageCategoryMove('packageCategories', value, direction)}
        editingValue={editingPackageCategory}
        onCancelEdit={() => {
          setEditingPackageCategory(null);
          setPackageCategoryInput('');
        }}
        hasChanges={categoryHasChanges('packageCategories')}
        isSaving={categorySavingKey === 'packageCategories'}
        onSaveChanges={() => saveCategoryChanges('packageCategories')}
        placeholder="e.g., Pernikahan"
        suggestedDefaults={DEFAULT_PACKAGE_CATEGORIES}
        onAddSuggested={handleAddSuggestedPackageCategories}
      />
      <CategoryManager
        title="Sumber Calon Pengantin"
        categories={getCategoryValues('leadSources')}
        inputValue={leadSourceInput}
        onInputChange={setLeadSourceInput}
        onAddOrUpdate={handleAddOrUpdateLeadSource}
        onEdit={handleEditLeadSource}
        onDelete={handleDeleteLeadSource}
        onMove={(value, direction) => stageCategoryMove('leadSources', value, direction)}
        editingValue={editingLeadSource}
        onCancelEdit={() => {
          setEditingLeadSource(null);
          setLeadSourceInput('');
        }}
        hasChanges={categoryHasChanges('leadSources')}
        isSaving={categorySavingKey === 'leadSources'}
        onSaveChanges={() => saveCategoryChanges('leadSources')}
        placeholder="e.g., Instagram"
        suggestedDefaults={DEFAULT_LEAD_SOURCES}
        onAddSuggested={handleAddSuggestedLeadSources}
      />
    </div>
  );
};
