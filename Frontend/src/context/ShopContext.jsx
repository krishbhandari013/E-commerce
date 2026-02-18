import { createContext } from "react"
import{products} from "../assets/assets"

export const ShopContext = createContext();


function ShopContestProvider(props) {
     const currency = '$';
    const delivery_free = 10;
    const value = {
        products, currency,delivery_free
    }

  return (
    
    <ShopContext.Provider value={value}>
        {props.children}
    </ShopContext.Provider>
  )
}

export default ShopContestProvider;
