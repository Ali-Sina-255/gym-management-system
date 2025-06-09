import React, { useEffect, useState } from "react";
import axios from "axios";
const BASE_URL = import.meta.env.VITE_BASE_URL 
const Athletes = () => {
  const [athletes, setAthletes] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    last_name: "",
    father_name: "",
    current_location: "",
    permanent_location: "",
    date_of_birth: "",
    nic: null,
    picture: null,
    document: null,
  });

  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchAthletes();
  }, []);

  const fetchAthletes = async () => {
    const res = await axios.get(`${BASE_URL}/core/athletes/`);
    setAthletes(res.data);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) data.append(key, value);
    });

    try {
      if (editId) {
        await axios.put(`${BASE_URL}/core/athletes/${editId}/`, data);
        setEditId(null);
      } else {
        await axios.post(`${BASE_URL}/core/athletes/`, data);
      }
      setFormData({
        name: "",
        last_name: "",
        father_name: "",
        current_location: "",
        permanent_location: "",
        date_of_birth: "",
        nic: null,
        picture: null,
        document: null,
      });
      fetchAthletes();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (athlete) => {
    setEditId(athlete.id);
    setFormData({
      name: athlete.name,
      last_name: athlete.last_name,
      father_name: athlete.father_name,
      current_location: athlete.current_location,
      permanent_location: athlete.permanent_location,
      date_of_birth: athlete.date_of_birth,
      nic: null,
      picture: null,
      document: null,
    });
  };

  const handleDelete = async (id) => {
    await axios.delete(`${BASE_URL}/core/athletes/${id}/`);
    fetchAthletes();
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">مدیریت ورزشکاران</h1>

      <form
        onSubmit={handleSubmit}
        className="mb-8 space-y-6 bg-white p-6 rounded-2xl shadow-lg max-w-2xl mx-auto"
      >
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
          {editId ? "ویرایش ورزشکار" : "ایجاد ورزشکار"}
        </h2>

        {[
          { name: "name", label: "نام" },
          { name: "last_name", label: "نام خانوادگی" },
          { name: "father_name", label: "نام پدر" },
          { name: "current_location", label: "محل فعلی" },
          { name: "permanent_location", label: "محل اصلی" },
          { name: "date_of_birth", label: "تاریخ تولد", type: "date" },
        ].map(({ name, label, type = "text" }) => (
          <div key={name} className="relative">
            <label
              htmlFor={name}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {label}
            </label>
            <input
              id={name}
              name={name}
              type={type}
              value={formData[name]}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}

        {[
          { name: "nic", label: "فایل تذکره/کارت هویت" },
          { name: "picture", label: "عکس" },
          { name: "document", label: "اسناد" },
        ].map(({ name, label }) => (
          <div key={name} className="relative">
            <label
              htmlFor={name}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {label}
            </label>
            <input
              id={name}
              name={name}
              type="file"
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
        ))}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200"
        >
          {editId ? "ویرایش ورزشکار" : "ایجاد ورزشکار"}
        </button>
      </form>

      <ul className="space-y-2">
        {Array.isArray(athletes) &&
          athletes.length > 0 &&
          athletes.map((athlete) => (
            <li
              key={athlete.id}
              className="border p-2 flex justify-between items-center"
            >
              <span>
                {athlete.name} - {athlete.last_name}
              </span>
              <div className="space-x-2">
                <button
                  onClick={() => handleEdit(athlete)}
                  className="bg-yellow-400 px-2 py-1"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(athlete.id)}
                  className="bg-red-500 text-white px-2 py-1"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default Athletes;
