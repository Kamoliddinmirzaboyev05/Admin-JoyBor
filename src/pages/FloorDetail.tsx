import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { mockStudents } from '../data/mockStudents';

// Mock data for floors and rooms (should be moved to a shared file in real app)
const initialFloors = [
  {
    floor: '1',
    gender: 'Yigitlar',
    rooms: [
      '101-xona', '102-xona', '103-xona', '104-xona', '105-xona', '106-xona', '107-xona', '108-xona', '109-xona', '110-xona',
      '111-xona', '112-xona', '113-xona', '114-xona', '115-xona', '116-xona', '117-xona', '118-xona', '119-xona', '120-xona',
      '121-xona',
    ],
  },
  {
    floor: '2',
    gender: 'Qizlar',
    rooms: ['201-xona', '202-xona', '203-xona', '204-xona'],
  },
  {
    floor: '3',
    gender: 'Yigitlar',
    rooms: [],
  },
];

const CARD_HEIGHT = 'h-44'; // smaller fixed height for all room cards

function getShortName(fullName: string) {
  const [first, ...rest] = fullName.split(' ');
  const last = rest.length > 0 ? rest[rest.length - 1] : '';
  return `${first[0]}. ${last}`;
}

const FloorDetail = () => {
  const { floorId } = useParams();
  const navigate = useNavigate();
  const floor = initialFloors.find(f => f.floor === floorId);

  if (!floor) {
    return (
      <div className="p-8 text-center text-red-500">
        Qavat topilmadi. <button className="underline" onClick={() => navigate(-1)}>Orqaga qaytish</button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline">&larr; Orqaga</button>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{floor.floor}-qavat xonalari</h2>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${floor.gender === 'Qizlar' ? 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-200' : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'}`}>{floor.gender}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {floor.rooms.length === 0 ? (
          <span className="text-gray-400 dark:text-slate-500 col-span-full">Xona yo'q</span>
        ) : (
          floor.rooms.map(room => {
            const students = mockStudents.filter(s => s.room === room);
            return (
              <div
                key={room}
                className={`flex flex-col justify-between px-5 py-4 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white font-medium border border-gray-200 dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-blue-600 hover:border-blue-400 dark:hover:border-blue-600 focus:ring-2 focus:ring-blue-400 transition-colors shadow-sm cursor-pointer ${CARD_HEIGHT}`}
              >
                <div>
                  <div className="font-bold text-lg mb-2">{room}</div>
                  <div className="grid grid-cols-2 gap-2">
                    {students.length === 0 ? (
                      <span className="text-gray-400 dark:text-slate-400 col-span-2">Talaba yo'q</span>
                    ) : (
                      // Split students into two columns, each with up to 3 students
                      [0, 1].map(col => (
                        <div key={col} className="flex flex-col gap-1">
                          {students.slice(col * 3, col * 3 + 3).map(student => (
                            <Link
                              key={student.id}
                              to={`/profile/${student.id}`}
                              className="text-sm whitespace-nowrap text-blue-600 hover:underline dark:text-blue-400"
                            >
                              {getShortName(student.fullName)}
                            </Link>
                          ))}
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-400 dark:text-slate-400 mt-2">{students.length} ta talaba</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default FloorDetail; 