import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import AddExpenseForm from '../components/forms/AddExpenseForm';
import SuccessModal from '../components/common/SuccessModal';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AddExpensePage() {
  const { balance, addTransaction } = useFinance();
  const navigate = useNavigate();

  const [modalState, setModalState] = useState({
    isOpen: false,
    amountSpent: 0,
    newBalance: 0,
  });

  const handleFormSubmit = (data) => {
    const amount = Number(data.amount) || 0;
    const computedNewBalance = balance - amount;

    // Persist to finance state
    addTransaction(data);

    // Open success modal
    setModalState({
      isOpen: true,
      amountSpent: amount,
      newBalance: computedNewBalance,
    });
  };

  const handleCloseModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleAddAnother = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray-500 hover:text-brand-darkText rounded-xl hover:bg-white border border-transparent hover:border-gray-200 transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-brand-darkText">Add Expense</h1>
            <p className="text-xs text-brand-muted mt-0.5">
              Log purchases and track where your pocket money goes
            </p>
          </div>
        </div>
      </div>

      {/* Main Interactive Form */}
      <AddExpenseForm
        currentBalance={balance}
        onSubmitSuccess={handleFormSubmit}
      />

      {/* Success State Modal (AGENT.md Section 3.5 copy) */}
      <SuccessModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        type="expense"
        title="Expense Recorded Successfully!"
        subtitle="Amount Snatched (gone, but useful!) 🎉"
        amount={modalState.amountSpent}
        newBalance={modalState.newBalance}
        onAddAnother={handleAddAnother}
      />
    </div>
  );
}
