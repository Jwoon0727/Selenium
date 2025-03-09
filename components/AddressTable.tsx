import React, { useState, useEffect } from 'react';

interface Address {
  id: number;
  name: string;
  address: string;
  phone: string;
  category: string;
  rating: string;
  forbidden?: string;
  memo?: string;
}

interface AddressTableProps {
  addresses: Address[];
  onAddressesUpdate?: (updatedAddresses: Address[]) => void;
}

const AddressTable = ({ addresses, onAddressesUpdate }: AddressTableProps) => {
  const [editableAddresses, setEditableAddresses] = useState<Address[]>(addresses);

  useEffect(() => {
    setEditableAddresses(addresses);
  }, [addresses]);

  const getFormattedAddress = (address: string) => {
    const parts = address.split(' ');
    const roadName = parts.find(part => part.includes('로') || part.includes('길')) || '';
    const buildingNumber = parts.find(part => /^\d+(-\d+)?$/.test(part)) || '';
    return { roadName, buildingNumber };
  };

  const handleInputChange = (
    index: number, 
    field: 'roadName' | 'buildingNumber' | 'name' | 'address' | 'forbidden' | 'memo', 
    value: string
  ) => {
    const updatedAddresses = editableAddresses.map((addr, i) => {
      if (i === index) {
        const updatedAddr = { ...addr };
        
        // 도로명이나 번지가 변경된 경우 새부주소도 함께 업데이트
        if (field === 'roadName' || field === 'buildingNumber') {
          const parts = addr.address.split(' ');
          const newParts = [...parts];
          
          if (field === 'roadName') {
            const roadIndex = parts.findIndex(part => part.includes('로') || part.includes('길'));
            if (roadIndex !== -1) {
              newParts[roadIndex] = value;
            } else {
              newParts.push(value);
            }
          } else {
            const numIndex = parts.findIndex(part => /^\d+(-\d+)?$/.test(part));
            if (numIndex !== -1) {
              newParts[numIndex] = value;
            } else {
              newParts.push(value);
            }
          }
          
          updatedAddr.address = newParts.join(' ');
        } else if (field === 'address') {
          updatedAddr.address = value;
        } else if (field === 'name') {
          updatedAddr.name = value;
        } else {
          updatedAddr[field] = value;
        }
        
        return updatedAddr;
      }
      return addr;
    });
    setEditableAddresses(updatedAddresses);
    onAddressesUpdate?.(updatedAddresses);
  };

  return (
    <div className="w-full h-full overflow-auto p-4 bg-white shadow-lg">
      <h2 className="text-lg font-semibold mb-4">검색된 주소 목록</h2>
      {editableAddresses.length > 0 ? (
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="px-4 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">도로명</th>
              <th className="px-4 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">번지</th>
              <th className="px-4 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">건물명</th>
              <th className="px-4 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">새부주소</th>
              <th className="px-4 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">금지</th>
              <th className="px-4 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">메모</th>
            </tr>
          </thead>
          <tbody>
            {editableAddresses.map((address, index) => {
              const { roadName, buildingNumber } = getFormattedAddress(address.address);
              return (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                    <input
                      type="text"
                      value={roadName}
                      onChange={(e) => handleInputChange(index, 'roadName', e.target.value)}
                      className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="도로명 입력"
                    />
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                    <input
                      type="text"
                      value={buildingNumber}
                      onChange={(e) => handleInputChange(index, 'buildingNumber', e.target.value)}
                      className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="번지 입력"
                    />
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                    <input
                      type="text"
                      value={address.name}
                      onChange={(e) => handleInputChange(index, 'name', e.target.value)}
                      className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="건물명 입력"
                    />
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                    <input
                      type="text"
                      value={address.address}
                      onChange={(e) => handleInputChange(index, 'address', e.target.value)}
                      className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="새부주소 입력"
                    />
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                    <input
                      type="text"
                      value={address.forbidden || ''}
                      onChange={(e) => handleInputChange(index, 'forbidden', e.target.value)}
                      className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="금지사항 입력"
                    />
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                    <input
                      type="text"
                      value={address.memo || ''}
                      onChange={(e) => handleInputChange(index, 'memo', e.target.value)}
                      className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="메모 입력"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-500 text-center">검색된 주소가 없습니다.</p>
      )}
    </div>
  );
};

export default AddressTable; 