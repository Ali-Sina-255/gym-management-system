import { useState, useEffect } from "react";
import axios from "axios";

const Fees = () => {
  const [fees, setFees] = useState([]);
  const [athletes, setAthletes] = useState([]);
  const [formData, setFormData] = useState({
    athlete: "",
    fee: "",
    taken: "",
    remainder: "",
    starting_date: "",
  });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchFees();
    fetchAthletes();
  }, []);

  const fetchFees = async () => {
    const res = await axios.get("/api/fees/");
    setFees(res.data);
  };

  const fetchAthletes = async () => {
    const res = await axios.get("/api/athletes/");
    setAthletes(res.data);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`/api/fees/${editId}/`, formData);
      } else {
        await axios.post("/api/fees/", formData);
      }
      setFormData({
        athlete: "",
        fee: "",
        taken: "",
        remainder: "",
        starting_date: "",
      });
      setEditId(null);
      fetchFees();
    } catch (error) {
      console.error("Error saving fee:", error);
    }
  };

  const handleEdit = (fee) => {
    setEditId(fee.id);
    setFormData({
      athlete: fee.athlete,
      fee: fee.fee,
      taken: fee.taken,
      remainder: fee.remainder,
      starting_date: fee.starting_date,
    });
  };

  const handleDelete = async (id) => {
    if (confirm("آیا مطمئن هستید که می‌خواهید حذف کنید؟")) {
      await axios.delete(`/api/fees/${id}/`);
      fetchFees();
    }
  };

  return (
    <div
      className="max-w-4xl mx-auto mt-8 p-4 bg-white rounded-xl shadow-lg"
      dir="rtl"
    >
      <h2 className="text-2xl font-bold mb-4 text-center">مدیریت فیس‌ها</h2>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <div>
          <label className="block mb-1 text-sm font-medium">ورزشکار</label>
          <select
            name="athlete"
            value={formData.athlete}
            onChange={handleChange}
            className="w-full border p-2 rounded-lg"
            required
          >
            <option value="">یک ورزشکار را انتخاب کنید</option>
            {Array.isArray(athletes) &&
              athletes.length > 0 &&
              athletes.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} {a.las_name}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">مقدار فیس</label>
          <input
            name="fee"
            value={formData.fee}
            onChange={handleChange}
            type="number"
            step="0.01"
            required
            className="w-full border p-2 rounded-lg"
            placeholder="مثلاً ۵۰۰"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">
            مقدار گرفته‌شده
          </label>
          <input
            name="taken"
            value={formData.taken}
            onChange={handleChange}
            type="number"
            step="0.01"
            required
            className="w-full border p-2 rounded-lg"
            placeholder="مثلاً ۳۰۰"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">باقی‌مانده</label>
          <input
            name="remainder"
            value={formData.remainder}
            onChange={handleChange}
            type="number"
            step="0.01"
            required
            className="w-full border p-2 rounded-lg"
            placeholder="مثلاً ۲۰۰"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">تاریخ شروع</label>
          <input
            type="date"
            name="starting_date"
            value={formData.starting_date}
            onChange={handleChange}
            className="w-full border p-2 rounded-lg"
            required
          />
        </div>

        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
          {editId ? "ویرایش فیس" : "ثبت فیس"}
        </button>
      </form>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">نام ورزشکار</th>
              <th className="border p-2">مقدار فیس</th>
              <th className="border p-2">گرفته‌شده</th>
              <th className="border p-2">باقی‌مانده</th>
              <th className="border p-2">تاریخ شروع</th>
              <th className="border p-2">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(fees) &&
              fees.length > 0 &&
              fees.map((fee) => (
                <tr key={fee.id} className="text-center">
                  <td className="border p-2">
                    {athletes.find((a) => a.id === fee.athlete)?.name ||
                      "نامشخص"}
                  </td>
                  <td className="border p-2">{fee.fee}</td>
                  <td className="border p-2">{fee.taken}</td>
                  <td className="border p-2">{fee.remainder}</td>
                  <td className="border p-2">{fee.starting_date}</td>
                  <td className="border p-2 space-x-2">
                    <button
                      onClick={() => handleEdit(fee)}
                      className="text-blue-600 font-medium"
                    >
                      ویرایش
                    </button>
                    <button
                      onClick={() => handleDelete(fee.id)}
                      className="text-red-600 font-medium"
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
            {fees.length === 0 && (
              <tr>
                <td colSpan="6" className="p-4 text-gray-500 text-center">
                  هیچ فیس ثبت نشده است.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Fees;
