import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import api from "../api/api";

function ReservationPage() {

  const { id } = useParams();

  const navigate = useNavigate();

  const [reservation, setReservation] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [timeLeft, setTimeLeft] = useState("");
  const [flag, setFlag] = useState(false);

  useEffect(() => {

    fetchReservation();

  }, []);

  useEffect(() => {

    if (!reservation) return;

    const interval = setInterval(() => {

      const now = new Date();

      const expiry = new Date(
        reservation.expiresAt
      );

      const difference =
        expiry.getTime() - now.getTime();

      if (difference <= 0) {

        setTimeLeft("Expired");

        clearInterval(interval);

        return;
      }

      const minutes = Math.floor(
        difference / 1000 / 60
      );

      const seconds = Math.floor(
        (difference / 1000) % 60
      );

      setTimeLeft(
        `${minutes}m ${seconds}s`
      );

    }, 1000);

    return () => clearInterval(interval);

  }, [reservation]);

  const fetchReservation = async () => {

    try {

      const response = await api.get(
        `/reservations/${id}`
      );

      setReservation(response.data);

    } catch (error) {

      console.log(error);

      setError("Failed to load reservation");

    } finally {

      setLoading(false);
    }
  };

  const confirmReservation = async () => {
    setFlag(!flag);
    try {

      setError("");

      await api.post(`/reservations/${id}/confirm`);

      // refetch full reservation (includes product/warehouse)
      fetchReservation();

    } catch (error) {

      console.log(error);

      if (error.response?.status === 410) {

        setError(
          "Reservation expired"
        );

        fetchReservation();

        return;
      }

      setError(
        "Failed to confirm reservation"
      );
    }
  };

  const cancelReservation = async () => {
    setFlag(!flag);
    try {

      setError("");

      await api.post(`/reservations/${id}/release`);

      // refetch full reservation (includes product/warehouse)
      fetchReservation();

    } catch (error) {

      console.log(error);

      setError(
        "Failed to cancel reservation"
      );
    }
  };

  if (loading) {

    return (
      <div className="p-10">
        Loading...
      </div>
    );
  }

  if (!reservation) {

    return (
      <div className="p-10">
        Reservation not found
      </div>
    );
  }

  return (

    <div className="min-h-screen bg-gray-100 p-8">

      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8">

        <h1 className="text-3xl font-bold mb-6">
          Reservation Details
        </h1>

        {
          error && (

            <div className="bg-red-100 text-red-600 p-4 rounded-lg mb-6">
              {error}
            </div>
          )
        }

        <div className="space-y-4">

          <div>
            <span className="font-semibold">
              Product:
            </span>

            <span className="ml-2">
              {reservation.product?.name || "Unknown product"}
            </span>
          </div>

          <div>
            <span className="font-semibold">
              Warehouse:
            </span>

            <span className="ml-2">
              {reservation.warehouse?.name || "Unknown warehouse"}
            </span>
          </div>

          <div>
            <span className="font-semibold">
              Quantity:
            </span>

            <span className="ml-2">
              {reservation.quantity}
            </span>
          </div>

          <div>
            <span className="font-semibold">
              Status:
            </span>

            <span className="ml-2 capitalize">
              {reservation.status}
            </span>
          </div>

          {
            reservation.status === "pending" && (

              <div>
                <span className="font-semibold">
                  Time Left:
                </span>

                <span className="ml-2 text-red-600 font-bold">
                  {timeLeft}
                </span>
              </div>
            )
          }

        </div>

        {
          reservation.status === "pending" && (

            <div className="flex gap-4 mt-8">

              <button

                onClick={confirmReservation}

                className="bg-green-600 text-white px-6 py-3 rounded-lg"
              >
                Confirm Purchase
              </button>

              <button

                onClick={cancelReservation}

                className="bg-red-600 text-white px-6 py-3 rounded-lg"
              >
                Cancel
              </button>

            </div>
          )
        }

        {flag && <button

          onClick={() => navigate("/products")}

          className="mt-8 bg-black text-white px-6 py-3 rounded-lg"
        >
          Back to Products
        </button>}

      </div>

    </div>
  );
}

export default ReservationPage;