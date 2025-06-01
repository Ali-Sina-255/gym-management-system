import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { CustomerForm } from "../ServiceManager/Hook/ShopKeepersForm"; // Adjust path if needed
import { CustomerTable } from "../ServiceManager/Hook/shopkeeperTable"; // Adjust path if needed
import {
  FiSearch,
  FiPlus,
  FiX,
  FiChevronRight,
  FiChevronLeft,
} from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://127.0.0.1:8000"; // Provide fallback
const API_URL = `${BASE_URL}/api/customers/`;

const ShopKeepers = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [editingCustomer, setEditingCustomer] = useState(null); // This will hold the full customer object from API
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null); // For fetch/delete errors display

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const fetchCustomers = async () => {
    setIsLoading(true);
    setError(null); // Clear previous fetch errors
    try {
      const response = await axios.get(API_URL);
      setCustomers(response.data);
    } catch (error) {
      console.error("Error fetching customers:", error);
      const errorMsg = "خطا در بارگیری لیست دوکانداران. لطفا دوباره تلاش کنید.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filterCustomers = (term) => {
    const lowerTerm = term.toLowerCase().trim();
    if (!lowerTerm) {
      setFilteredCustomers(customers);
      return;
    }

    const filtered = customers.filter((customer) => {
      const nameMatch = customer.name?.toLowerCase().includes(lowerTerm);
      const ownerMatch = customer.rental_owner
        ?.toLowerCase()
        .includes(lowerTerm);
      const nicMatch = customer.nic?.toLowerCase().includes(lowerTerm); // Optional: add NIC search
      const phoneMatch = customer.phone_number?.includes(lowerTerm); // Optional: add phone search
      return nameMatch || ownerMatch || nicMatch || phoneMatch;
    });
    setFilteredCustomers(filtered);
  };

  useEffect(() => {
    setCurrentPage(1);
    filterCustomers(searchTerm);
  }, [customers, searchTerm]);

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "آیا مطمئن هستید؟",
      text: "شما در حال حذف این دوکاندار هستید. این عملیات قابل بازگشت نیست!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "بله، حذف شود!",
      cancelButtonText: "لغو",
      customClass: {
        popup: "text-sm",
      },
    });

    if (result.isConfirmed) {
      setIsLoading(true);
      try {
        await axios.delete(`${API_URL}${id}/`);
        toast.success("دوکاندار موفقانه حذف شد.");
        fetchCustomers();
      } catch (error) {
        console.error("Error deleting customer:", error);
        const errorMsg = "خطا در حذف دوکاندار. لطفا دوباره تلاش کنید.";
        // Don't set the main 'error' state here, as it's for fetch errors
        toast.error(errorMsg);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // --- Form Success Callback ---
  const handleFormSuccess = (message) => {
    toast.success(message);
    setShowForm(false); // Close the form
    setEditingCustomer(null); // Clear editing state
    fetchCustomers(); // Refresh data
  };

  // --- Form Error Callback ---
  const handleFormError = (message) => {
    // Error is displayed via toast by the form itself or here
    toast.error(message);
    // Keep the form open for correction
  };

  // --- Form Cancel Callback ---
  const handleFormCancel = () => {
    setShowForm(false);
    setEditingCustomer(null);
  };

  // --- Search Input Handling ---
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  // --- Pagination Logic (Unchanged) ---
  const pageCount = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCustomers = filteredCustomers.slice(startIndex, endIndex);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= pageCount) {
      setCurrentPage(pageNumber);
    }
  };

  // --- Pagination Rendering (Unchanged) ---
  const renderPageNumbers = () => {
    // ... (keep your existing pagination rendering logic) ...
    const maxVisiblePages = 5;
    const pageNumbers = [];
    let startPage = 1;
    let endPage = pageCount;

    if (pageCount > maxVisiblePages) {
      const half = Math.floor(maxVisiblePages / 2);
      startPage = Math.max(currentPage - half, 1);
      endPage = startPage + maxVisiblePages - 1;

      if (endPage > pageCount) {
        endPage = pageCount;
        startPage = endPage - maxVisiblePages + 1;
      }
    }
    // Ellipsis logic... (same as before)
    if (startPage > 1) {
      pageNumbers.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className={`px-3 py-1 rounded-md ${
            currentPage === 1
              ? "bg-green-600 text-white"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
        >
          1
        </button>
      );
      if (startPage > 2)
        pageNumbers.push(
          <span key="start-ellipsis" className="px-2">
            ...
          </span>
        );
    }
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 rounded-md ${
            currentPage === i
              ? "bg-green-600 text-white"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
        >
          {i}
        </button>
      );
    }
    if (endPage < pageCount) {
      if (endPage < pageCount - 1)
        pageNumbers.push(
          <span key="end-ellipsis" className="px-2">
            ...
          </span>
        );
      pageNumbers.push(
        <button
          key={pageCount}
          onClick={() => handlePageChange(pageCount)}
          className={`px-3 py-1 rounded-md ${
            currentPage === pageCount
              ? "bg-green-600 text-white"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
        >
          {pageCount}
        </button>
      );
    }
    return pageNumbers;
  };

  // --- Component Return JSX ---
  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg min-h-screen">
      {" "}
      {/* Added shadow, min-height */}
      <ToastContainer
        position="top-left" // Centered toasts might be nicer
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={true} // Enable RTL for toasts
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <h2 className="text-2xl text-center font-bold text-gray-800 mb-5">
        مدیریت دوکانداران
      </h2>
      {/* --- Add Button --- */}
      <div className="flex justify-center mb-6 items-center">
        {!showForm && (
          <button
            onClick={() => {
              setEditingCustomer(null); // Ensure clear state for add
              setShowForm(true);
            }}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors shadow hover:shadow-md"
          >
            <FiPlus size={18} />
            اضافه کردن دوکاندار جدید
          </button>
        )}
      </div>
      {/* --- Customer Form --- */}
      {showForm && (
        <div className="mb-8 transition-all duration-300 ease-in-out">
          <CustomerForm
            // Pass the full editingCustomer object
            editingCustomer={editingCustomer}
            onSuccess={handleFormSuccess}
            onError={handleFormError}
            onCancel={handleFormCancel} // Use the cancel handler
            // fetchCustomers is not directly needed by the form if parent handles it on success/cancel
            // setShowForm={setShowForm} // Handled by onCancel/onSuccess
            // setEditingCustomer={setEditingCustomer} // Handled by parent state
          />
        </div>
      )}
      {/* --- Customer List Section --- */}
      {!showForm && ( // Hide list when form is shown for better focus
        <div className="mb-8 px-2 md:px-4 lg:px-8">
          {" "}
          {/* Added padding */}
          {/* --- Search Bar --- */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-5 gap-4">
            <h2 className="text-xl font-semibold text-gray-700">
              لیست دوکانداران
            </h2>
            <div className="relative flex items-center gap-2 rounded-md w-full md:w-auto">
              <label className="hidden md:block text-gray-700 text-sm font-bold">
                جستجو:
              </label>
              <div className="relative w-full md:w-72">
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="جستجو بر اساس نام، مالک، تذکره..."
                  className="w-full px-3 py-2 pr-10 border border-gray-300 bg-gray-50 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-sm"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 hover:text-gray-600"
                    title="پاک کردن جستجو"
                  >
                    <FiX />
                  </button>
                )}
              </div>
            </div>
          </div>
          {/* --- Loading / Error / Table Display --- */}
          {isLoading && !customers.length ? ( // Show spinner only on initial load
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
          ) : error ? ( // Display fetch error prominently if list fails to load
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 text-center">
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={fetchCustomers}
                className="mt-2 text-sm text-blue-600 hover:underline"
              >
                تلاش مجدد
              </button>
            </div>
          ) : (
            <>
              <CustomerTable
                // Pass the currently paginated customers
                customers={currentCustomers}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
              />

              {/* No Results Message (if filtered list is empty but no fetch error) */}
              {filteredCustomers.length === 0 && !isLoading && !error && (
                <p className="text-center text-gray-500 mt-6 italic">
                  {searchTerm
                    ? `هیچ دوکانداری برای "${searchTerm}" یافت نشد.`
                    : "هیچ دوکانداری برای نمایش وجود ندارد."}
                </p>
              )}

              {/* Pagination Controls */}
              {pageCount > 1 && (
                <div className="flex justify-center items-center mt-6 space-x-1 md:space-x-2 rtl:space-x-reverse">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    <FiChevronRight className="ml-1 hidden sm:inline" />
                    قبلی
                  </button>
                  <div className="flex space-x-1 rtl:space-x-reverse">
                    {renderPageNumbers()}
                  </div>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pageCount}
                    className="flex items-center px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    بعدی
                    <FiChevronLeft className="mr-1 hidden sm:inline" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ShopKeepers;
