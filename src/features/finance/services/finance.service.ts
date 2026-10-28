import {
    transactionService,
    listTransactions,
    listTransactionsPaginated,
    getTransaction,
    createTransaction,
    createTransactions,
    updateTransaction,
    deleteTransaction,
    updateCardBalance,
} from '../../../services/transactions';
import {
    listCards,
    getCard,
    createCard,
    updateCard,
    deleteCard,
    safeDeleteCard,
} from '../../../services/cards';
import {
    listPockets,
    getPocket,
    createPocket,
    updatePocket,
    deletePocket,
} from '../../../services/pockets';

export const financeService = {
    // Transaction operations
    transactions: transactionService,
    listTransactions,
    listTransactionsPaginated,
    getTransaction,
    createTransaction,
    createTransactions,
    updateTransaction,
    deleteTransaction,
    updateCardBalance,

    // Card operations
    cards: {
        list: listCards,
        get: getCard,
        create: createCard,
        update: updateCard,
        delete: deleteCard,
        safeDelete: safeDeleteCard,
    },

    // Pocket operations
    pockets: {
        list: listPockets,
        get: getPocket,
        create: createPocket,
        update: updatePocket,
        delete: deletePocket,
    },
};

export default financeService;
