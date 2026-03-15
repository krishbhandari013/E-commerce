import { Routes, Route ,BrowserRouter} from "react-router-dom";

// // Import pages
import Cart from "./pages/Cart.jsx";
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
import Footer from "./components/Footer.jsx";
import { Toaster } from 'react-hot-toast';
import PaymentSuccess from "./pages/PaymentSuccess.jsx";
import PaymentFailure from "./pages/PaymentFailure.jsx";
export const backendUrl = import.meta.env.VITE_BACKEND_URL ;


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
      <Toaster position="top-right" />
      
   

 <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/cart" element={<Cart/>} />
        <Route path="/collection" element={<Collection/>} />
        <Route path="/about" element={<About/>} />
        <Route path="/contact" element={<Contact/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/order" element={<Order/>} />
        <Route path="/place-order" element={<PlaceOrder/>} />
        <Route path="/product/:productId" element={<Product />} />
        <Route path="/payment/success" element={<PaymentSuccess/>} />
      <Route path="/payment/failure" element={<PaymentFailure />} />
        
      </Routes> 
  <Footer></Footer>
    </div>
  );
}
