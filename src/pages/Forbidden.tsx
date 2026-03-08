import React from "react";

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800">
      <h1 className="text-6xl font-bold mb-4">403</h1>
      <p className="text-xl mb-6">FORBIDDEN!</p>
    </div>
  );
};

export default NotFound;
