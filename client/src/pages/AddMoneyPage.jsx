import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import AddMoneyForm from '../components/forms/AddMoneyForm';
import SuccessModal from '../components/common/SuccessModal';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AddMoneyPage() {
  const { balance, addTransaction } = useFinance();
  const navigate = useNavigate();

  const [modalState, setModalState] = useState({
    isOpen: false,
    amountAdded: 0,
    newBalance: 0,
  });

  const handleFormSubmit = (data) => {
    const amount = Number(data.amount) || 0;
    const computedNewBalance = balance + amount;

    // Persist to finance state
    addTransaction(data);

    // Open success modal
    setModalState({
      isOpen: true,
      amountAdded: amount,
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
            <h1 className="text-2xl font-extrabold text-brand-darkText">Add Money</h1>
            <p className="text-xs text-brand-muted mt-0.5">
              Record allowance, stipend, or occasional income
            </p>
          </div>
        </div>
      </div>

      {/* Main Interactive Form */}
      <AddMoneyForm
        currentBalance={balance}
        onSubmitSuccess={handleFormSubmit}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        type="income"
        title="Money Added Successfully! 🎉"
        subtitle="Your available balance has been credited in your student ledger."
        amount={modalState.amountAdded}
        newBalance={modalState.newBalance}
        onAddAnother={handleAddAnother}
      />
    </div>
  );
}
