import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import api from "../api/api";

function ProductsPage() {

  const navigate = useNavigate();

  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const user = JSON.parse(
    localStorage.getItem("user")
  );

 

  const fetchProducts = async () => {

    try {

      const response = await api.get("/products");

      setProducts(response.data);

    } catch (error) {

      console.log(error);

      setError("Failed to load products");

    } finally {

      setLoading(false);
    }
  };
   useEffect(() => {

    fetchProducts();

  }, []);

  const reserveProduct = async (
    productId,
    warehouseId
  ) => {

    try {

      setError("");

      const response = await api.post(
        "/reservations",
        {
          userId: user.id,
          productId,
          warehouseId,
          quantity: 1
        }
      );

      navigate(
        `/reservations/${response.data.reservation.id}`
      );

    } catch (error) {

      console.log(error);

      if (error.response?.status === 409) {

        setError(
          "Not enough stock available"
        );

        return;
      }

      setError("Reservation failed");
    }
  };

  if (loading) {

    return (
      <div className="p-10">
        Loading...
      </div>
    );
  }

  return (

    <div className="min-h-screen bg-gray-100 p-8">

      <div className="max-w-5xl mx-auto">

        <div className="flex items-center justify-between mb-8">

          <h1 className="text-3xl font-bold">
            Products
          </h1>

          <div className="font-medium">
            User: {user.name}
          </div>

        </div>

        {
          error && (

            <div className="bg-red-100 text-red-600 p-4 rounded-lg mb-6">
              {error}
            </div>
          )
        }

        <div className="space-y-6">

          {
            products.map((product) => (

              <div
                key={product.id}

                className="bg-white rounded-xl shadow-md p-6"
              >

                <h2 className="text-2xl font-bold mb-2">
                  {product.name}
                </h2>

                <p className="text-gray-600 mb-4">
                  {product.description}
                </p>

                <div className="grid md:grid-cols-2 gap-4">

                  {
                    product.warehouses.map((warehouse) => (

                      <div
                        key={warehouse.warehouseId}

                        className="border rounded-lg p-4"
                      >

                        <h3 className="font-semibold text-lg">
                          {warehouse.warehouseName}
                        </h3>

                        <p className="text-gray-600">
                          {warehouse.city}
                        </p>

                        <p className="mt-2">
                          Available Stock:
                          <span className="font-bold ml-2">
                            {warehouse.availableStock}
                          </span>
                        </p>

                        <button

                          onClick={() =>
                            reserveProduct(
                              product.id,
                              warehouse.warehouseId
                            )
                          }

                          disabled={
                            warehouse.availableStock <= 0
                          }

                          className="mt-4 bg-black text-white px-5 py-2 rounded-lg disabled:bg-gray-400"
                        >
                          Reserve
                        </button>

                      </div>
                    ))
                  }

                </div>

              </div>
            ))
          }

        </div>

      </div>

    </div>
  );
}

export default ProductsPage;