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

export default function App() {
  return (
    <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
      
      <Navbar />
      

 <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/craft" element={<Craft/>} />
        <Route path="/collection" element={<Collection/>} />
        <Route path="/about" element={<About/>} />
        <Route path="/contact" element={<Contact/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/order" element={<Order/>} />
        <Route path="/place-order" element={<PlaceOrder/>} />
        <Route path="/product/:id" element={<Product/>} />
      </Routes> 

    </div>
  );
}
