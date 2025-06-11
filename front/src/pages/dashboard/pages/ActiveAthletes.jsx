import React, { useEffect, useState } from "react";
const BASE_URL = import.meta.env.VITE_BASE_URL;
const ActiveAthletes = () => {
  const [fees, setFees] = useState([]);
  const [athletes, setAthletes] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [feesRes, athletesRes] = await Promise.all([
          fetch(`${BASE_URL}/core/fees/`),
          fetch(`${BASE_URL}/core/athletes/`),
        ]);

        const feesData = await feesRes.json();
        const athletesData = await athletesRes.json();

        const today = new Date();
        const date30DaysAgo = new Date(today.setDate(today.getDate() - 30));

        // Filter fees in last 30 days
        const filteredFees = feesData.filter((fee) => {
          const feeDate = new Date(fee.starting_date);
          return feeDate >= date30DaysAgo;
        });

        // Merge athlete info into each fee
        const enrichedFees = filteredFees.map((fee) => {
          const athlete = athletesData.find((a) => a.id === fee.athlete);
          return { ...fee, athlete };
        });

        setFees(enrichedFees);
        setAthletes(athletesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-5xl mx-auto">
      <h2 className="text-xl font-bold mb-4 text-gray-800 border-b border-gray-300 pb-2 text-right">
        ورزشکاران فعال (۳۰ روز گذشته)
      </h2>
      {fees.length === 0 ? (
        <p className="text-center text-gray-500 py-10 text-lg">
          ورزشکار فعالی یافت نشد.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 rounded-lg divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-blue-100 to-blue-200">
              <tr>
                {[
                  "تصویر ورزشکار",
                  "نام ورزشکار",
                  "تاریخ شروع",
                  "فیس",
                  "فیس گرفته‌شده",
                  "فیس باقی",
                ].map((header) => (
                  <th
                    key={header}
                    className="text-gray-700 font-semibold text-right px-4 py-3"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {fees.map((fee) => (
                <tr
                  key={fee.id}
                  className="hover:bg-blue-50 transition-colors duration-200 cursor-pointer"
                >
                  <td className="px-4 py-3 border-r border-gray-200 text-center">
                    {fee.athlete?.picture ? (
                      <img
                        src={fee.athlete.picture}
                        alt={`${fee.athlete.name} ${fee.athlete.last_name}`}
                        className="h-12 w-12 rounded-full object-cover shadow-sm mx-auto"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs font-semibold mx-auto">
                        بدون تصویر
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-800 font-medium text-right">
                    {fee.athlete?.name || "نامشخص"}{" "}
                    {fee.athlete?.last_name || ""}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-right">
                    {fee.starting_date}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-right">
                    {fee.fee}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-right">
                    {fee.taken}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-right">
                    {fee.remainder}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ActiveAthletes;
