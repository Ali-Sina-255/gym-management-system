import { useState, useEffect } from "react";
import { Plus, Trash, Edit } from "lucide-react";
import axios from "axios";
import { FaChevronDown, FaSearch } from "react-icons/fa";

export default function ShopManager() {
  const [shops, setShops] = useState([]);
  const [floors, setFloors] = useState([]);
  const [newShop, setNewShop] = useState({
    floor: "",
    status: null,
    shop_number: "",
    is_couple: false,
  });
  const [editIndex, setEditIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const statusOptions = ["Full", "Empty"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const shopResponse = await axios.get("http://localhost:8000/shops/");
        setShops(shopResponse.data);

        const floorResponse = await axios.get(
          "http://localhost:8000/api/flats/"
        );
        setFloors(floorResponse.data);
      } catch (err) {
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewShop({
      ...newShop,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const addOrUpdateShop = async () => {
    if (Object.values(newShop).some((val) => val === "")) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    const isEdit = editIndex !== null;
    const url = isEdit
      ? `http://localhost:8000/shops/${newShop.id}/`
      : "http://localhost:8000/shops/";

    try {
      const { data } = await axios({
        method: isEdit ? "put" : "post",
        url,
        data: newShop,
      });

      setShops((prevShops) =>
        isEdit
          ? prevShops.map((shop, idx) => (idx === editIndex ? data : shop))
          : [...prevShops, data]
      );

      setNewShop({
        floor: "",
        shop_number: "",
        is_couple: false,
      });

      setEditIndex(null);
    } catch (err) {
      setError("Failed to add or update shop");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const removeShop = async (index) => {
    const shopToRemove = shops[index];
    setLoading(true);

    try {
      await axios.delete(`http://localhost:8000/shops/${shopToRemove.id}/`);
      setShops(shops.filter((_, i) => i !== index));
    } catch (err) {
      setError("Failed to remove shop");
    } finally {
      setLoading(false);
    }
  };

  const editShop = (index) => {
    setNewShop(shops[index]);
    setEditIndex(index);
  };
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFloors = floors.filter((floor) =>
    floor.name_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFloorSelect = (floorId) => {
    handleChange({ target: { name: "floor", value: floorId } });
    setIsDropdownOpen(false);
  };
  const [isDropdownStatusOpen, setIsDropdownStatusOpen] = useState(false);

  const handleStatusSelect = (status) => {
    handleChange({ target: { name: "status", value: status } });
    setIsDropdownStatusOpen(false); // Close the dropdown after selection
  };

  return (
    <section className="  bg-white p-10 ">
      <h2 className="text-3xl font-semibold mb-6 text-center text-gray-800">
        مدیریت دوکان ها
      </h2>
      {loading && <p className="text-blue-500">Loading...</p>}
      {error && <p className="text-red-500 text-center">{error}</p>}
      <div className="max-w-5xl p-5 rounded-lg bg-gray-100 mx-auto">
        <div className=" space-y-5 mb-6">
          <div className="flex items-center gap-x-5 justify-between">
            <div className="relative flex-1">
              <div
                className="  px-3 py-2.5  border-gray-300 border flex justify-between rounded-md items-center bg-white  text-black cursor-pointer"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                {newShop.floor
                  ? floors.find((floor) => floor.id === newShop.floor)
                      ?.name_name || "انتخاب منزل"
                  : " انتخاب منزل "}
                <FaChevronDown
                  className={`transition-all duration-300 ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </div>

              {isDropdownOpen && (
                <div className="absolute w-full bg-white text-black border border-gray-300 rounded-md shadow-lg mt-1 z-10">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="جستجو کردن منزل"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full p-2 border-b pl-10 pr-5 outline-none focus:border-blue-500 bg-gray-300 placeholder-gray-700"
                    />
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-700" />
                  </div>
                  <ul className="max-h-60 overflow-y-auto">
                    {filteredFloors.map((floor) => (
                      <li
                        key={floor.id}
                        className="py-2 px-6 hover:bg-gray-200 border-b border-gray-300 text-black cursor-pointer"
                        onClick={() => handleFloorSelect(floor.id)}
                      >
                        {floor.name_name}
                      </li>
                    ))}
                    {filteredFloors.length === 0 && (
                      <li className="p-3 text-gray-500">No results found</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
            <div className="flex-1">
              <input
                type="text"
                name="shop_number"
                placeholder="Shop Number"
                value={newShop.shop_number}
                onChange={handleChange}
                className="border border-gray-300 bg-white p-2.5 text-gray-800 rounded-md w-full focus:outline-none "
              />
            </div>
          </div>

          <div className="flex items-center justify-center gap-x-5 ">
            <label className="chec-container flex items-center  gap-2 col-span-2">
              <input
                type="checkbox"
                name="is_couple"
                checked={newShop.is_couple}
                onChange={handleChange}
                className="accent-blue-500 w-5 h-5"
              />
              <svg viewBox="0 0 64 64" height="1em" width="2em">
                <path
                  d="M 0 16 V 56 A 8 8 90 0 0 8 64 H 56 A 8 8 90 0 0 64 56 V 8 A 8 8 90 0 0 56 0 H 8 A 8 8 90 0 0 0 8 V 16 L 32 48 L 64 16 V 8 A 8 8 90 0 0 56 0 H 8 A 8 8 90 0 0 0 8 V 56 A 8 8 90 0 0 8 64 H 56 A 8 8 90 0 0 64 56 V 16"
                  pathLength="575.0541381835938"
                  className="path"
                ></path>
              </svg>
              <span className="text-gray-700">چند دوکانه</span>
            </label>
            <div className="mb-4 relative mt-3 w-[300px]">
              {/* Dropdown Button */}
              <div
                className="w-full px-3 py-2.5 border border-gray-300 flex justify-between items-center bg-white rounded-lg text-black cursor-pointer"
                onClick={() => setIsDropdownStatusOpen(!isDropdownStatusOpen)}
              >
                {newShop.status || "وضعیت"}
                <FaChevronDown
                  className={`transition-all duration-300 ${
                    isDropdownStatusOpen ? "rotate-180" : ""
                  }`}
                />
              </div>

              {/* Dropdown List */}
              {isDropdownStatusOpen && (
                <div className="absolute w-full bg-white text-black border border-gray-300 rounded-md shadow-lg mt-1 z-10">
                  <ul className="max-h-[300px] overflow-y-auto">
                    {statusOptions.map((status, index) => (
                      <li
                        key={index}
                        className="py-2 px-5 hover:bg-gray-200 border-b border-gray-300 text-black cursor-pointer"
                        onClick={() => handleStatusSelect(status)}
                      >
                        {status}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center">
            <button
              onClick={addOrUpdateShop}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium p-2.5 rounded-lg shadow-md transition duration-300 ease-in-out"
              disabled={loading}
            >
              <Plus className="w-5 h-5" />
              <span>افزودن دوکان </span>
            </button>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-5xl mt-10">
        <table className="w-full bg-white  overflow-hidden">
          <thead>
            <tr className="bg-blue-100 text-gray-700">
              <th className="p-3 text-sm font-semibold uppercase tracking-wider w-1/4">
                طبقه
              </th>
              <th className="p-3 text-sm font-semibold uppercase tracking-wider w-1/4">
                شماره دوکان
              </th>
              <th className="p-3 text-sm font-semibold uppercase tracking-wider w-1/4">
              چند دوکانه
              </th>
              <th className="p-3 text-sm font-semibold uppercase tracking-wider w-1/4">
                اقدامات
              </th>
            </tr>
          </thead>

          <tbody>
            {shops.map((shop, index) => (
              <tr
                key={index}
                className="border-b border-gray-400 hover:bg-gray-100 text-center transition-colors duration-200"
              >
                <td className="p-3 text-sm">
                  {floors.find((floor) => floor.id == shop.floor)?.name_name}
                </td>
                <td className="p-3 text-sm">{shop.shop_number}</td>
                <td className="p-3 text-sm">{shop.is_couple ? "Yes" : "No"}</td>
                <td className="p-3 flex gap-4 justify-center">
                  <button
                    onClick={() => editShop(index)}
                    className="text-green-500 hover:text-green-600 transition-colors"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => removeShop(index)}
                    className="text-red-500 hover:text-red-600 transition-colors"
                  >
                    <Trash className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
