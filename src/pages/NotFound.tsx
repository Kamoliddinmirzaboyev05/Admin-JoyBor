import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SEOHead from "../components/SEO/SEOHead";

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // 404 sahifa uchun status kodni o'rnatish
    document.title = "404 - Sahifa topilmadi | JoyBor Admin";
  }, []);

  return (
    <>
      <SEOHead 
        title="404 - Sahifa topilmadi | JoyBor Admin"
        description="Kechirasiz, siz izlagan sahifa JoyBor Admin tizimida mavjud emas. Bosh sahifaga qaytishingiz mumkin."
        keywords="404, sahifa topilmadi, xato, JoyBor admin"
      />
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
    </>
  );
};

export default NotFound; 