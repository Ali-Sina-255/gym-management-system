import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import useAgreements from "../Agreement/Hook/useAgreements"; // Assuming path is correct
import useCustomers from "../Agreement/Hook/useCustomers"; // Assuming path is correct
// No longer using usePagination hook
// import usePagination from "../Agreement/Hook/usePagination";
import AgreementTable from "../Agreement/AgreementTable"; // Assuming path is correct
import AgreementForm from "../Agreement/AgreementForm"; // Assuming path is correct
import {
  FiSearch,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiPlus,
} from "react-icons/fi";

const Agreements = () => {
  // --- Data Fetching ---
  const {
    agreements: rawAgreements,
    isLoading: agreementsLoading,
    isMutating: agreementsMutating,
    error: agreementsError,
    createAgreement,
    updateAgreement,
    deleteAgreement,
  } = useAgreements();

  const {
    customers,
    isLoading: customersLoading,
    error: customersError,
  } = useCustomers();

  // --- Component State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAgreement, setEditingAgreement] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // --- Pagination State (Local) ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage =15; // Or your desired number

  // --- Derived State: Filtered Agreements (Keep using useMemo) ---
  const filteredAgreements = useMemo(() => {
    const currentAgreements = Array.isArray(rawAgreements) ? rawAgreements : [];
    const currentCustomers = Array.isArray(customers) ? customers : [];
    const lowerSearchTerm = searchTerm.toLowerCase().trim();

    if (!lowerSearchTerm) {
      return currentAgreements;
    }

    return currentAgreements.filter((agreement) => {
      const customer = currentCustomers.find(
        (c) => c.id === agreement.customer
      );
      const customerName = customer ? customer.name.toLowerCase() : "";
      const shopString = Array.isArray(agreement.shop)
        ? agreement.shop.join(",").toLowerCase()
        : typeof agreement.shop === "string"
        ? agreement.shop.toLowerCase()
        : "";
      const rentString = agreement.rant?.toString().toLowerCase() || "";
      const floorString = agreement.floor?.toString().toLowerCase() || "";

      return (
        customerName.includes(lowerSearchTerm) ||
        shopString.includes(lowerSearchTerm) ||
        rentString.includes(lowerSearchTerm) ||
        floorString.includes(lowerSearchTerm)
      );
    });
  }, [rawAgreements, customers, searchTerm]);

  // --- Effect to Reset Pagination Page ---
  // Reset to page 1 whenever the underlying filtered data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredAgreements]);

  // --- Calculate Pagination Variables (on every render based on current state) ---
  const pageCount = Math.ceil((filteredAgreements?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  // Get the slice of agreements for the *current* page
  const currentAgreementsForPage = Array.isArray(filteredAgreements)
    ? filteredAgreements.slice(startIndex, endIndex)
    : [];

  // --- Pagination Navigation Handler ---
  const handlePageChange = (pageNumber) => {
    // Ensure pageNumber is within valid range
    if (pageNumber >= 1 && pageNumber <= pageCount) {
      setCurrentPage(pageNumber);
    }
  };

  // --- Event Handlers ---
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    // setCurrentPage(1) // Not strictly needed here, useEffect handles it
  };

  const clearSearch = () => {
    setSearchTerm("");
    // setCurrentPage(1) // Not strictly needed here, useEffect handles it
  };

  const handleOpenModal = () => {
    setEditingAgreement(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAgreement(null);
  };

  // --- CRUD Handlers (Remain the same) ---
  const handleCreateAgreement = async (formData) => {
    const shopArray = (
      Array.isArray(formData.shop)
        ? formData.shop.join(",")
        : formData.shop || ""
    )
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map(String);

    const submitData = {
      customer: formData.customer,
      status: formData.status,
      shop: shopArray,
      rant: formData.rant,
      service: formData.service,
      floor: formData.floor,
      advance: formData.advance || 0,
    };
    const success = await createAgreement(submitData);
    if (success) {
      handleCloseModal();
      // Data refetch by useAgreements will update rawAgreements -> filteredAgreements -> useEffect resets page
    }
  };

  const handleEditAgreement = (agreement) => {
    const initialValuesForForm = {
      id: agreement.id,
      customer: agreement.customer ?? "",
      status: agreement.status ?? "Active",
      shop: Array.isArray(agreement.shop)
        ? agreement.shop.join(", ")
        : agreement.shop ?? "",
      rant: agreement.rant ?? "",
      service: agreement.service ?? agreement.services ?? "", // Check field name consistency
      floor: agreement.floor?.toString() ?? "0",
      advance: agreement.advance ?? "",
    };
    setEditingAgreement(initialValuesForForm);
    setIsModalOpen(true);
  };

  const handleUpdateAgreement = async (formData) => {
    if (!editingAgreement || !editingAgreement.id) return;
    const shopArray = (
      Array.isArray(formData.shop)
        ? formData.shop.join(",")
        : formData.shop || ""
    )
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map(String);

    const submitData = {
      customer: formData.customer,
      status: formData.status,
      shop: shopArray,
      rant: formData.rant,
      service: formData.service,
      floor: formData.floor,
      advance: formData.advance || 0,
    };
    const success = await updateAgreement(editingAgreement.id, submitData);
    if (success) {
      handleCloseModal();
      // Data refetch by useAgreements will update rawAgreements -> filteredAgreements -> useEffect resets page
    }
  };

  const handleDeleteAgreement = async (id) => {
    if (!id) return;
    const result = await Swal.fire({
      title: "آیا مطمئن هستید؟",
      text: "شما در حال حذف این قرارداد هستید. این عمل قابل بازگشت نیست!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "بله، حذف شود!",
      cancelButtonText: "لغو",
    });

    if (result.isConfirmed) {
      await deleteAgreement(id);
      // Data refetch by useAgreements will update rawAgreements -> filteredAgreements -> useEffect resets page
    }
  };

  // --- Loading / Error States ---
  const CombinedLoading = agreementsLoading || customersLoading;
  const CombinedError = agreementsError || customersError;
  const showInitialLoading = CombinedLoading && !rawAgreements && !customers;
  const showMutationSpinner = agreementsMutating;

  // --- Loading UI ---
  if (showInitialLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600"></div>
      </div>
    );
  }

  // --- Error UI ---
  if (CombinedError && (!rawAgreements || rawAgreements.length === 0)) {
    console.error("Data Fetch Error:", CombinedError);
    return (
      <div className="text-center text-red-700 p-6 bg-red-50 rounded-lg border border-red-200 m-4 shadow-md">
        <p className="font-bold text-lg">خطا در دریافت اطلاعات!</p>
        <p className="text-md mt-2">
          {CombinedError.message ||
            "ارتباط با سرور برقرار نشد. لطفا صفحه را رفرش کنید یا بعدا تلاش نمایید."}
        </p>
      </div>
    );
  }

  // --- Render Pagination Controls (Using Local State) ---
  const renderPaginationControls = () => {
    // Show controls only if data is loaded, not mutating, and more than 1 page exists
    if (
      showInitialLoading ||
      showMutationSpinner ||
      !filteredAgreements ||
      pageCount <= 1
    ) {
      return null;
    }

    // Generate page number buttons (optional, like ServiceTable)
    const pageNumbers = [];
    // Add logic for ellipsis (...) if too many pages, or show a limited range
    const maxButtonsToShow = 5; // Example limit
    let startPage = Math.max(1, currentPage - Math.floor(maxButtonsToShow / 2));
    let endPage = Math.min(pageCount, startPage + maxButtonsToShow - 1);

    if (endPage - startPage + 1 < maxButtonsToShow) {
      startPage = Math.max(1, endPage - maxButtonsToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          disabled={showMutationSpinner}
          className={`px-3 py-1 rounded-md text-sm ${
            currentPage === i
              ? "bg-green-600 text-white cursor-default"
              : "bg-gray-100 hover:bg-gray-200"
          } disabled:opacity-50 disabled:cursor-not-allowed mx-1`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex justify-center items-center mt-6 space-x-2 rtl:space-x-reverse">
        {/* Previous Button */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || showMutationSpinner}
          aria-label="صفحه قبلی"
          className="flex items-center px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          <FiChevronRight className="ml-1 rtl:mr-1 rtl:ml-0 h-4 w-4" />
          قبلی
        </button>

        {/* Page Number Buttons (Optional) */}
        {startPage > 1 && (
          <>
            <button
              onClick={() => handlePageChange(1)}
              disabled={showMutationSpinner}
              className="px-3 py-1 rounded-md text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed mx-1"
            >
              1
            </button>
            {startPage > 2 && <span className="px-2">...</span>}
          </>
        )}
        {pageNumbers}
        {endPage < pageCount && (
          <>
            {endPage < pageCount - 1 && <span className="px-2">...</span>}
            <button
              onClick={() => handlePageChange(pageCount)}
              disabled={showMutationSpinner}
              className="px-3 py-1 rounded-md text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed mx-1"
            >
              {pageCount}
            </button>
          </>
        )}

        {/* Current Page Info (Simpler alternative to buttons) */}
        {/* <span className="text-sm text-gray-700 px-2">
          صفحه <span className="font-semibold">{currentPage}</span> از{" "}
          <span className="font-semibold">{pageCount}</span>
        </span> */}

        {/* Next Button */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === pageCount || showMutationSpinner}
          aria-label="صفحه بعدی"
          className="flex items-center px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          بعدی
          <FiChevronLeft className="mr-1 rtl:ml-1 rtl:mr-0 h-4 w-4" />
        </button>
      </div>
    );
  };

  // --- Main Component Return (JSX) ---
  return (
    <div
      dir="rtl"
      className="bg-white p-4 md:p-6 rounded-lg relative min-h-[400px]"
    >
      {/* Mutation Loading Overlay */}
      {showMutationSpinner && (
        <div className="absolute inset-0 bg-white bg-opacity-60 flex justify-center items-center z-20 rounded-lg">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-600"></div>
        </div>
      )}

      <ToastContainer
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={true} // Enable RTL for toasts
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        position="top-left" 
      />
      <h2 className="text-xl md:text-2xl font-bold mb-5 md:mb-6 text-center text-gray-800">
        مدیریت قراردادها
      </h2>

      {/* Add Button & Modal Section */}
      <div className="mb-4">
        <div className="flex justify-center items-center mb-5">
          {!isModalOpen && (
            <button
              onClick={handleOpenModal}
              disabled={agreementsMutating || CombinedLoading}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-5 rounded-md shadow hover:shadow-lg transition-all duration-150 ease-in-out disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <FiPlus size={18} />
              افزودن قرارداد جدید
            </button>
          )}
        </div>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-300 bg-opacity-60 flex justify-center items-start pt-6 md:pt-10 px-2 sm:px-4">
            <div className="bg-gray-50 rounded-lg shadow-xl w-full max-w-4xl my-8 transform transition-all duration-300 ease-out scale-95 opacity-0 animate-fade-in-scale">
              <div className="flex justify-between items-center px-6 py-4 border-b border-gray-300">
                <h3 className="text-lg leading-6 font-semibold text-gray-900">
                  {editingAgreement?.id
                    ? "ویرایش قرارداد"
                    : "افزودن قرارداد جدید"}
                </h3>
                <button onClick={handleCloseModal} /* ... */>
                  {" "}
                  <FiX size={24} />{" "}
                </button>
              </div>
              <AgreementForm
                customers={Array.isArray(customers) ? customers : []}
                onSubmit={
                  editingAgreement?.id
                    ? handleUpdateAgreement
                    : handleCreateAgreement
                }
                initialValues={editingAgreement || {}}
                onCancel={handleCloseModal}
                isLoading={agreementsMutating}
              />
            </div>
          </div>
        )}
      </div>

      {/* Search and Table Section */}
      <div className="mb-4">
        {/* Search Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4 px-1 md:px-4">
          <h2 className="text-lg md:text-xl font-semibold text-gray-700 whitespace-nowrap order-2 md:order-1">
            لیست قراردادها ({filteredAgreements?.length ?? 0})
          </h2>
          <div className="relative w-full md:w-auto md:max-w-sm order-1 md:order-2">
            {/* Search Input */}
            <label htmlFor="agreementSearch" className="sr-only">
              {" "}
              جستجوی قراردادها{" "}
            </label>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              {" "}
              <FiSearch className="text-gray-400 h-5 w-5" />{" "}
            </div>
            <input
              id="agreementSearch"
              type="text"
              placeholder="جستجو دوکاندار, دکان, کرایه, منزل..."
              className="w-full block pr-10 pl-3 py-2 border border-gray-300 rounded-md ..."
              value={searchTerm}
              onChange={handleSearchChange}
              disabled={CombinedLoading || agreementsMutating}
            />
            {searchTerm && (
              <button onClick={clearSearch} /* ... */>
                {" "}
                <FiX className="h-5 w-5" />{" "}
              </button>
            )}
          </div>
        </div>

        {/* Table/No Results Area */}
        {
          filteredAgreements.length === 0 &&
          !CombinedLoading &&
          !showMutationSpinner ? (
            <div className="text-center text-gray-500 my-10 px-4 py-8 bg-gray-50 rounded-lg">
              {/* No Results Message */}
              <p className="text-lg font-medium">
                {" "}
                {searchTerm
                  ? "هیچ قراردادی مطابق با جستجوی شما یافت نشد."
                  : "هیچ قراردادی ثبت نشده است."}{" "}
              </p>
              {!searchTerm && (
                <button onClick={handleOpenModal} /* ... */>
                  {" "}
                  <FiPlus size={18} /> افزودن قرارداد اول{" "}
                </button>
              )}
            </div>
          ) : // Check if the *current page* has data to display
          currentAgreementsForPage.length > 0 ? (
            <div className="overflow-x-auto relative">
              {/* Pass the calculated page data to the table */}
              <AgreementTable
                agreements={currentAgreementsForPage}
                customers={Array.isArray(customers) ? customers : []}
                onEdit={handleEditAgreement}
                onDelete={handleDeleteAgreement}
                disabled={agreementsMutating}
              />
            </div>
          ) : // Handle case where filtered list exists, but current page is empty (e.g., after delete)
          filteredAgreements.length > 0 &&
            currentAgreementsForPage.length === 0 &&
            !CombinedLoading &&
            !showMutationSpinner ? (
            <div className="text-center text-gray-500 my-10 px-4 py-8 bg-gray-50 rounded-lg">
              <p className="text-lg font-medium">
                {" "}
                داده‌ای برای نمایش در این صفحه وجود ندارد.{" "}
              </p>
            </div>
          ) : null /* Render nothing during initial load/mutation */
        }

        {/* Render Pagination Controls */}
        {renderPaginationControls()}
      </div>

      {/* Styles */}
      <style jsx global>{`
        /* ... animations ... */
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in-scale {
          animation: fadeInScale 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Agreements;

// --- AgreementTable.js (No changes needed) ---
// It should work correctly with the paginated `currentAgreementsForPage` data.
