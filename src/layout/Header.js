// import React, { useCallback } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { Link, useHistory } from 'react-router-dom';
// import { logout } from '../features/auth/authSlice';

// const Header = () => {
//   const dispatch = useDispatch();
//   const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
//   const history = useHistory();

//   const handleLogout = useCallback(() => {
//     dispatch(logout());
//     history.push('/login');
//   }, [dispatch, history]);

//   return (
//     <header className="bg-indigo-600 text-white py-4 shadow-md">
//       <nav className="container mx-auto flex  items-center border p-4 rounded-lg shadow-lg">
//         <Link to="/" className="text-2xl font-bold border-b-2 border-transparent hover:border-white">
//           Task Management
//         </Link>
//         <div>
//           {isAuthenticated ? (
//             <button
//               onClick={handleLogout}
//               className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
//             >
//               Logout
//             </button>
//           ) : (
//             <div>
//               <Link to="/login" className="mr-4 text-white hover:underline">Login</Link>
//               <Link to="/signup" className="text-white hover:underline">Signup</Link>
//             </div>
//           )}
//         </div>
//       </nav>
//     </header>
//   );
// };

// export default Header;
