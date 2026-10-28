import { useState, useEffect, useMemo, useCallback } from 'react';
import { Profile } from '../../../types';
import {
  CommunicationTemplate,
  MessageTemplateCategory,
  CommunicationContextData,
} from '../types';
import { getAllCommunicationTemplates } from '../services/clientCommunicationService';
import {
  interpolateTemplate,
  buildContextVariables,
} from '../utils/templateProcessor';

export function useWhatsAppTemplates(
  userProfile?: Profile | null,
  contextData?: CommunicationContextData
) {
  const [templates, setTemplates] = useState<CommunicationTemplate[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<MessageTemplateCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadTemplates = useCallback(async () => {
    setIsLoading(true);
    const list = await getAllCommunicationTemplates(userProfile);
    setTemplates(list);
    setIsLoading(false);
  }, [userProfile]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  // Ekstrak context variables default
  const baseVariables = useMemo(() => {
    return buildContextVariables(contextData || {});
  }, [contextData]);

  // Filter templates berdasarkan kategori dan query pencarian
  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      const matchCategory = selectedCategory === 'all' || template.category === selectedCategory;
      const matchQuery =
        !searchQuery.trim() ||
        template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.template.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchQuery;
    });
  }, [templates, selectedCategory, searchQuery]);

  // Fungsi helper untuk menginterpolasi template dengan variabel dinamis
  const processTemplate = useCallback(
    (
      templateText: string,
      customVariables?: Record<string, string | number | undefined | null>
    ): string => {
      const merged = { ...baseVariables, ...customVariables };
      return interpolateTemplate(templateText, merged);
    },
    [baseVariables]
  );

  return {
    templates,
    filteredTemplates,
    isLoading,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    baseVariables,
    processTemplate,
    reloadTemplates: loadTemplates,
  };
}
