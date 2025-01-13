'use client';
import React, { useState } from 'react';

interface Property {
  id: number;
  imageUrl: string;
  propertyName: string;
  propertyType: string;
  numberOfRooms: number;
  description: string;
  address: string;
}

const ManageProperty: React.FC = () => {
  
  const dummyData: Property[] = [
        {
        id: 1,
        imageUrl: 'https://via.placeholder.com/150',
        propertyName: 'Modern Apartment',
        propertyType: 'Apartment',
        numberOfRooms: 3,
        description: 'A cozy 3-bedroom apartment in the city center.',
        address: '123 Main Street, City Center',
        },
        {
        id: 2,
        imageUrl: 'https://via.placeholder.com/150',
        propertyName: 'Luxury Villa',
        propertyType: 'Villa',
        numberOfRooms: 5,
        description: 'A luxurious villa with a private pool and garden.',
        address: '45 Greenway, Suburban Area',
        },
        {
        id: 3,
        imageUrl: 'https://via.placeholder.com/150',
        propertyName: 'Studio Apartment',
        propertyType: 'Studio',
        numberOfRooms: 1,
        description: 'A compact studio apartment, perfect for singles.',
        address: '88 Downtown Lane, Urban District',
        },
        {
        id: 4,
        imageUrl: 'https://via.placeholder.com/150',
        propertyName: 'Beachside Cottage',
        propertyType: 'Cottage',
        numberOfRooms: 2,
        description: 'A serene beachside cottage with beautiful views.',
        address: '5 Ocean Drive, Coastal Area',
        },
        {
        id: 5,
        imageUrl: 'https://via.placeholder.com/150',
        propertyName: 'Penthouse Suite',
        propertyType: 'Penthouse',
        numberOfRooms: 4,
        description: 'An exclusive penthouse with panoramic city views.',
        address: '100 Highrise Blvd, Elite District',
        },
    ];

  const [properties, setProperties] = useState<Property[]>(dummyData);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(3); // Properties per page

  // Handle search functionality
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
  };

  // Filtered and paginated properties
  const filteredProperties = properties.filter(
    (property) =>
      property.propertyName.toLowerCase().includes(searchQuery) ||
      property.propertyType.toLowerCase().includes(searchQuery) ||
      property.address.toLowerCase().includes(searchQuery)
  );

  const totalItems = filteredProperties.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProperties = filteredProperties.slice(indexOfFirstItem, indexOfLastItem);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleDelete = (propertyId: number) => {
    if (confirm('Are you sure you want to delete this property?')) {
      setProperties((prev) => prev.filter((property) => property.id !== propertyId));
      alert('Property deleted successfully!');
    }
  };

  return (
    <div className="w-full container px-4 py-8 flex flex-col gap-4">
      <h1 className='text-black/80 text-[1.5rem] font-semibold'>Manage Properties</h1>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search properties by name, type, or address..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-full text-[.8em] border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-orange-500"
        />
      </div>

      {/* Properties Table */}
      <div className="overflow-x-auto ">
        <table className="min-w-full bg-white border border-gray-200 rounded-xl">
          <thead>
            <tr className="text-left bg-black/80 rounded-xl">
              <th className="p-4 text-[.8em] font-medium text-white">Image</th>
              <th className="p-4 text-[.8em] font-medium text-white">Property</th>
              <th className="p-4 text-[.8em] font-medium text-white">Type</th>
              <th className="p-4 text-[.8em] font-medium text-white">Rooms</th>
              <th className="p-4 text-[.8em] font-medium text-white">Description</th>
              <th className="p-4 text-[.8em] font-medium text-white">Address</th>
              <th className="p-4 text-[.8em] font-medium text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentProperties.map((property) => (
              <tr
                key={property.id}
                className="border-b hover:bg-gray-100 transition-colors"
              >
                <td className="p-4">
                  <img
                    src={property.imageUrl}
                    alt={property.propertyName}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                </td>
                <td className="p-4 text-gray-700 text-[.8em]">{property.propertyName}</td>
                <td className="p-4 text-gray-700 text-[.8em]">{property.propertyType}</td>
                <td className="p-4 text-gray-700 text-[.8em]">{property.numberOfRooms}</td>
                <td className="p-4 text-gray-700 text-[.8em] truncate max-w-xs">
                  {property.description}
                </td>
                <td className="p-4 text-gray-700 text-[.8em]">{property.address}</td>
                <td className="p-4 text-gray-700 text-[.8em]">
                  <button
                    onClick={() => handleDelete(property.id)}
                    className="px-4 py-2 bg-red-500 text-white text-[.8em] rounded hover:bg-red-600 focus:outline-none"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-300 text-gray-700 text-[.8em] rounded disabled:opacity-50 hover:bg-gray-400"
        >
          Previous
        </button>
        <span className="text-gray-700 text-[.8em]">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-gray-300 text-gray-700 text-[.8em] rounded disabled:opacity-50 hover:bg-gray-400"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ManageProperty;







//--------NONE---DUMMY---------//

// 'use client';

// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

// interface Property {
//   id: number;
//   imageUrl: string;
//   propertyName: string;
//   propertyType: string;
//   numberOfRooms: number;
//   description: string;
//   address: string;
// }

// const ManageProperty: React.FC = () => {
//   const [properties, setProperties] = useState<Property[]>([]);
//   const [searchQuery, setSearchQuery] = useState<string>('');
//   const [currentPage, setCurrentPage] = useState<number>(1);
//   const [itemsPerPage] = useState<number>(3);
//   const [isLoading, setIsLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);

//   // Fetch properties from API
//   useEffect(() => {
//     const fetchProperties = async () => {
//       setIsLoading(true);
//       setError(null);

//       try {
//         const response = await axios.get('/api/agents/properties'); // Adjust API endpoint as needed
//         setProperties(response.data); // Assuming response.data is an array of properties
//       } catch (err) {
//         setError('Failed to fetch properties. Please try again later.');
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchProperties();
//   }, []);

//   // Filtered and paginated properties
//   const filteredProperties = properties.filter(
//     (property) =>
//       property.propertyName.toLowerCase().includes(searchQuery) ||
//       property.propertyType.toLowerCase().includes(searchQuery) ||
//       property.address.toLowerCase().includes(searchQuery)
//   );

//   const totalItems = filteredProperties.length;
//   const totalPages = Math.ceil(totalItems / itemsPerPage);
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentProperties = filteredProperties.slice(indexOfFirstItem, indexOfLastItem);

//   const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setSearchQuery(e.target.value.toLowerCase());
//   };

//   const handleNextPage = () => {
//     if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
//   };

//   const handlePreviousPage = () => {
//     if (currentPage > 1) setCurrentPage((prev) => prev - 1);
//   };

//   const handleDelete = async (propertyId: number) => {
//     if (confirm('Are you sure you want to delete this property?')) {
//       try {
//         await axios.delete(`/api/agents/properties/${propertyId}`); // Adjust endpoint as needed
//         setProperties((prev) => prev.filter((property) => property.id !== propertyId));
//         alert('Property deleted successfully!');
//       } catch (err) {
//         alert('Failed to delete property. Please try again.');
//       }
//     }
//   };

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h1 className="text-2xl font-semibold text-orange-500 mb-6">Manage Properties</h1>

//       {/* Loading State */}
//       {isLoading && <p className="text-center text-gray-500">Loading properties...</p>}

//       {/* Error Message */}
//       {error && <p className="text-center text-red-500">{error}</p>}

//       {!isLoading && !error && (
//         <>
//           {/* Search Bar */}
//           <div className="mb-6">
//             <input
//               type="text"
//               placeholder="Search properties by name, type, or address..."
//               value={searchQuery}
//               onChange={handleSearch}
//               className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
//             />
//           </div>

//           {/* Properties Table */}
//           <div className="overflow-x-auto">
//             <table className="min-w-full bg-white border border-gray-200 rounded-lg">
//               <thead>
//                 <tr className="text-left bg-gray-100 border-b border-gray-200">
//                   <th className="p-4 text-sm font-medium text-gray-700">Image</th>
//                   <th className="p-4 text-sm font-medium text-gray-700">Property Name</th>
//                   <th className="p-4 text-sm font-medium text-gray-700">Type</th>
//                   <th className="p-4 text-sm font-medium text-gray-700">Rooms</th>
//                   <th className="p-4 text-sm font-medium text-gray-700">Description</th>
//                   <th className="p-4 text-sm font-medium text-gray-700">Address</th>
//                   <th className="p-4 text-sm font-medium text-gray-700">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {currentProperties.map((property) => (
//                   <tr key={property.id} className="border-b hover:bg-gray-50 transition-colors">
//                     <td className="p-4">
//                       <img
//                         src={property.imageUrl}
//                         alt={property.propertyName}
//                         className="w-20 h-20 object-cover rounded-lg"
//                       />
//                     </td>
//                     <td className="p-4 text-gray-700 text-sm">{property.propertyName}</td>
//                     <td className="p-4 text-gray-700 text-sm">{property.propertyType}</td>
//                     <td className="p-4 text-gray-700 text-sm">{property.numberOfRooms}</td>
//                     <td className="p-4 text-gray-700 text-sm truncate max-w-xs">
//                       {property.description}
//                     </td>
//                     <td className="p-4 text-gray-700 text-sm">{property.address}</td>
//                     <td className="p-4 text-gray-700 text-sm">
//                       <button
//                         onClick={() => handleDelete(property.id)}
//                         className="px-4 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600 focus:outline-none"
//                       >
//                         Delete
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {/* Pagination Controls */}
//           <div className="flex justify-between items-center mt-4">
//             <button
//               onClick={handlePreviousPage}
//               disabled={currentPage === 1}
//               className="px-4 py-2 bg-gray-300 text-gray-700 text-sm rounded disabled:opacity-50 hover:bg-gray-400"
//             >
//               Previous
//             </button>
//             <span className="text-gray-700 text-sm">
//               Page {currentPage} of {totalPages}
//             </span>
//             <button
//               onClick={handleNextPage}
//               disabled={currentPage === totalPages}
//               className="px-4 py-2 bg-gray-300 text-gray-700 text-sm rounded disabled:opacity-50 hover:bg-gray-400"
//             >
//               Next
//             </button>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default ManageProperty;
