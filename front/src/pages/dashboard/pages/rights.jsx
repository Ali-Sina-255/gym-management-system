import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaRegEdit } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";

const Rights = () => {
  const [rightsData, setRightsData] = useState({
    name: "",
  });
  const [rightsList, setRightsList] = useState([0]);
  const [editingId, setEditingId] = useState(null);
  const [add, setAdd] = useState(false);
  const [selectedRight, setSelectedRight] = useState(rightsList[0] || null);

  const handleDetails = (right) => {
    setSelectedRight(right);
  };

  // Fetch rights data from the API
  useEffect(() => {
    axios
      .get("http://localhost:8000/rights/rights/")
      .then((response) => {
        setRightsList(response.data);
      })
      .catch((error) => {
        console.error("Error fetching rights data:", error);
      });
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setRightsData({ ...rightsData, [name]: value });
  };

  // Handle form submission (add or update)
  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingId) {
      // Update rights entry
      axios
        .put(`http://localhost:8000/rights/rights/${editingId}/`, rightsData)
        .then((response) => {
          setRightsList(
            rightsList.map((right) =>
              right.id === editingId ? response.data : right
            )
          );
          resetForm();
        })
        .catch((error) => console.error("Error updating right:", error));
    } else {
      // Create new rights entry
      axios
        .post("http://localhost:8000/rights/rights/", rightsData)
        .then((response) => {
          setRightsList([...rightsList, response.data]);
          resetForm();
        })
        .catch((error) => console.error("Error adding right:", error));
    }
  };

  // Reset form after submission
  const resetForm = () => {
    setRightsData({ name: "" });
    setEditingId(null);
  };

  // Handle delete rights entry
  const handleDelete = (id) => {
    axios
      .delete(`http://localhost:8000/rights/rights/${id}/`)
      .then(() => {
        setRightsList(rightsList.filter((right) => right.id !== id));
      })
      .catch((error) => {
        console.error(
          "Error deleting right:",
          error.response?.data || error.message
        );
      });
  };

  // Handle edit rights entry
  const handleEdit = (right) => {
    setEditingId(right.id);
    setRightsData(right);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        مدیریت صاحب امتیاز های مارکیت حسین زاده
      </h1>
      <div className="flex justify-center items-center">
        {!add && (
          <button
            onClick={() => setAdd(true)}
            className="px-5 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
          >
            افزودن صاحب امتیاز جدید
          </button>
        )}
      </div>

      {add && (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 max-w-lg mx-auto bg-white p-6 shadow-xl rounded-lg border border-gray-200"
        >
          <div>
            <label
              htmlFor="name"
              className="block text-gray-700 text-lg font-semibold mb-2"
            >
              نام صاحب امتیاز
            </label>
            <input
              type="text"
              name="name"
              value={rightsData.name}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="نام صاحب امتیاز وارد کنید"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
          >
            {editingId ? "به‌ روزرسانی صاحب امتیاز" : "افزودن صاحب امتیاز"}
          </button>
          <div className="flex justify-center mt-4">
            <button
              onClick={() => setAdd(false)}
              type="button"
              className="px-5 py-2 bg-gray-400 text-white font-semibold rounded-md hover:bg-gray-500 transition-colors"
            >
              بستن فرم
            </button>
          </div>
        </form>
      )}

      {/* Rights List Table */}
      <div className="p-6 grid grid-cols-3 border gap-5 border-gray-300 bg-amber-50 mt-5">
        {/* Owners List Grid */}
        <div className="gap-6 col-span-2 border border-gray-300 rounded-lg">
          {rightsList.map((right) => (
            <div
              key={right.id}
              className="bg-white flex justify-between rounded-lg items-center p-4"
            >
              {/* User Image and Name */}
              <div className="flex items-center gap-4 w-1/3 flex-shrink-0">
                <span className="ml-2">{right.id}</span>
                <img
                  src={right.image || "https://via.placeholder.com/150"}
                  alt={right.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                />
                <h3 className="text-lg font-semibold text-gray-800 truncate">
                  {right.name}
                </h3>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 w-1/3 justify-center flex-shrink-0">
                <button
                  onClick={() => {
                    handleEdit(right);
                    setAdd(true);
                  }}
                  className="text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <FaRegEdit size={20} />
                </button>
                <button
                  onClick={() => handleDelete(right.id)}
                  className="text-red-600 hover:text-red-700 transition-colors"
                >
                  <MdDeleteForever size={24} />
                </button>
              </div>

              {/* Details Button */}
              <div className="flex justify-end w-1/3 flex-shrink-0">
                <button
                  onClick={() => handleDetails(right)}
                  className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
                >
                  جزییات
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Item Details */}
        <div className="col-span-1 border rounded-lg bg-white border-gray-300 p-4">
          {selectedRight ? (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-800">صاحب امتیاز</h2>
              <div className="flex items-center gap-4">
                <img
                  src={selectedRight.image || "https://via.placeholder.com/150"}
                  alt={selectedRight.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                />
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {selectedRight.name}
                  </h3>
                  <p className="text-gray-600">آیدی: {selectedRight.id}</p>
                </div>
              </div>
              <p className="text-gray-700">
                جزییات بیشتر در اینجا نمایش داده خواهد شد.
              </p>
            </div>
          ) : (
            <p className="text-gray-600">هیچ جزییاتی انتخاب نشده است.</p>
          )}
        </div>
      </div>

      {/* Form for adding or updating rights */}
    </div>
  );
};

export default Rights;
