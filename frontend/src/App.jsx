import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import ProductsPage from "./pages/ProductsPage";
import ReservationPage from "./pages/ReservationPage";

function App() {

  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<LandingPage />}
        />

        <Route
          path="/products"
          element={<ProductsPage />}
        />

        <Route
          path="/reservations/:id"
          element={<ReservationPage />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;