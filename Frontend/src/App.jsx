import { Routes, Route ,BrowserRouter} from "react-router-dom";

// // Import pages
import Craft from "./pages/Craft.jsx";
import Collection from "./pages/Collection";
import Contact from "./pages/Contact";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Order from "./pages/Order";
import PlaceOrder from "./pages/PlaceOrder";
import Product from "./pages/Product";
import About from "./pages/About"; // ✅ ADD THIS
import Navbar from "./components/Navbar";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function App() {
  return (
    <div className="px-4 max-w-[2560px] mx-auto px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 ">
      
      <Navbar />
       <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
   

 <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/craft" element={<Craft/>} />
        <Route path="/collection" element={<Collection/>} />
        <Route path="/about" element={<About/>} />
        <Route path="/contact" element={<Contact/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/order" element={<Order/>} />
        <Route path="/place-order" element={<PlaceOrder/>} />
        <Route path="/product/:productId" element={<Product />} />
      </Routes> 

    </div>
  );
}
