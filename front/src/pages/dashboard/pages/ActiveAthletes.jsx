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
    <div>
      <h2 className="text-lg font-semibold mb-2">
        Active Athletes (Last 30 Days)
      </h2>
      {fees.length === 0 ? (
        <p>No recent athletes found.</p>
      ) : (
        <ul className="space-y-2">
          {fees.map((fee) => (
            <li
              key={fee.id}
              className="border p-2 flex justify-between items-center"
            >
              <span>
                {fee.athlete?.name || "Unknown"} - {fee.athlete?.las_name || ""}{" "}
                ({fee.starting_date})
              </span>
              <span className="text-sm text-gray-500">Fee: {fee.fee}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ActiveAthletes;
