import { useNavigate } from "react-router-dom";

function LandingPage() {

  const navigate = useNavigate();

  const users = [
    {
      id: 1,
      name: "Alice"
    },
    {
      id: 2,
      name: "Bob"
    },
    {
      id: 3,
      name: "Charlie"
    }
  ];

  const selectUser = (user) => {

    localStorage.setItem(
      "user",
      JSON.stringify(user)
    );

    navigate("/products");
  };

  return (

    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="bg-white p-8 rounded-xl shadow-md w-96">

        <h1 className="text-2xl font-bold mb-6 text-center">
          Select User
        </h1>

        <div className="space-y-4">

          {
            users.map((user) => (

              <button
                key={user.id}

                onClick={() => selectUser(user)}

                className="w-full bg-black text-white py-3 rounded-lg hover:opacity-90"
              >
                {user.name}
              </button>
            ))
          }

        </div>

      </div>

    </div>
  );
}

export default LandingPage;