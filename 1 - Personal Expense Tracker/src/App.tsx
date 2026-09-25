import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExpenseProvider, useExpense } from './context/ExpenseContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';
import { Overview } from './components/dashboard/Overview';
import { TransactionsView } from './components/transactions/TransactionsView';
import { BudgetsView } from './components/budgets/BudgetsView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { SettingsView } from './components/settings/SettingsView';
import { AddExpenseModal } from './components/modals/AddExpenseModal';
import { EditExpenseModal } from './components/modals/EditExpenseModal';
import { DeleteConfirmDialog } from './components/modals/DeleteConfirmDialog';
import { CommandPalette } from './components/modals/CommandPalette';
import { ToastContainer } from './components/common/Toast';

const MainContent: React.FC = () => {
  const { currentView } = useExpense();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Header */}
        <Header />

        {/* Scrollable View Container */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 py-6 pb-24 md:pb-8">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentView}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18, ease: 'easeInOut' }}
              >
                {currentView === 'overview' && <Overview />}
                {currentView === 'transactions' && <TransactionsView />}
                {currentView === 'budgets' && <BudgetsView />}
                {currentView === 'analytics' && <AnalyticsView />}
                {currentView === 'settings' && <SettingsView />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Global Modals & Overlays */}
      <AddExpenseModal />
      <EditExpenseModal />
      <DeleteConfirmDialog />
      <CommandPalette />
      <ToastContainer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ExpenseProvider>
      <MainContent />
    </ExpenseProvider>
  );
};

export default App;
