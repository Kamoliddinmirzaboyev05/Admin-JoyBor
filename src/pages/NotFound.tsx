import React from "react";
import { useNavigate } from "react-router-dom";

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-6xl font-bold text-blue-600 mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-2">Sahifa topilmadi</h2>
      <p className="text-gray-500 mb-6">Kechirasiz, siz izlagan sahifa mavjud emas yoki o'chirib yuborilgan.</p>
      <button
        onClick={() => navigate("/")}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors"
      >
        Bosh sahifa
      </button>
    </div>
  );
};

export default NotFound; 