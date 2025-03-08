interface Address {
  id: number;
  name: string;
  address: string;
  phone: string;
  category: string;
  rating: string;
}

interface AddressTableProps {
  addresses: Address[];
}

const AddressTable = ({ addresses }: AddressTableProps) => {
  return (
    <div className="w-full h-full overflow-auto p-4 bg-white shadow-lg">
      <h2 className="text-lg font-semibold mb-4">검색된 주소 목록</h2>
      {addresses.length > 0 ? (
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="px-4 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-4 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름</th>
              <th className="px-4 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">주소</th>
              <th className="px-4 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">전화번호</th>
              <th className="px-4 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">카테고리</th>
              <th className="px-4 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">평점</th>
            </tr>
          </thead>
          <tbody>
            {addresses.map((address, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{address.id}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{address.name}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{address.address}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{address.phone}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{address.category}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{address.rating}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-500 text-center">검색된 주소가 없습니다.</p>
      )}
    </div>
  );
};

export default AddressTable; 