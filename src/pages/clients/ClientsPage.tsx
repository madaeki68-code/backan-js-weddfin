import React, { useCallback } from 'react';
import {
  Client,
  Project,
  ViewType,
  ClientsProps,
} from '../../features/clients/types';
import Modal from '../../shared/ui/Modal';
import DonutChart from '../../shared/ui/DonutChart';
import PdfPreviewModal from '../../shared/ui/PdfPreviewModal';
import { buildReportPdf } from '../../shared/utils/reportPdf';
import { updateProject as updateProjectInDb } from '../../services/projects';
import { updateTransaction as updateTransactionInDb } from '../../services/transactions';

// Modular Clients Components
import {
  ClientsPageHeader,
  ClientsToolbar,
  ClientStatsCards,
  ClientFilterBar,
  ClientTableView,
  ClientDuesView,
  ClientFinanceRecapView,
  ClientDetailModal,
  ClientForm,
  ClientDocumentModal,
  ClientQrShareModals,
  BillingChatModal,
  ClientTransactionEditModal,
  NewClientsChart,
} from '../../features/clients/components';

// Custom Hooks & Utilities
import {
  useClientsData,
  useClientFilters,
  useClientModals,
  useClientDocumentActions,
  useClientPaymentOperations,
  useClientFormHandler,
} from '../../features/clients/hooks';
import { exportClientsToExcel } from '../../features/clients/utils/clientExport';
import { buildPengantinPdfInput } from '../../features/clients/utils/clientReportPdf';

export type { ClientsProps };

export const Clients: React.FC<ClientsProps> = ({
  clients,
  setClients,
  projects,
  setProjects,
  packages,
  addOns,
  transactions,
  setTransactions,
  userProfile,
  showNotification,
  initialAction,
  setInitialAction,
  cards,
  setCards,
  pockets,
  setPockets,
  teamMembers,
  teamProjectPayments,
  setTeamProjectPayments,
  teamPaymentRecords = [],
  handleNavigation,
  promoCodes,
  setPromoCodes,
  onSignInvoice,
  onSignTransaction,
  addNotification,
  totals,
}) => {
  // 1. Data and mutation operations hook
  const { handleDeleteClient, handleDeleteProject } = useClientsData({
    clients,
    setClients,
    projects,
    setProjects,
    transactions,
    setTransactions,
    showNotification,
  });

  // 2. Filters, tabs, and computed data lists hook
  const filters = useClientFilters({
    clients,
    projects,
    totals,
  });

  // 3. Form handling hook (Client & Project modal add/edit)
  const formHandler = useClientFormHandler({
    clients,
    setClients,
    projects,
    setProjects,
    packages,
    addOns,
    transactions,
    setTransactions,
    cards,
    setCards,
    promoCodes,
    setPromoCodes,
    userProfile,
    showNotification,
    clientForDetail: null,
    setClientForDetail: () => undefined,
    documentToView: null,
    setDocumentToView: () => undefined,
    setIsSignatureModalOpen: () => undefined,
  });

  // 4. Modal and drilldown state management hook
  const modals = useClientModals({
    clients,
    projects,
    initialAction,
    setInitialAction,
    onOpenEditForm: formHandler.handleOpenModal,
  });

  // 5. Document actions hook (PDF, WhatsApp, Signature)
  const documentActions = useClientDocumentActions({
    documentToView: modals.documentToView,
    clientForDetail: modals.clientForDetail,
    userProfile,
    projects,
    transactions,
    packages,
    teamMembers,
    teamProjectPayments,
    showNotification,
    onSignInvoice,
    onSignTransaction,
    onRemoveInvoiceSignature: async (projectId) => {
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, invoiceSignature: undefined } : p))
      );
      try {
        await updateProjectInDb(projectId, { invoiceSignature: null } as any);
      } catch (e) {
        console.warn('[ClientsPage] Failed to remove invoice signature:', e);
      }
    },
    onRemoveTransactionSignature: async (txId) => {
      setTransactions((prev) =>
        prev.map((t) => (t.id === txId ? { ...t, vendorSignature: undefined } : t))
      );
      try {
        await updateTransactionInDb(txId, { vendorSignature: null } as any);
      } catch (e) {
        console.warn('[ClientsPage] Failed to remove transaction signature:', e);
      }
    },
    setSharePreview: modals.setSharePreview,
  });

  // 6. Payment operations hook (Record payment, edit transaction)
  const paymentOps = useClientPaymentOperations({
    projects,
    setProjects,
    transactions,
    setTransactions,
    cards,
    setCards,
    showNotification,
    addNotification: addNotification || (() => undefined),
    documentToView: modals.documentToView,
    setDocumentToView: modals.setDocumentToView,
  });

  // Excel Export Handler
  const handleDownloadExcel = async () => {
    if (modals.isExporting) return;
    modals.setIsExporting(true);
    try {
      await exportClientsToExcel(
        filters.filteredClientData,
        transactions,
        teamProjectPayments,
        { companyName: userProfile.companyName }
      );
    } catch (error) {
      console.error('[ClientsPage] Gagal membuat file Excel:', error);
      showNotification('Gagal membuat file Excel. Silakan coba lagi.');
    } finally {
      modals.setIsExporting(false);
    }
  };

  // PDF Preview and Generation Callbacks
  const handleGeneratePdfBlob = useCallback(async () => {
    const input = buildPengantinPdfInput({
      filteredClientData: filters.filteredClientData,
      transactions,
      teamProjectPayments,
      packages,
      userProfile,
      monthFilter: filters.monthFilter,
    });
    const doc = await buildReportPdf(input);
    const blob = doc.output('blob');
    const blobUrl = URL.createObjectURL(blob);
    return { blobUrl, filename: input.filename };
  }, [
    filters.filteredClientData,
    transactions,
    teamProjectPayments,
    packages,
    userProfile,
    filters.monthFilter,
  ]);

  const handleEditDocument = () => {
    if (!modals.documentToView) return;
    if (modals.documentToView.type === 'invoice') {
      const proj = modals.documentToView.project;
      modals.setDocumentToView(null);
      handleNavigation(ViewType.INVOICES, { type: 'openInvoice', id: proj.id });
    } else if (modals.documentToView.type === 'receipt') {
      const tx = modals.documentToView.transaction;
      paymentOps.handleOpenEditTransaction(tx);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <ClientsPageHeader
        onOpenAddModal={() => formHandler.handleOpenModal('add')}
        onOpenPdfPreview={() => modals.setShowPdfPreviewModal(true)}
      />

      {/* 4 Summary StatCards & Detail Modals */}
      <ClientStatsCards
        clientStats={filters.clientStats}
        activeStatModal={modals.activeStatModal}
        setActiveStatModal={modals.setActiveStatModal}
        clients={clients}
        projects={projects}
      />

      {/* View Section Tabs for Progressive Disclosure */}
      <ClientsToolbar
        activeViewSection={filters.activeViewSection}
        setActiveViewSection={filters.setActiveViewSection}
        totalClients={filters.clientStats.totalClients}
        duesCount={filters.clientsWithDues.length}
        totalProjects={projects.length}
      />

      {/* Analytics Section */}
      {filters.activeViewSection === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6 widget-animate animate-fade-in">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-[0_9px_17.5px_rgba(0,0,0,0.05)] border border-[#EAEFF4]">
            <h3 className="font-bold text-base text-[#2A3547] mb-4">Distribusi Status Pengantin</h3>
            <DonutChart data={filters.clientStatusDonutData} />
          </div>
          <div className="lg:col-span-3">
            <NewClientsChart data={filters.newClientsChartData} />
          </div>
        </div>
      )}

      {/* Dues Section */}
      {filters.activeViewSection === 'dues' && (
        <ClientDuesView
          clientsWithDues={filters.clientsWithDues}
          monthFilter={filters.monthFilter}
          setMonthFilter={filters.setMonthFilter}
          showAllDues={filters.showAllDues}
          setShowAllDues={filters.setShowAllDues}
          onBillingClick={(client) => modals.setBillingChatModal(client)}
        />
      )}

      {/* Financial Recap Section */}
      {filters.activeViewSection === 'finance-recap' && (
        <ClientFinanceRecapView
          clients={clients}
          projects={projects}
          transactions={transactions}
        />
      )}

      {/* Main Clients List Section */}
      {filters.activeViewSection === 'clients' && (
        <>
          <ClientFilterBar
            searchTerm={filters.searchTerm}
            setSearchTerm={filters.setSearchTerm}
            dateFrom={filters.dateFrom}
            setDateFrom={filters.setDateFrom}
            dateTo={filters.dateTo}
            setDateTo={filters.setDateTo}
            statusFilter={filters.statusFilter}
            setStatusFilter={filters.setStatusFilter}
            onDownloadExcel={handleDownloadExcel}
            isExporting={modals.isExporting}
          />

          <ClientTableView
            clientTab={filters.clientTab}
            setClientTab={filters.setClientTab}
            filteredClientData={filters.filteredClientData}
            currentMonthEvents={filters.currentMonthEvents}
            onViewDetail={modals.openClientDetail}
            onEditClient={(client: Client, project?: Project) =>
              formHandler.handleOpenModal('edit', client, project)
            }
            onDeleteClient={handleDeleteClient}
            onAddProject={(client: Client) => formHandler.handleOpenModal('add', client)}
          />
        </>
      )}

      {/* Add / Edit Client & Project Modal */}
      <Modal
        isOpen={formHandler.isModalOpen}
        onClose={formHandler.handleCloseModal}
        title={
          formHandler.modalMode === 'add'
            ? formHandler.selectedClient
              ? 'Tambah Acara Pernikahan Baru'
              : 'Tambah Pengantin & Acara Pernikahan Baru'
            : 'Edit Pengantin & Acara Pernikahan'
        }
        size="4xl"
      >
        <ClientForm
          formData={formHandler.formData}
          setFormData={formHandler.setFormData}
          handleFormChange={formHandler.handleFormChange}
          handleFormSubmit={formHandler.handleFormSubmit}
          handleCloseModal={formHandler.handleCloseModal}
          packages={packages}
          addOns={addOns}
          userProfile={userProfile}
          modalMode={formHandler.modalMode}
          cards={cards}
          promoCodes={promoCodes}
        />
      </Modal>

      {/* Client Detail Modal */}
      <Modal
        isOpen={modals.isDetailModalOpen}
        onClose={modals.closeClientDetail}
        title={`Detail Pengantin: ${modals.clientForDetail?.name}`}
        size="5xl"
      >
        <ClientDetailModal
          client={modals.clientForDetail}
          profile={userProfile}
          projects={projects}
          transactions={transactions}
          packages={packages}
          addOns={addOns}
          onClose={modals.closeClientDetail}
          onEditClient={(client) => {
            const clientProjects = projects.filter((p) => p.clientId === client.id);
            const mostRecent =
              clientProjects.length > 0
                ? [...clientProjects].sort(
                    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
                  )[0]
                : undefined;
            formHandler.handleOpenModal('edit', client, mostRecent);
          }}
          onDeleteClient={handleDeleteClient}
          onViewReceipt={(tx) => modals.setDocumentToView({ type: 'receipt', transaction: tx })}
          onViewInvoice={(proj) => modals.setDocumentToView({ type: 'invoice', project: proj })}
          handleNavigation={handleNavigation}
          onRecordPayment={paymentOps.handleRecordPayment}
          cards={cards}
          onSharePortal={modals.openQrModal}
          onDeleteProject={handleDeleteProject}
          showNotification={showNotification}
          setProjects={setProjects}
          setTransactions={setTransactions}
          setCards={setCards}
          teamMembers={teamMembers}
          teamProjectPayments={teamProjectPayments}
          setTeamProjectPayments={setTeamProjectPayments}
          teamPaymentRecords={teamPaymentRecords}
          pockets={pockets}
          setPockets={setPockets}
        />
      </Modal>

      {/* Invoice & Receipt Document Preview Modal */}
      <ClientDocumentModal
        documentToView={modals.documentToView}
        onClose={() => modals.setDocumentToView(null)}
        clientForDetail={modals.clientForDetail}
        userProfile={userProfile}
        packages={packages}
        projects={projects}
        transactions={transactions}
        isSignatureModalOpen={documentActions.isSignatureModalOpen}
        setIsSignatureModalOpen={documentActions.setIsSignatureModalOpen}
        onSaveSignature={documentActions.handleSaveSignature}
        onRemoveSignature={documentActions.handleRemoveSignature}
        onEditDocument={handleEditDocument}
        onDownloadPDF={documentActions.handleDownloadPDF}
        onShareDocumentWA={documentActions.handleShareDocumentWA}
      />

      {/* QR Code & Message Sharing Modals */}
      <ClientQrShareModals
        qrModalContent={modals.qrModalContent}
        onCloseQrModal={modals.closeQrModal}
        sharePreview={modals.sharePreview}
        setSharePreview={modals.setSharePreview}
        userProfile={userProfile}
        showNotification={showNotification}
      />

      {/* Billing WhatsApp Reminder Modal */}
      {modals.billingChatModal && (
        <BillingChatModal
          isOpen={Boolean(modals.billingChatModal)}
          onClose={() => modals.setBillingChatModal(null)}
          client={modals.billingChatModal}
          projects={projects}
          userProfile={userProfile}
          showNotification={showNotification}
        />
      )}

      {/* Transaction / Receipt Edit Modal */}
      <ClientTransactionEditModal
        isOpen={paymentOps.isTransactionEditModalOpen}
        onClose={() => paymentOps.setIsTransactionEditModalOpen(false)}
        txFormData={paymentOps.txFormData}
        setTxFormData={paymentOps.setTxFormData}
        onSubmit={paymentOps.handleUpdateTransaction}
        cards={cards}
      />

      {/* PDF Preview Modal */}
      {modals.showPdfPreviewModal && (
        <PdfPreviewModal
          title="Preview Laporan Data Pengantin"
          onGenerate={handleGeneratePdfBlob}
          onClose={() => modals.setShowPdfPreviewModal(false)}
        />
      )}
    </div>
  );
};

export default Clients;
