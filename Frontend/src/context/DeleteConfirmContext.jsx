import { createContext, useContext, useState } from "react";

const ConfirmModalContext = createContext();

export const useConfirmModal = () => useContext(ConfirmModalContext);

export const ConfirmModalProvider = ({ children }) => {
  const [modalData, setModalData] = useState(null); 
  // modalData = { id, name, onConfirm }

  const showConfirm = ({ id, name, onConfirm }) => {
    setModalData({ id, name, onConfirm });
  };

  const hideConfirm = () => setModalData(null);

  const confirmAction = () => {
    if (modalData?.onConfirm) modalData.onConfirm(modalData.id);
    hideConfirm();
  };

  return (
    <ConfirmModalContext.Provider value={{ showConfirm, hideConfirm }}>
      {children}
      {modalData && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-500 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl flex justify-between items-center border border-gray-200">
            <span className="text-gray-900 font-medium text-lg whitespace-nowrap">
              {`Are you sure you want to delete? - ${modalData.name}`}
            </span>

            <div className="flex gap-4 ml-8">
              <button
                className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 transition"
                onClick={confirmAction}
              >
                Yes
              </button>
              <button
                className="bg-gray-200 text-gray-800 px-6 py-2 rounded hover:bg-gray-300 transition"
                onClick={hideConfirm}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmModalContext.Provider>
  );
};